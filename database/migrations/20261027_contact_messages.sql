-- Contact inbox; additive migration only. Apply explicitly before deploying the new backend.
-- No seed, edits to existing tables, or automatic startup execution.
CREATE TABLE `contact_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(254) COLLATE utf8mb4_unicode_ci NOT NULL,
  `topic` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` varchar(5000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NEW',
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_contact_created` (`created_at`,`id`),
  KEY `idx_contact_status_created` (`status`,`created_at`,`id`),
  CONSTRAINT `chk_contact_status` CHECK ((`status` in (_utf8mb4'NEW',_utf8mb4'RESOLVED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
