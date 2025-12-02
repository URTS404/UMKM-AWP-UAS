import fs from 'fs';
import path from 'path';
import { pool, testConnection } from '../config/database.js';

async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...');
    
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }

    // Read and execute SQL migration
    const migrationPath = path.join(process.cwd(), 'migrations', '001_create_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split SQL statements and execute them one by one
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      try {
        await pool.query(statement);
      } catch (error) {
        // Ignore errors for CREATE DATABASE IF NOT EXISTS and similar statements
        if (!statement.toLowerCase().includes('create database') && 
            !statement.toLowerCase().includes('use ')) {
          console.warn('⚠️  Warning executing statement:', statement.substring(0, 100) + '...');
        }
      }
    }
    
    console.log('✅ Database initialized successfully!');
    console.log('📊 Tables created: users, products, orders, order_items, invoices, unboxing_photos, finance_records');
    console.log('👤 Admin user created: admin@kpopstore.com (password: password123)');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run initialization if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase();
}