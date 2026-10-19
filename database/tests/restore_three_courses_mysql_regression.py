"""Test the course restoration on a private MySQL, optionally from a local backup."""
import argparse
import json
from pathlib import Path
from private_mysql import ROOT, private_mysql


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--backup", type=Path)
    args = parser.parse_args()
    with private_mysql() as (sql, run, client, target, port, verify):
        if args.backup:
            sql("CREATE DATABASE chinese_online_learning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
            run(client + ["chinese_online_learning"], input=args.backup.read_bytes())
        else:
            for name in ("schema.sql", "data.sql"):
                run(client, input=(ROOT / "database" / name).read_bytes())

        def query(statement):
            return sql("USE chinese_online_learning; " + statement)

        tables = query("SHOW TABLES;").splitlines()
        unchanged = [t for t in tables if t not in ("courses", "chapters", "quizzes", "course_enrollments", "users")]
        checksum = "CHECKSUM TABLE " + ",".join("`" + t + "`" for t in unchanged) + ";"
        before = query(checksum)
        lessons = query("SELECT id,chapter_id FROM lessons ORDER BY id;")
        chapters = query("SELECT id,title FROM chapters ORDER BY id;")
        old_enrollments = query("SELECT * FROM course_enrollments ORDER BY id;").splitlines()
        old_users = query("SELECT * FROM users WHERE email<>'catalog-instructor@seed.invalid' ORDER BY id;")
        expected_titles = {"Tiếng Trung tại quán cà phê": 2, "Tiếng Trung hỏi đường và đi lại": 2,
                           "Tiếng Trung giao tiếp cho Nhân viên Sales (Cơ bản)": 6}
        migration = (ROOT / "deployment/legacy-sql/20261019_restore_three_courses.sql").read_bytes()
        first = None
        for _ in range(2):
            verify()
            run(client, input=migration)
            assert query(checksum) == before, "Unrelated data changed"
            assert query("SELECT id,chapter_id FROM lessons ORDER BY id;") == lessons, "Lesson IDs changed"
            assert query("SELECT id,title FROM chapters ORDER BY id;") == chapters, "Chapter IDs changed"
            assert set(old_enrollments) <= set(query("SELECT * FROM course_enrollments ORDER BY id;").splitlines())
            assert query("SELECT * FROM users WHERE email<>'catalog-instructor@seed.invalid' ORDER BY id;") == old_users
            catalog = query("""SELECT c.title,COUNT(l.id) FROM courses c
                LEFT JOIN chapters ch ON ch.course_id=c.id LEFT JOIN lessons l ON l.chapter_id=ch.id
                WHERE c.status='PUBLISHED' GROUP BY c.id ORDER BY c.id;""")
            assert {row.split("\t")[0]: int(row.split("\t")[1]) for row in catalog.splitlines()} == expected_titles, catalog
            assert query("""SELECT COUNT(*) FROM quizzes q JOIN lessons l ON l.id=q.lesson_id
                JOIN chapters ch ON ch.id=l.chapter_id WHERE q.course_id IS NOT NULL AND q.course_id<>ch.course_id;""") == "0"
            # Everyone owning the retired merged course must still own each restored original.
            assert query("""SELECT COUNT(*) FROM course_enrollments e JOIN courses c ON c.id=e.course_id
                CROSS JOIN courses t LEFT JOIN course_enrollments restored ON restored.user_id=e.user_id AND restored.course_id=t.id
                WHERE c.catalog_code='PREMIUM' AND e.legacy_access=TRUE AND t.status='PUBLISHED'
                AND (restored.id IS NULL OR restored.legacy_access=FALSE);""") == "0"
            after = query("CHECKSUM TABLE " + ",".join("`" + t + "`" for t in tables) + ";")
            if first is None:
                first = after
            else:
                assert after == first, "Repeated migration changed persisted data"

        # A missing original chapter must fail without leaving any partial persistent changes.
        query("UPDATE chapters SET title=CONCAT(title,' missing-fixture') WHERE title='Gọi đồ uống và thanh toán';")
        before_failure = query("CHECKSUM TABLE " + ",".join("`" + t + "`" for t in tables) + ";")
        try:
            run(client, input=migration)
        except RuntimeError:
            pass
        else:
            raise AssertionError("Ambiguous/missing source did not stop restoration")
        assert query("CHECKSUM TABLE " + ",".join("`" + t + "`" for t in tables) + ";") == before_failure
        result = dict(result="PASS", source="local backup" if args.backup else "fresh seed",
                      courses=3, lesson_counts=[2, 2, 6], unchanged_tables=len(unchanged),
                      repeat_safe=True, failure_rollback=True, lesson_chapter_ids_preserved=True, artifacts=str(target))
        (target / "result.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
        print(json.dumps(result))


if __name__ == "__main__":
    main()
