#!/usr/bin/env python3
"""Immutable releases; never logs configuration or rewrites the secrets file.

Only Docker Compose itself reads .env. Captured config JSON is never logged.
Application rollout cannot recreate MySQL/monitoring or delete any volume.
"""
import argparse
from contextlib import contextmanager
import copy
import hashlib
import json
import os
from pathlib import Path
import re
import signal
import subprocess
import sys
import tempfile

REPOS = {"backend": "devhoa/chinese-backend", "nginx": "devhoa/chinese-nginx",
         "mysql": "devhoa/chinese-mysql"}
CONTAINERS = {service: "chinese-" + service for service in REPOS}
ID_PATTERN = re.compile(r"sha256:[a-f0-9]{64}\Z")
TAG_PATTERN = re.compile(r"[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}\Z")


class ReleaseError(RuntimeError):
    pass


def require(condition, message):
    if not condition:
        raise ReleaseError(message)


def valid_tag(tag):
    require(isinstance(tag, str) and TAG_PATTERN.fullmatch(tag) and tag.lower() != "latest",
            "Explicit non-latest image tag is required")
    return tag


def command(args, *, env=None, data=None, cwd=None):
    result = subprocess.run([str(a) for a in args], input=data, text=True,
                            capture_output=True, env=env, cwd=cwd)
    # Do not dump Compose config/environment or arbitrary application logs.
    require(result.returncode == 0, f"{args[0]} {args[1]} failed (exit {result.returncode})")
    return result.stdout.strip()


def docker_json(*args):
    return json.loads(command(["docker", *args]))


def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def atomic_json(path, document):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix=path.name + ".", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as stream:
            json.dump(document, stream, indent=2, sort_keys=True)
            stream.write("\n")
            stream.flush()
            os.fsync(stream.fileno())
        os.chmod(temporary, 0o644)
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def validate_spec(service, spec, *, allow_local=False):
    valid_tag(spec["tag"])
    require(ID_PATTERN.fullmatch(spec["id"]), f"Invalid {service} image ID")
    ref = spec["ref"]
    pinned = re.fullmatch(re.escape(REPOS[service]) + r"@sha256:[a-f0-9]{64}", ref)
    require(pinned or (allow_local and ref == spec["id"]), f"Unpinned {service} image reference")
    if service == "nginx":
        require(re.fullmatch(r"[a-f0-9]{64}", spec["config_sha256"]), "Invalid Nginx checksum")


def record_build(tag, services, out):
    valid_tag(tag)
    record = {"image_tag": tag, "images": {}}
    if "backend" in services:
        record["backend_ddl_mode"] = "validate"
    for service in services:
        require(service in REPOS, "Unknown build service")
        image = docker_json("image", "inspect", REPOS[service] + ":" + tag)[0]
        record["images"][service] = {"tag": tag, "id": image["Id"]}
        if service == "nginx":
            checksum = command(["docker", "run", "--rm", "--entrypoint", "sha256sum",
                                image["Id"], "/etc/nginx/conf.d/default.conf"]).split()[0]
            expected = hashlib.sha256(Path("frontend/nginx.conf").read_bytes()).hexdigest()
            require(checksum == expected, "Built Nginx configuration differs from source")
            record["images"][service]["config_sha256"] = checksum
    atomic_json(out, record)


def prepare_release(record_path, out):
    record = read_json(record_path)
    valid_tag(record["image_tag"])
    for service, spec in record["images"].items():
        image = docker_json("image", "inspect", REPOS[service] + ":" + spec["tag"])[0]
        require(image["Id"] == spec["id"], f"{service} tag changed since build")
        digests = [ref for ref in image.get("RepoDigests", []) if ref.startswith(REPOS[service] + "@")]
        require(len(digests) == 1, f"Expected one pushed digest for {service}")
        spec["ref"] = digests[0]
        validate_spec(service, spec)
    atomic_json(out, record)


def compose_environment(version):
    # Shell variables outrank .env; set every tag/ref explicitly from validated
    # non-secret metadata, including the independently pinned MySQL version.
    env = os.environ.copy()
    env["IMAGE_TAG"] = valid_tag(version["image_tag"])
    ddl_mode = version.get("backend_ddl_mode", "none")
    require(ddl_mode in ("none", "validate"), "Automatic schema mutation is forbidden")
    env["BACKEND_DDL_MODE"] = ddl_mode
    for service, prefix in (("backend", "BACKEND"), ("nginx", "NGINX"), ("mysql", "MYSQL")):
        spec = version["images"][service]
        validate_spec(service, spec, allow_local=True)
        env[prefix + "_IMAGE_TAG"] = spec["tag"]
        env[prefix + "_IMAGE_REF"] = spec["ref"]
    return env


def http_smoke(local_origin=False):
    extra = ["--resolve", "edujar.site:443:127.0.0.1"] if local_origin else []
    for route in ("learning", "subscriptions", "api/actuator/health", "api/subscriptions/plans"):
        body = command(["curl", "--fail", "--silent", "--show-error", "--noproxy", "*",
                        "--connect-timeout", "5", "--max-time", "15", "--retry", "3",
                        "--retry-connrefused", *extra, "https://edujar.site/" + route])
        if route == "api/actuator/health":
            require(json.loads(body).get("status") == "UP", "Backend smoke health failed")
        elif route == "api/subscriptions/plans":
            require(isinstance(json.loads(body), list), "Plans endpoint did not return a JSON array")
        else:
            require("<html" in body.lower(), "SPA smoke response is not HTML")


@contextmanager
def deployment_lock(root):
    # EC2 Linux lock also protects against deployments from another Jenkins job.
    import fcntl
    with (root / "deployment/.release.lock").open("a") as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError as error:
            raise ReleaseError("Another deployment is running") from error
        yield


class Deployer:
    def __init__(self, root, payload):
        self.root = Path(root).resolve()
        self.payload = Path(payload).resolve()
        self.version_path = self.root / "deployment/versions.json"
        self.previous_path = self.root / "deployment/versions.previous.json"
        require((self.root / ".env").is_file(), "Existing EC2 .env is required")
        require((self.payload / "compose.production.yml").is_file(), "Production override missing")
        self.containers = {service: docker_json("inspect", name)[0] for service, name in CONTAINERS.items()}
        projects = {item["Config"]["Labels"].get("com.docker.compose.project")
                    for item in self.containers.values()}
        require(len(projects) == 1 and None not in projects, "Existing containers must share a Compose project")
        self.project = projects.pop()
        for item in self.containers.values():
            working_dir = item["Config"]["Labels"].get("com.docker.compose.project.working_dir")
            if working_dir:
                require(Path(working_dir).resolve() == self.root, "Deploy root differs from active Compose working directory")
        self.files = self.base_files(self.containers["nginx"])
        for item in self.containers.values():
            require(self.base_files(item) == self.files, "Containers use different Compose file sets")

    def base_files(self, container):
        label = container["Config"]["Labels"].get("com.docker.compose.project.config_files", "")
        require(label, "Missing active Compose file labels; review deployment configuration")
        files = []
        for value in label.split(","):
            path = Path(value).resolve()
            require(path.is_relative_to(self.root), "Compose file must remain inside deployment root")
            managed = path.is_relative_to(self.root / "deployment/releases") and path.name == "compose.production.yml"
            if not managed:
                require(path.is_file(), "Existing Compose file is missing")
                files.append(path)
        require(files, "Existing base Compose configuration is required")
        return files

    def compose(self, version, *args):
        cmd = ["docker", "compose", "--project-directory", self.root, "--project-name", self.project,
               "--env-file", self.root / ".env"]
        for file in self.files + [self.payload / "compose.production.yml"]:
            cmd += ["-f", file]
        return command(cmd + list(args), env=compose_environment(version), cwd=self.root)

    def effective(self, version):
        config = json.loads(self.compose(version, "config", "--format", "json"))
        for service in REPOS:
            ref = config["services"][service]["image"]
            require(ref == version["images"][service]["ref"], f"Effective Compose {service} image differs")
            print(f"Effective {service}: tag={version['images'][service]['tag']} image={ref}")
        return config

    def snapshot(self):
        if self.version_path.exists():
            version = read_json(self.version_path)
            compose_environment(version)
            for service, container in self.containers.items():
                require(container["Image"] == version["images"][service]["id"],
                        f"Running {service} differs from persisted version; investigate drift")
            return version
        # One-time bootstrap from running containers, never from stale .env tags.
        images = {}
        for service, container in self.containers.items():
            raw_ref = container["Config"]["Image"].split("@", 1)[0]
            tag = raw_ref.rsplit(":", 1)[-1] if ":" in raw_ref.rsplit("/", 1)[-1] else "pinned"
            valid_tag(tag)
            image = docker_json("image", "inspect", container["Image"])[0]
            refs = [ref for ref in image.get("RepoDigests", []) if ref.startswith(REPOS[service] + "@")]
            spec = {"tag": tag, "id": container["Image"], "ref": refs[0] if refs else container["Image"]}
            if service == "nginx":
                spec["config_sha256"] = command(["docker", "exec", container["Id"], "sha256sum",
                                               "/etc/nginx/conf.d/default.conf"]).split()[0]
            validate_spec(service, spec, allow_local=True)
            images[service] = spec
        backend_env = self.containers["backend"]["Config"].get("Env", [])
        ddl_mode = next((entry.split("=", 1)[1] for entry in backend_env
                         if entry.startswith("SPRING_JPA_HIBERNATE_DDL_AUTO=")), "none")
        version = {"image_tag": images["nginx"]["tag"], "images": images, "backend_ddl_mode": ddl_mode}
        compose_environment(version)
        return version

    def protected(self, changed_services):
        ids = command(["docker", "ps", "-aq", "--filter", "label=com.docker.compose.project=" + self.project]).split()
        state = {}
        if ids:
            for item in docker_json("inspect", *ids):
                service = item["Config"]["Labels"].get("com.docker.compose.service")
                if service not in changed_services:
                    state[item["Id"]] = item["Image"]
        return state

    def schema_check(self):
        sql = (self.payload / "check-schema.sql").read_text(encoding="utf-8")
        output = command(["docker", "exec", "-i", self.containers["mysql"]["Id"], "sh", "-c",
                          'MYSQL_PWD="$MYSQL_PASSWORD" mysql --protocol=SOCKET --user="$MYSQL_USER" '
                          '--database="$MYSQL_DATABASE" --batch --raw --skip-column-names'], data=sql)
        require(not output, "Current database is incompatible with this backend: " + output)

    def check_images(self, version, services, *, running=False):
        for service in services:
            spec = version["images"][service]
            image = docker_json("image", "inspect", spec["ref"])[0]
            require(image["Id"] == spec["id"], f"Pulled {service} differs from Jenkins build")
            if running:
                item = docker_json("inspect", CONTAINERS[service])[0]
                require(item["Image"] == spec["id"], f"Running {service} differs from Jenkins build")
                require(item["Config"]["Image"] == spec["ref"], f"Running {service} digest reference differs")
                require(item["State"]["Status"] == "running" and
                        item["State"].get("Health", {}).get("Status") == "healthy", f"{service} is not healthy")

    def smoke(self, version):
        spec = version["images"]["nginx"]
        command(["sh", self.payload / "verify-nginx-https.sh", spec["ref"], spec["id"], spec["config_sha256"]])
        # Local origin and public domain: validate certificates, HTTP codes and
        # a real DB-backed endpoint, not just an Actuator process response.
        http_smoke(local_origin=True)
        http_smoke()

    def check_mounts(self, services):
        for service in services:
            current = docker_json("inspect", CONTAINERS[service])[0]
            require(current["Mounts"] == self.containers[service]["Mounts"], f"{service} mounts changed")

    def up(self, version, services):
        for service in services:
            self.compose(version, "up", "-d", "--no-build", "--no-deps", "--pull", "never",
                         "--force-recreate", "--wait", "--wait-timeout", "180", service)

    def deploy_application(self, manifest, nginx_only=False):
        previous = self.snapshot()
        candidate = copy.deepcopy(previous)
        candidate["image_tag"] = valid_tag(manifest["image_tag"])
        services = ["nginx"] if nginx_only else ["backend", "nginx"]
        if not nginx_only:
            candidate["backend_ddl_mode"] = manifest.get("backend_ddl_mode", "validate")
        for service in services:
            validate_spec(service, manifest["images"][service])
            candidate["images"][service] = manifest["images"][service]
        protected = self.protected(services)
        before = self.effective(previous)
        after = self.effective(candidate)
        require(before.get("volumes") == after.get("volumes") and before.get("networks") == after.get("networks"),
                "Deployment would change volumes or networks")
        for service, spec in before["services"].items():
            require(spec.get("volumes") == after["services"][service].get("volumes"), f"Deployment would change {service} mounts")
            if service not in services:
                require(spec == after["services"][service], f"Deployment would change protected {service} configuration")
        if not nginx_only:
            self.schema_check()
        self.compose(candidate, "pull", *services)
        self.check_images(candidate, services)
        self.compose(candidate, "run", "--rm", "--no-deps", "--entrypoint", "nginx", "nginx", "-t")
        checksum = self.compose(candidate, "run", "--rm", "--no-deps", "--entrypoint", "sha256sum",
                                "nginx", "/etc/nginx/conf.d/default.conf").split()[0]
        require(checksum == candidate["images"]["nginx"]["config_sha256"], "Override hides image Nginx config")
        # Rollback uses locally cached IDs/digests, without pulling mutable tags.
        self.check_images(previous, services)
        atomic_json(self.previous_path, previous)
        try:
            self.up(candidate, services)
            self.check_images(candidate, services, running=True)
            self.check_mounts(services)
            self.effective(candidate)
            self.smoke(candidate)
            require(self.protected(services) == protected, "A protected container changed during app deployment")
            atomic_json(self.version_path, candidate)
            print("Application release committed; MySQL version unchanged")
        except BaseException:
            print("Application deployment failed; restoring previous application images", file=sys.stderr)
            try:
                self.up(previous, services)
                self.check_images(previous, services, running=True)
                self.check_mounts(services)
                atomic_json(self.version_path, previous)
                self.smoke(previous)
                require(self.protected(services) == protected, "Protected container changed during rollback")
                print("Previous application images restored", file=sys.stderr)
            except BaseException as rollback_error:
                print(f"ROLLBACK FAILED: {rollback_error}; operator intervention required", file=sys.stderr)
            raise

    def deploy_database(self, manifest, approval):
        require(approval["release_tag"] == manifest["image_tag"] and approval.get("approved_by") and
                re.fullmatch(r"[A-Za-z0-9_:/.-]{1,256}", approval.get("backup_reference", "")),
                "Explicit database approval with a backup reference is required")
        previous = self.snapshot()
        candidate = copy.deepcopy(previous)
        validate_spec("mysql", manifest["images"]["mysql"])
        candidate["images"]["mysql"] = manifest["images"]["mysql"]
        self.schema_check()  # New init SQL does NOT migrate an existing volume.
        before = self.effective(previous)
        after = self.effective(candidate)
        require(before.get("volumes") == after.get("volumes") and before.get("networks") == after.get("networks"),
                "Database upgrade would change volumes or networks")
        for service, spec in before["services"].items():
            require(spec.get("volumes") == after["services"][service].get("volumes"), f"Database upgrade would change {service} mounts")
            if service != "mysql":
                require(spec == after["services"][service], f"Database upgrade would change {service} configuration")
        self.compose(candidate, "pull", "mysql")
        self.check_images(candidate, ["mysql"])
        mounts = self.containers["mysql"]["Mounts"]
        protected = self.protected(["mysql"])
        self.up(candidate, ["mysql"])
        self.check_images(candidate, ["mysql"], running=True)
        current = docker_json("inspect", CONTAINERS["mysql"])[0]
        require(current["Mounts"] == mounts, "MySQL mounts changed")
        require(self.protected(["mysql"]) == protected, "Database upgrade changed another container")
        self.containers["mysql"] = current
        self.schema_check()
        self.effective(candidate)
        atomic_json(self.version_path, candidate)
        print("Approved MySQL image upgrade committed; existing volume retained")

    def rollback(self, expected_tag, nginx_only=False):
        require(self.snapshot()["image_tag"] == valid_tag(expected_tag),
                "Refusing to roll back a different release")
        # deploy_application preserves CURRENT MySQL, even if the previous app
        # release record refers to a database image used before a DB upgrade.
        self.deploy_application(read_json(self.previous_path), nginx_only)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="action", required=True)
    record = sub.add_parser("record-build")
    record.add_argument("--tag", required=True)
    record.add_argument("--services", nargs="+", required=True, choices=list(REPOS))
    record.add_argument("--out", required=True)
    prepare = sub.add_parser("prepare-release")
    prepare.add_argument("--build-record", required=True)
    prepare.add_argument("--out", required=True)
    sub.add_parser("smoke-public")
    for action in ("deploy", "deploy-database", "rollback", "compose"):
        cmd = sub.add_parser(action)
        cmd.add_argument("--root", required=True)
        cmd.add_argument("--payload", required=True)
        if action in ("deploy", "deploy-database"):
            cmd.add_argument("--manifest", required=True)
        if action == "deploy":
            cmd.add_argument("--nginx-only", action="store_true")
        if action == "deploy-database":
            cmd.add_argument("--approval", required=True)
        if action == "rollback":
            cmd.add_argument("--expected-tag", required=True)
            cmd.add_argument("--nginx-only", action="store_true")
        if action == "compose":
            cmd.add_argument("compose_args", nargs=argparse.REMAINDER)
    args = parser.parse_args()
    if args.action == "record-build":
        record_build(args.tag, args.services, args.out)
    elif args.action == "prepare-release":
        prepare_release(args.build_record, args.out)
    elif args.action == "smoke-public":
        http_smoke()
    else:
        for sig in (signal.SIGTERM, signal.SIGHUP) if hasattr(signal, "SIGHUP") else (signal.SIGTERM,):
            signal.signal(sig, lambda *_: (_ for _ in ()).throw(ReleaseError("Deployment interrupted")))
        root = Path(args.root).resolve()
        (root / "deployment").mkdir(exist_ok=True)
        with deployment_lock(root):
            deployer = Deployer(root, args.payload)
            if args.action == "deploy":
                deployer.deploy_application(read_json(args.manifest), args.nginx_only)
            elif args.action == "deploy-database":
                deployer.deploy_database(read_json(args.manifest), read_json(args.approval))
            elif args.action == "rollback":
                deployer.rollback(args.expected_tag, args.nginx_only)
            else:
                require(args.compose_args in ([], ["config", "--images"], ["ps"]), "Only image listing/ps allowed")
                version = read_json(deployer.version_path)
                output = deployer.compose(version, *(args.compose_args or ["config", "--images"]))
                print(output)


if __name__ == "__main__":
    try:
        main()
    except (ReleaseError, KeyError, ValueError, OSError) as error:
        print(f"Release failed: {error}", file=sys.stderr)
        sys.exit(1)
