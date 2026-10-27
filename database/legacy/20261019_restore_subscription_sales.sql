-- Superseded: use 20261019_free_premium_plans.sql for the current two-plan offering.
-- Historical rollback only; re-enables the retired Standard offering.
-- Additive: does not remove courses, enrollments, invoices, payments, sessions or progress.
USE chinese_online_learning;
INSERT INTO subscription_plans (code,name,price,duration_days,active) VALUES
('FREE_TRIAL','Free Trial',0.00,3,TRUE),
('STANDARD','Standard',699000.00,30,TRUE),
('PREMIUM','Premium',899000.00,30,TRUE)
ON DUPLICATE KEY UPDATE active=TRUE;
