-- Existing databases only. Does not alter courses, invoices or purchased access.
SET NAMES utf8mb4;
USE chinese_online_learning;
START TRANSACTION;

INSERT INTO subscription_plans (code,name,price,duration_days,active)
VALUES ('FREE_TRIAL','Free',0.00,3,TRUE)
ON DUPLICATE KEY UPDATE name='Free',price=0.00,duration_days=3,active=TRUE;

INSERT INTO subscription_plans (code,name,price,duration_days,active)
VALUES ('PREMIUM','Premium',99000.00,30,TRUE)
ON DUPLICATE KEY UPDATE name='Premium',price=99000.00,duration_days=30,active=TRUE;

UPDATE subscription_plans SET active=FALSE WHERE code='STANDARD';
COMMIT;
