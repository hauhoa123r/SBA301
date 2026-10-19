"""CI failures must expose the failed test or Maven crash in the Jenkins console."""
import contextlib
import io
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import xml.etree.ElementTree as ET

from fresh_initialization import backend_checks, check_maven_result


class MavenFailureReportingTest(unittest.TestCase):
    def test_backend_keeps_a_fake_webhook_key_without_real_gateway_credentials(self):
        class InvocationCaptured(Exception):
            pass

        captured = {}

        def capture(command, **kwargs):
            captured.update(kwargs["env"])
            raise InvocationCaptured()

        with tempfile.TemporaryDirectory() as directory, patch.dict("os.environ", {
            "PAYOS_CHECKSUM_KEY": "external-key-must-not-leak",
            "PAYOS_CLIENT_ID": "external-client",
            "PAYOS_API_KEY": "external-api-key",
            "PAYOS_CREATE_PAYMENT_URL": "https://example.test/real-gateway",
        }), patch("fresh_initialization.subprocess.run", side_effect=capture):
            with self.assertRaises(InvocationCaptured):
                backend_checks(Path(directory), 33087, "test-db-password", "/var/lib/mysql")
        self.assertTrue(captured["PAYOS_CHECKSUM_KEY"], "Blank keys break local webhook verification")
        self.assertNotEqual("external-key-must-not-leak", captured["PAYOS_CHECKSUM_KEY"])
        self.assertEqual("", captured["PAYOS_CLIENT_ID"])
        self.assertEqual("", captured["PAYOS_API_KEY"])
        for key in ("PAYOS_CREATE_PAYMENT_URL", "PAYOS_PAYMENT_REQUEST_URL"):
            self.assertTrue(captured[key].startswith("http://127.0.0.1:9/"))

    def test_success_does_not_dump_the_log(self):
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            check_maven_result(0, [ET.Element("testsuite")], {"failures": 0, "errors": 0}, Path("unused"))
        self.assertEqual("", output.getvalue())

    def test_failed_test_exposes_name_and_cause_even_when_log_tail_does_not(self):
        report = ET.fromstring('''<testsuite name="CatalogTest"><testcase classname="CatalogTest" name="access">
            <error message="Connection refused">java.sql.SQLException: Connection refused</error>
            </testcase></testsuite>''')
        with tempfile.TemporaryDirectory() as directory:
            log = Path(directory) / "maven.log"
            log.write_text("\n".join(["irrelevant"] * 110 + ["BUILD FAILURE"]), encoding="utf-8")
            output = io.StringIO()
            with contextlib.redirect_stdout(output), self.assertRaises(RuntimeError):
                check_maven_result(1, [report], {"tests": 1, "failures": 0, "errors": 1, "skipped": 0}, log)
            self.assertIn("FAILED CatalogTest.access: Connection refused", output.getvalue())
            self.assertIn("BUILD FAILURE", output.getvalue())

    def test_maven_crash_without_reports_exposes_log_and_still_fails(self):
        with tempfile.TemporaryDirectory() as directory:
            log = Path(directory) / "maven.log"
            log.write_text("The forked VM terminated without properly saying goodbye", encoding="utf-8")
            output = io.StringIO()
            with contextlib.redirect_stdout(output), self.assertRaises(RuntimeError):
                check_maven_result(137, [], {"tests": 0, "failures": 0, "errors": 0, "skipped": 0}, log)
            self.assertIn("Maven exit=137", output.getvalue())
            self.assertIn("forked VM terminated", output.getvalue())


if __name__ == "__main__":
    unittest.main()
