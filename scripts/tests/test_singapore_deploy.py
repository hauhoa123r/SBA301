"""Safety rejection tests for application-only Singapore deployments."""
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('singapore_deploy', Path(__file__).parents[1] / 'deploy-singapore.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class SingaporeSafetyTest(unittest.TestCase):
    def test_no_latest_other_repository_or_shell_payload(self):
        for ref in ['devhoa/chinese-backend:latest', 'devhoa/chinese-mysql:sg-123456abcdef-1', 'devhoa/chinese-backend:sg-123456abcdef-1;id']:
            with self.subTest(ref=ref), self.assertRaises(ValueError):
                module.image_ref(ref, 'devhoa/chinese-backend')

    def test_explicit_release_tag(self):
        self.assertEqual('devhoa/chinese-backend:sg-123456abcdef-1', module.image_ref('devhoa/chinese-backend:sg-123456abcdef-1', 'devhoa/chinese-backend'))

    def test_extra_database_service_rejected(self):
        with self.assertRaises(ValueError):
            module.validate_service({'services': {'nginx': {}, 'mysql': {}}}, 'nginx')

    def test_named_volume_mount_rejected(self):
        with self.assertRaises(ValueError):
            module.validate_service({'services': {'nginx': {'volumes': [{'type': 'volume', 'source': 'mysql_data'}]}}}, 'nginx')

    def test_backend_seed_or_public_binding_rejected(self):
        svc = {'environment': {'SPRING_JPA_HIBERNATE_DDL_AUTO': 'validate', 'SPRING_SQL_INIT_MODE': 'never', 'ACTIVITY_LAB_ENABLED': 'false'}, 'ports': [{'host_ip': '0.0.0.0'}]}
        with self.assertRaises(ValueError):
            module.validate_service({'services': {'backend': svc}}, 'backend')
        svc['ports'] = [{'host_ip': '127.0.0.1'}]
        svc['environment']['SPRING_SQL_INIT_MODE'] = 'always'
        with self.assertRaises(ValueError):
            module.validate_service({'services': {'backend': svc}}, 'backend')

if __name__ == '__main__':
    unittest.main()
