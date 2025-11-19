-- ===========================================
-- database/setup.sql
-- One-time MySQL setup for local development
-- Creates: schema, least-privilege user, grants
-- Safe to run multiple times (IF NOT EXISTS)
-- ===========================================

-- 1) Create a dedicated development schema
CREATE DATABASE IF NOT EXISTS fitness_app_dev
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_520_ci;

-- 2) Create a least-privilege user for the app
-- NOTE: If you don't have permission to create users on your machine,
-- comment this block out and just use an existing local user.
CREATE USER IF NOT EXISTS 'dev_user'@'%'
  IDENTIFIED BY 'mypassword';

-- 3) Grant only schema-scoped privileges the app needs
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, INDEX, ALTER, DROP
ON fitness_app_dev.* TO 'dev_user'@'%';

-- 4) Persist privilege changes
FLUSH PRIVILEGES;


-- how to run this is in your terminal " mysql -u root -p < database/setup.sql"

