-- Dockiee Database Schema
-- Version: 1.0.0
-- Database Engine: MySQL 8.0 (InnoDB)
-- Character Set: utf8mb4

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------
-- 1️⃣ USERS TABLE
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'printer', 'admin') NOT NULL DEFAULT 'student',
  `university` VARCHAR(255) NULL,
  `department` VARCHAR(255) NULL,
  `student_id` VARCHAR(100) NULL,
  `is_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `balance` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_unique` (`email` ASC) /*!80000 INVISIBLE */,
  INDEX `idx_role` (`role` ASC),
  INDEX `idx_university` (`university` ASC)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- 2️⃣ STUDENT_PROFILES TABLE
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `student_profiles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `phone` VARCHAR(50) NULL,
  `address` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `user_id_unique` (`user_id` ASC),
  CONSTRAINT `fk_student_profile_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- 3️⃣ PRINTER_PROFILES TABLE
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `printer_profiles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `printer_type` VARCHAR(255) NOT NULL,
  `supports_color` BOOLEAN NOT NULL DEFAULT FALSE,
  `supports_bw` BOOLEAN NOT NULL DEFAULT TRUE,
  `price_per_page_bw` DECIMAL(10,2) NOT NULL DEFAULT 0.10,
  `price_per_page_color` DECIMAL(10,2) NOT NULL DEFAULT 0.50,
  `is_active_for_work` BOOLEAN NOT NULL DEFAULT FALSE,
  `rating_avg` DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  `total_jobs` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `user_id_unique` (`user_id` ASC),
  INDEX `idx_active_printer` (`is_active_for_work` ASC),
  CONSTRAINT `fk_printer_profile_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- 4️⃣ PRINT_FILES TABLE
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `print_files` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_id` BIGINT UNSIGNED NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(512) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(50) NOT NULL COMMENT 'pdf, docx, etc',
  `file_size` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `total_pages` INT UNSIGNED NOT NULL DEFAULT 1,
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_student_files` (`student_id` ASC),
  CONSTRAINT `fk_print_file_student`
    FOREIGN KEY (`student_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- 5️⃣ PRINT_ORDERS TABLE
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `print_orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_code` VARCHAR(50) NOT NULL,
  `student_id` BIGINT UNSIGNED NOT NULL,
  `printer_id` BIGINT UNSIGNED NOT NULL,
  `file_id` BIGINT UNSIGNED NOT NULL,
  `pages` INT UNSIGNED NOT NULL DEFAULT 1,
  `gsm` VARCHAR(50) NULL DEFAULT '80gsm',
  `print_type` ENUM('bw', 'color') NOT NULL DEFAULT 'bw',
  `deadline` DATETIME NULL,
  `status` ENUM('pending', 'accepted', 'printing', 'completed', 'cancelled', 'disputed') NOT NULL DEFAULT 'pending',
  `total_price` DECIMAL(10,2) NOT NULL,
  `commission_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `printer_earning` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `order_code_unique` (`order_code` ASC),
  INDEX `idx_order_student` (`student_id` ASC),
  INDEX `idx_order_printer` (`printer_id` ASC),
  INDEX `idx_order_status` (`status` ASC),
  CONSTRAINT `fk_order_student`
    FOREIGN KEY (`student_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT `fk_order_printer`
    FOREIGN KEY (`printer_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT `fk_order_file`
    FOREIGN KEY (`file_id`)
    REFERENCES `print_files` (`id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- 6️⃣ PAYMENTS TABLE
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `payments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `amount_paid` DECIMAL(10,2) NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL,
  `payment_status` ENUM('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending',
  `transaction_id` VARCHAR(100) NULL,
  `paid_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_payment_order` (`order_id` ASC),
  CONSTRAINT `fk_payment_order`
    FOREIGN KEY (`order_id`)
    REFERENCES `print_orders` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- 7️⃣ RATINGS TABLE
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ratings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `student_id` BIGINT UNSIGNED NOT NULL,
  `printer_id` BIGINT UNSIGNED NOT NULL,
  `rating` TINYINT UNSIGNED NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `review_text` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `order_id_unique` (`order_id` ASC),
  INDEX `idx_rating_printer` (`printer_id` ASC),
  CONSTRAINT `fk_rating_order`
    FOREIGN KEY (`order_id`)
    REFERENCES `print_orders` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_rating_student`
    FOREIGN KEY (`student_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT `fk_rating_printer`
    FOREIGN KEY (`printer_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- 8️⃣ DISPUTES TABLE
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `disputes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `raised_by` BIGINT UNSIGNED NOT NULL,
  `reason` TEXT NOT NULL,
  `status` ENUM('open', 'resolved', 'rejected') NOT NULL DEFAULT 'open',
  `admin_note` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_dispute_order` (`order_id` ASC),
  INDEX `idx_dispute_status` (`status` ASC),
  CONSTRAINT `fk_dispute_order`
    FOREIGN KEY (`order_id`)
    REFERENCES `print_orders` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_dispute_user`
    FOREIGN KEY (`raised_by`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- 9️⃣ ADMIN_LOGS TABLE
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `admin_id` BIGINT UNSIGNED NOT NULL,
  `action` VARCHAR(255) NOT NULL,
  `target_table` VARCHAR(100) NULL,
  `target_id` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_admin_log_user` (`admin_id` ASC),
  CONSTRAINT `fk_admin_log_user`
    FOREIGN KEY (`admin_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE
) ENGINE = InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
