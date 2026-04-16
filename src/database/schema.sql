CREATE DATABASE IF NOT EXISTS ldcu_lost_found;
USE ldcu_lost_found;

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lost_items (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  item_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('pending', 'found', 'claimed') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, password, role)
VALUES ('admin', '$2b$10$K.ExampleHashForAdmin123HereLater', 'admin')
ON DUPLICATE KEY UPDATE
  username = VALUES(username),
  role = VALUES(role),
  password = VALUES(password);

-- Note: Update admin pw hash after server fix

