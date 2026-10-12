FROM mysql:8.0

COPY chinese_online_learning.sql /docker-entrypoint-initdb.d/01-schema.sql
COPY DataChinese.sql /docker-entrypoint-initdb.d/02-data.sql
COPY 20261012_deploy_update.sql /docker-entrypoint-initdb.d/03-deploy-update.sql

COPY my.cnf /etc/mysql/conf.d/my.cnf
