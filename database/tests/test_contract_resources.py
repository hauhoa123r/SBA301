"""The packaged test contract must match the reviewed database contract exactly."""
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]


class ContractResourceTest(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="contract-resource-")
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.database = self.root / "database"
        self.database.mkdir()
        for name in ("generate-schema-check.py", "jpa-schema-contract.tsv",
                     "native-schema-contract.tsv", "check-schema.sql"):
            shutil.copyfile(ROOT / "database" / name, self.database / name)
        self.resource = self.root / "backend/src/test/resources/schema/jpa-schema-contract.tsv"
        self.resource.parent.mkdir(parents=True)
        shutil.copyfile(self.database / "jpa-schema-contract.tsv", self.resource)
        self.cwd = self.root / "unrelated-working-directory"
        self.cwd.mkdir()

    def generate(self, *args):
        return subprocess.run([sys.executable, str(self.database / "generate-schema-check.py"), *args],
                              cwd=self.cwd, text=True, capture_output=True, timeout=15)

    def test_check_accepts_identical_copy_from_unrelated_cwd(self):
        result = self.generate("--check")
        self.assertEqual(0, result.returncode, result.stderr)

    def test_check_rejects_missing_classpath_resource(self):
        self.resource.unlink()
        result = self.generate("--check")
        self.assertNotEqual(0, result.returncode)
        self.assertIn("Classpath JPA contract is missing or stale", result.stderr)

    def test_check_rejects_stale_classpath_contract(self):
        rows = self.resource.read_text().splitlines(keepends=True)
        self.resource.write_text("".join(row for row in rows
                                         if not row.startswith("COLUMN\tlesson_progress\tposition_seconds\t")))
        result = self.generate("--check")
        self.assertNotEqual(0, result.returncode)
        self.assertIn("Classpath JPA contract is missing or stale", result.stderr)

    def test_generator_syncs_bytes_without_changing_sql_or_source_contract(self):
        contract_before = (self.database / "jpa-schema-contract.tsv").read_bytes()
        sql_before = (self.database / "check-schema.sql").read_bytes()
        self.resource.write_text("stale copy\n")
        result = self.generate()
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertEqual(contract_before, self.resource.read_bytes())
        self.assertEqual(contract_before, (self.database / "jpa-schema-contract.tsv").read_bytes())
        self.assertEqual(sql_before, (self.database / "check-schema.sql").read_bytes())
        self.assertEqual(0, self.generate("--check").returncode)

    def test_generator_recreates_missing_sql_and_test_resource(self):
        expected_sql = (self.database / "check-schema.sql").read_text()
        (self.database / "check-schema.sql").unlink()
        self.resource.unlink()
        result = self.generate()
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertEqual(expected_sql, (self.database / "check-schema.sql").read_text())
        self.assertEqual((self.database / "jpa-schema-contract.tsv").read_bytes(), self.resource.read_bytes())
        self.assertEqual(0, self.generate("--check").returncode)
