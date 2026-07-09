FROM mysql:8.0

COPY chinese_online_learning.sql /docker-entrypoint-initdb.d/01-schema.sql
COPY DataChinese.sql /docker-entrypoint-initdb.d/02-data.sql

COPY my.cnf /etc/mysql/conf.d/my.cnf