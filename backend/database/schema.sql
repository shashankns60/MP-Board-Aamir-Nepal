CREATE DATABASE IF NOT EXISTS mpbse_results
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mpbse_results;

CREATE TABLE IF NOT EXISTS student_results (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  roll_number VARCHAR(20) NOT NULL,
  date_of_birth DATE NOT NULL,
  class VARCHAR(10) NULL,
  enrollment_number VARCHAR(255) NULL,
  student_name VARCHAR(255) NOT NULL,
  father_name VARCHAR(255) NULL,
  mother_name VARCHAR(255) NULL,
  school_name VARCHAR(255) NULL,
  school_code INT UNSIGNED NULL,
  examination_year SMALLINT UNSIGNED NULL,
  subjects JSON NULL,
  total_obtained SMALLINT UNSIGNED NULL,
  maximum_marks SMALLINT UNSIGNED NOT NULL DEFAULT 600,
  percentage DECIMAL(8,4) NULL,
  division VARCHAR(50) NULL,
  result_status VARCHAR(50) NOT NULL DEFAULT 'PASS',
  serial_number INT UNSIGNED NULL,
  issue_date VARCHAR(20) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  UNIQUE KEY student_results_roll_dob_unique (roll_number, date_of_birth),
  KEY student_results_roll_number_index (roll_number),
  KEY student_results_student_name_index (student_name),
  KEY student_results_class_index (class)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
