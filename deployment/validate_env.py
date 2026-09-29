"""Validate resolved Compose configuration without printing credentials (Python 3 stdlib)."""
import argparse
import base64
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlparse


def validate(config):
    errors = []
    env = config['services']['backend']['environment']
    mysql = config['services']['mysql']['environment']

    def require(*keys):
        for key in keys:
            if not str(env.get(key) or '').strip():
                errors.append(key + ' is required')

    require('DB_PASSWORD', 'JWT_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET',
            'FACEBOOK_CLIENT_ID', 'FACEBOOK_CLIENT_SECRET', 'PAYOS_CLIENT_ID',
            'PAYOS_API_KEY', 'PAYOS_CHECKSUM_KEY')
    for key, expected in [('DB_URL', 'jdbc:mysql://mysql:3306/chinese_online_learning'),
                          ('DB_USERNAME', 'chinese_app'), ('SERVER_PORT', '8081'),
                          ('SPRING_PROFILES_ACTIVE', 'docker')]:
        if str(env.get(key)) != expected:
            errors.append(key + ' does not match the Docker topology')
    if mysql.get('MYSQL_USER') != 'chinese_app' or mysql.get('MYSQL_DATABASE') != 'chinese_online_learning':
        errors.append('MySQL database/user must match the Docker topology')
    if mysql.get('MYSQL_PASSWORD') != env.get('DB_PASSWORD'):
        errors.append('Backend and MySQL application passwords differ')
    if mysql.get('MYSQL_PASSWORD') == mysql.get('MYSQL_ROOT_PASSWORD'):
        errors.append('Use different root and application passwords')
    try:
        if len(base64.b64decode(env.get('JWT_SECRET', ''), validate=True)) < 32:
            raise ValueError()
    except (ValueError, TypeError):
        errors.append('JWT_SECRET must encode at least 32 bytes in Base64')
    # Java Duration supports days/hours/minutes/seconds, not calendar months/years.
    duration = re.compile(r'^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$')
    for key in ('JWT_ACCESS_TTL', 'JWT_REFRESH_TTL'):
        match = duration.fullmatch(str(env.get(key, '')))
        if not match or not any(float(v or 0) > 0 for v in match.groups()):
            errors.append(key + ' must be a positive ISO-8601 Duration, e.g. PT15M/P30D')
    provider = env.get('MAIL_PROVIDER')
    if provider == 'smtp':
        require('SMTP_HOST', 'MAIL_FROM_EMAIL')
        if str(env.get('SMTP_AUTH', 'true')).lower() == 'true':
            require('SMTP_USERNAME', 'SMTP_PASSWORD')
        try:
            if not 1 <= int(env.get('SMTP_PORT', 0)) <= 65535:
                raise ValueError()
        except (ValueError, TypeError):
            errors.append('SMTP_PORT must be a valid TCP port')
        for key in ('SMTP_AUTH', 'SMTP_STARTTLS_ENABLE'):
            if str(env.get(key)).lower() not in ('true', 'false'):
                errors.append(key + ' must be true or false')
    elif provider == 'resend':
        require('RESEND_API_KEY', 'RESEND_FROM_EMAIL')
    else:
        errors.append('MAIL_PROVIDER must be smtp or resend')
    for key in ('OAUTH2_FRONTEND_REDIRECT_URI', 'FRONTEND_VERIFY_EMAIL_URL',
                'FRONTEND_PAYMENT_RESULT_URL', 'PAYOS_CREATE_PAYMENT_URL',
                'PAYOS_PAYMENT_REQUEST_URL', 'RESEND_BASE_URL'):
        url = urlparse(str(env.get(key, '')))
        if url.scheme not in ('http', 'https') or not url.hostname or url.username or url.fragment:
            errors.append(key + ' must be an absolute HTTP(S) URL without credentials/fragment')
        if url.hostname in ('localhost', '127.0.0.1', '0.0.0.0'):
            errors.append(key + ' cannot use a local host in Docker deployment')
        if key == 'FRONTEND_PAYMENT_RESULT_URL' and url.query:
            errors.append(key + ' must not contain a query; the service appends one')
    for origin in str(env.get('CORS_ALLOWED_ORIGINS', '')).split(','):
        url = urlparse(origin.strip())
        if url.scheme not in ('http', 'https') or not url.hostname or url.path or url.query or url.fragment:
            errors.append('CORS_ALLOWED_ORIGINS must contain exact origins without paths/wildcards')
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--env-file', default='.env')
    args = parser.parse_args()
    # Check names only; never echo values or execute dotenv as shell code.
    names = []
    supplied = {}
    errors = []
    for line in Path(args.env_file).read_text(encoding='utf-8-sig').splitlines():
        match = re.match(r'\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)', line)
        if match:
            key, value = match.groups()
            if key in names:
                errors.append(key + ' is duplicated in the env file')
            names.append(key)
            supplied[key] = value.strip().strip('\"\'')
            expected = {'MYSQL_USER': 'chinese_app', 'MYSQL_DATABASE': 'chinese_online_learning', 'SERVER_PORT': '8081'}.get(key)
            if expected and value.strip().strip('\"\'') != expected:
                errors.append(key + ' conflicts with fixed Docker topology')
    # Report ALL missing Compose-required names together before interpolation stops at one.
    required = set(re.findall(r'\$\{([A-Z_][A-Z0-9_]*):\?', Path('docker-compose.yml').read_text()))
    for key in sorted(required):
        if not os.environ.get(key, supplied.get(key, '')).strip():
            errors.append(key + ' is required by Compose')
    command = ['docker', 'compose', '--env-file', args.env_file, 'config', '--format', 'json']
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode:
        # Compose stderr can contain interpolation input: suppress values entirely.
        errors.append('Compose config failed. Check all required keys in .env.example; run docker compose config --quiet locally.')
    else:
        errors.extend(validate(json.loads(result.stdout)))
    if errors:
        print('\n'.join('ERROR: ' + error for error in errors))
        return 1
    print('Deployment configuration valid; no credentials printed. Runtime/provider checks still required.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
