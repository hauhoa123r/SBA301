FROM mysql:8.0

COPY chinese_online_learning.sql /docker-entrypoint-initdb.d/01-schema.sql
COPY DataChinese.sql /docker-entrypoint-initdb.d/02-data.sql
COPY 20260928_add_reading_courses.sql /docker-entrypoint-initdb.d/03-reading-courses.sql
COPY 20261003_admin_dashboard_indexes.sql /docker-entrypoint-initdb.d/04-dashboard-indexes.sql

COPY my.cnf /etc/mysql/conf.d/my.cnf
