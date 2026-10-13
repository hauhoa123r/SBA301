# Historical release tests

These two `.txt` files preserve the former test sources for the discontinued
Python release/version/rollback framework. They are documentation snapshots,
not discovered executable tests. The production deployer they tested was removed.

Active replacements live in `deployment/tests/test_app_deploy.py` and
`deployment/tests/test_compose_images.py`. They verify manual EC2 tags, independent
MySQL tags, read-only schema failure handling, image identity, health/HTTPS failure
handling, unchanged secrets/monitoring, SSH upload scope and shell syntax.

Backend, frontend, database and classpath schema regression tests are unchanged.
See [the current workflow](../SIMPLE_CICD.md).
