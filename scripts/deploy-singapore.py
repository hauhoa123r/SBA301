#!/usr/bin/env python3
"""Update application images only; never manage MySQL or initialize SQL."""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

BASE = Path('/home/ubuntu/.edujar-migration/final-20261024')
MYSQL = 'edujar-mysql-rehearsal'
BACKEND = 'edujar-backend-rehearsal'
NGINX = 'edujar-nginx-rehearsal'

def run(args, data=None):
    p = subprocess.run(args, input=data, capture_output=True, timeout=300)
    if p.returncode:
        raise RuntimeError('Command failed; output withheld to protect environment values')
    return p.stdout

def docker(*args, data=None):
    return run(['sudo', '-n', 'docker', *args], data)

def inspect(name):
    return json.loads(docker('inspect', name))[0]

def image_ref(value, repository):
    if not re.fullmatch(re.escape(repository) + r':sg-[a-f0-9]{12}-[0-9]+', value):
        raise ValueError('Expected a commit/build-specific Singapore image tag')
    return value

def validate_service(config, service):
    if set(config.get('services', {})) != {service}:
        raise ValueError('Application Compose must contain exactly one approved service')
    svc = config['services'][service]
    if svc.get('build') or any(v.get('type') == 'volume' for v in svc.get('volumes', [])):
        raise ValueError('Builds and named database volumes are forbidden in app deployment')
    if service == 'backend':
        e = svc['environment']
        if e.get('SPRING_JPA_HIBERNATE_DDL_AUTO') != 'validate' or e.get('SPRING_SQL_INIT_MODE') != 'never' or str(e.get('ACTIVITY_LAB_ENABLED')).lower() != 'false':
            raise ValueError('Backend schema/scheduler policy mismatch')
        if any(p.get('host_ip') != '127.0.0.1' for p in svc.get('ports', [])):
            raise ValueError('Backend must not publish a public listener')
    return svc

def protected_mysql():
    i = inspect(MYSQL)
    if i['State']['Health']['Status'] != 'healthy' or any(i['NetworkSettings']['Ports'].values()):
        raise RuntimeError('MySQL unhealthy or publicly published')
    return {k: i[k] for k in ['Id', 'Image', 'Mounts']}

def schema_guard(path):
    if not path.is_file():
        raise RuntimeError('Read-only schema guard is missing')
    result = docker('exec', '-i', MYSQL, 'mysql', '--defaults-extra-file=/run/secrets/mysql_app_client',
                    '--database=chinese_online_learning', '--batch', '--raw', '--skip-column-names', data=path.read_bytes())
    if result.strip():
        raise RuntimeError('Schema incompatibility; deployment stopped without migrations')

def compose(service, *args, override=None):
    name = 'compose.backend.production.yml' if service == 'backend' else 'compose.nginx.yml'
    project = 'edujar-sg-backend-rehearsal' if service == 'backend' else 'edujar-sg-frontend-rehearsal'
    cmd = ['compose', '-p', project, '-f', str(BASE / name)]
    if override:
        cmd += ['-f', str(override)]
    return docker(*cmd, *args)

def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument('--check-only', action='store_true')
    parser.add_argument('--backend-image')
    parser.add_argument('--nginx-image')
    parser.add_argument('--revision')
    parser.add_argument('--guard', type=Path, required=True)
    args = parser.parse_args(argv)
    before = protected_mysql()
    for service in ['backend', 'nginx']:
        compose(service, 'config', '--quiet')
        validate_service(json.loads(compose(service, 'config', '--format', 'json')), service)
    schema_guard(args.guard)
    if args.check_only:
        print('Singapore application-only preflight PASS; schema guard clear; no changes')
        return
    if not args.revision or not re.fullmatch('[a-f0-9]{40}', args.revision):
        raise ValueError('A full reviewed source revision is required')
    refs = {'backend': image_ref(args.backend_image or '', 'devhoa/chinese-backend'),
            'nginx': image_ref(args.nginx_image or '', 'devhoa/chinese-nginx')}
    selected = {}
    overrides = {}
    for service, ref in refs.items():
        docker('pull', ref)
        image = json.loads(docker('image', 'inspect', ref))[0]
        if image['Config']['Labels'].get('org.opencontainers.image.revision') != args.revision:
            raise RuntimeError('Pulled image revision does not match the requested release')
        if service == 'nginx':
            version = dict(v.split('=', 1) for v in image['Config']['Env']).get('NGINX_VERSION', '')
            if tuple(int(v) for v in version.split('.')) < (1, 30, 6):
                raise RuntimeError('Nginx security version below approved baseline')
        selected[service] = image['Id']
        overrides[service] = BASE / ('ci-' + service + '-image.json')
        overrides[service].write_text(json.dumps({'services': {service: {'image': ref, 'pull_policy': 'never'}}}))
        overrides[service].chmod(0o600)
    # Syntax test with the actual certificate/config mounts, without publishing ports.
    compose('nginx', 'run', '--rm', '--no-deps', '--entrypoint', 'nginx', 'nginx', '-t', override=overrides['nginx'])
    for service, name in [('backend', BACKEND), ('nginx', NGINX)]:
        compose(service, 'up', '-d', '--no-deps', '--no-build', '--pull', 'never', '--wait', '--wait-timeout', '240', service, override=overrides[service])
        if inspect(name)['Image'] != selected[service]:
            raise RuntimeError('Running application image mismatch')
    if protected_mysql() != before:
        raise RuntimeError('Protected MySQL identity changed unexpectedly')
    schema_guard(args.guard)
    health = run(['curl', '--fail', '--silent', '--show-error', '--resolve', 'edujar.site:443:127.0.0.1', 'https://edujar.site/api/actuator/health'])
    if json.loads(health) != {'status': 'UP'}:
        raise RuntimeError('HTTPS backend readiness failed')
    print('Singapore application deployment PASS; HTTPS UP; MySQL preserved')

if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(type(error).__name__ + ': ' + str(error), file=sys.stderr)
        raise SystemExit(1)
