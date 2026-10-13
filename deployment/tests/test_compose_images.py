"""Read-only checks of the real Compose configuration; no Docker engine needed.

The former release transaction tests are preserved in docs/deployment/archive.
"""
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
DOCKER = shutil.which("docker")


@unittest.skipUnless(DOCKER, "Docker Compose CLI required")
class ComposeImagesTest(unittest.TestCase):
    def config(self, app="22", mysql="21", extra="", monitoring=False):
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            required = set(re.findall(r"\$\{([A-Z0-9_]+):\?", (ROOT / "docker-compose.yml").read_text()))
            values = {key: "fixture-value" for key in required}
            values.update(IMAGE_TAG=app, MYSQL_IMAGE_TAG=mysql)
            env_file = directory / ".env"
            env_file.write_text("".join(f"{key}={value}\n" for key, value in values.items()
                                        if value is not None) + extra)
            env = os.environ.copy()
            for key in required | {"COMPOSE_FILE", "BACKEND_IMAGE_TAG", "NGINX_IMAGE_TAG"}:
                env.pop(key, None)
            plugin_dir = Path(DOCKER).resolve().parent.parent / "cli-plugins"
            docker_config = directory / "docker-config"
            docker_config.mkdir()
            (docker_config / "config.json").write_text(json.dumps(
                {"cliPluginsExtraDirs": [str(plugin_dir)]} if plugin_dir.exists() else {}))
            env["DOCKER_CONFIG"] = str(docker_config)
            command = [DOCKER, "compose", "--env-file", str(env_file), "-f", str(ROOT / "docker-compose.yml")]
            if monitoring:
                override = directory / "monitoring.yml"
                override.write_text("services:\n  prometheus:\n    image: prom/prometheus:v3.0.0\n"
                                    "    volumes: [metrics:/prometheus]\n"
                                    "  grafana:\n    image: grafana/grafana:11.3.0\n"
                                    "    volumes: [dashboards:/var/lib/grafana]\n"
                                    "volumes:\n  metrics:\n  dashboards:\n")
                command += ["-f", str(override)]
            result = subprocess.run(command + ["config", "--format", "json"], env=env,
                                    capture_output=True, text=True, timeout=30)
            return result, json.loads(result.stdout) if result.returncode == 0 else None

    def test_backend_22_mysql_21(self):
        result, config = self.config()
        self.assertEqual(0, result.returncode, result.stderr)
        for service, tag in (("backend", "22"), ("nginx", "22"), ("mysql", "21")):
            self.assertEqual(f"devhoa/chinese-{service}:{tag}", config["services"][service]["image"])

    def test_application_tag_does_not_upgrade_mysql(self):
        result, config = self.config(app="23")
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertEqual("devhoa/chinese-mysql:21", config["services"]["mysql"]["image"])
        self.assertEqual("devhoa/chinese-backend:23", config["services"]["backend"]["image"])

    def test_mysql_requires_its_own_tag(self):
        result, _ = self.config(mysql=None)
        self.assertNotEqual(0, result.returncode)
        self.assertIn("MYSQL_IMAGE_TAG", result.stderr)

    def test_obsolete_application_overrides_are_ignored(self):
        result, config = self.config(extra="BACKEND_IMAGE_TAG=10\nNGINX_IMAGE_TAG=11\n")
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertEqual("devhoa/chinese-backend:22", config["services"]["backend"]["image"])
        self.assertEqual("devhoa/chinese-nginx:22", config["services"]["nginx"]["image"])

    def test_healthchecks_mounts_and_monitoring_volumes_remain(self):
        result, config = self.config(monitoring=True)
        self.assertEqual(0, result.returncode, result.stderr)
        services = config["services"]
        for service in ("mysql", "backend", "nginx"):
            self.assertIn("healthcheck", services[service])
        mysql_mount = services["mysql"]["volumes"][0]
        self.assertEqual(("volume", "mysql_data", "/var/lib/mysql"),
                         (mysql_mount["type"], mysql_mount["source"], mysql_mount["target"]))
        self.assertTrue(any(m["target"] == "/etc/letsencrypt" and m["read_only"]
                            for m in services["nginx"]["volumes"]))
        self.assertEqual({"mysql_data", "metrics", "dashboards"}, set(config["volumes"]))
        self.assertIn("prometheus", services)
        self.assertIn("grafana", services)
