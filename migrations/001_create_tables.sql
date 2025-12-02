-- K-Pop Merchandise Database Schema
-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS kpop_merchandise;
USE kpop_merchandise;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    type ENUM('PO', 'Ready') NOT NULL,
    stock INT DEFAULT 0,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    status ENUM('pending', 'packing', 'shipped', 'completed') DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    whatsapp_link VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Unboxing Photos table
CREATE TABLE IF NOT EXISTS unboxing_photos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    caption TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Finance Records table
CREATE TABLE IF NOT EXISTS finance_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert admin user (password: password123)
INSERT INTO users (email, password_hash, name, role) VALUES 
('admin@kpopstore.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin')
ON DUPLICATE KEY UPDATE email=email;

-- Insert sample products
INSERT INTO products (name, description, price, type, stock) VALUES 
('BTS Album - Proof', 'Latest BTS anthology album with photocard and exclusive content', 350000, 'Ready', 25),
('Blackpink Lightstick Ver.2', 'Official Blackpink lightstick with Bluetooth connectivity', 450000, 'PO', 0),
('TWICE Formula of Love Album', 'TWICE 3rd full album with random photocard', 280000, 'Ready', 40),
('Stray Kids Oddinary Album', 'Stray Kids mini album with exclusive photocard set', 320000, 'PO', 0),
('ITZY Checkmate Album', 'ITZY 5th mini album with poster and photocard', 300000, 'Ready', 30),
('Red Velvet Queendom Album', 'Red Velvet summer mini album with special photocard', 270000, 'Ready', 35)
ON DUPLICATE KEY UPDATE name=name;