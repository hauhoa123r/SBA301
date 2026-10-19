"""A new native MySQL 8 process, guarded by its unique datadir and private port."""
from contextlib import contextmanager
from pathlib import Path
import os
import socket
import subprocess
import time
import uuid

ROOT = Path(__file__).resolve().parents[2]


@contextmanager
def private_mysql(port=0, mysql_bin=None):
    binary = Path(mysql_bin or os.environ.get("MYSQL_BIN", "C:/Program Files/MySQL/MySQL Server 8.0/bin"))
    suffix = ".exe" if os.name == "nt" else ""
    target = ROOT / "backend/target" / ("consolidated-mysql-" + uuid.uuid4().hex)
    data = target / "data"
    data.mkdir(parents=True, exist_ok=False)
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", port))
        port = probe.getsockname()[1]
    env = os.environ.copy()
    env["MYSQL_PWD"] = ""
    server_args = [str(binary / ("mysqld" + suffix)), "--no-defaults", "--datadir=" + data.as_posix(),
                   "--port=" + str(port), "--bind-address=127.0.0.1", "--mysqlx=OFF", "--skip-log-bin",
                   "--default-time-zone=+00:00", "--console"]
    client = [str(binary / ("mysql" + suffix)), "--no-defaults", "--protocol=TCP", "--host=127.0.0.1",
              "--port=" + str(port), "--user=root", "--default-character-set=utf8mb4",
              "--batch", "--raw", "--skip-column-names"]

    def run(command, **kwargs):
        result = subprocess.run([str(a) for a in command], env=env, capture_output=True, timeout=120, **kwargs)
        if result.returncode:
            raise RuntimeError(result.stderr.decode("utf-8", errors="replace"))
        return result

    def sql(statement):
        return run(client, input=statement.encode("utf-8")).stdout.decode("utf-8").replace("\r\n", "\n").strip()

    def verify():
        assert Path(sql("SELECT @@datadir;")).resolve() == data.resolve(), "Not the private MySQL instance"

    run(server_args + ["--initialize-insecure"])
    ready = False
    with (target / "mysql.log").open("wb") as log:
        server = subprocess.Popen(server_args, env=env, stdout=log, stderr=subprocess.STDOUT,
                                  creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0)
        try:
            for _ in range(120):
                if server.poll() is not None:
                    raise RuntimeError("Private MySQL exited: " + str(target / "mysql.log"))
                try:
                    verify()
                    ready = True
                    break
                except RuntimeError:
                    time.sleep(0.5)
            assert ready, "Private MySQL did not become ready"
            assert sql("SELECT VERSION();").startswith("8."), "MySQL 8 is required"
            yield sql, run, client, target, port, verify
        finally:
            if ready:
                verify()
                run([binary / ("mysqladmin" + suffix), "--no-defaults", "--protocol=TCP",
                     "--host=127.0.0.1", "--port=" + str(port), "--user=root", "shutdown"])
            else:
                server.terminate()
            server.wait(timeout=30)
