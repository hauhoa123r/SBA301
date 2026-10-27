-- Explicit additive migration, no automatic execution or seed. Existing messages stay unlinked.
-- Apply once; do not replay by dropping columns or changing historical records.
ALTER TABLE contact_messages
  ADD COLUMN user_id bigint NULL,
  ADD COLUMN reply_text varchar(5000) COLLATE utf8mb4_unicode_ci NULL,
  ADD COLUMN replied_at datetime(6) NULL,
  ADD COLUMN replied_by bigint NULL,
  ADD KEY idx_contact_user (user_id),
  ADD KEY fk_contact_reply_actor (replied_by),
  ADD CONSTRAINT fk_contact_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_contact_reply_actor FOREIGN KEY (replied_by) REFERENCES users (id) ON DELETE SET NULL;
