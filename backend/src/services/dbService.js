const path = require('path');

class DatabaseService {
  constructor() {
    this.db = null;
    this._initialized = false;
  }

  // 初始化数据库连接
  init() {
    if (this._initialized) return;
    this._initialized = true;

    let sqlite3;
    try {
      // 延迟加载 sqlite3，避免在服务启动时因本地原生绑定缺失而崩溃
      sqlite3 = require('sqlite3').verbose();
    } catch (err) {
      console.error('Failed to load sqlite3 module:', err);
      return;
    }

    const dbPath = process.env.NODE_ENV === 'test' 
      ? process.env.TEST_DB_PATH || './database/test.db'
      : process.env.DB_PATH || './database/railway.db';
    
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database connection error:', err);
      } else {
        console.log('Connected to SQLite database');
        this.createTables();
      }
    });
  }

  // 创建数据表
  createTables() {
    // 创建用户表
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        email TEXT,
        phone TEXT UNIQUE NOT NULL,
        id_card_type TEXT,
        id_card_number TEXT,
        discount_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        UNIQUE(id_card_type, id_card_number)
      )
    `;

    // 创建短信验证码表
    const createVerificationCodesTable = `
      CREATE TABLE IF NOT EXISTS verification_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT NOT NULL,
        code TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT 0,
        sent_status TEXT DEFAULT 'sent',
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 创建邮箱验证码表
    const createEmailVerificationCodesTable = `
      CREATE TABLE IF NOT EXISTS email_verification_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT 0,
        sent_status TEXT DEFAULT 'sent',
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 创建会话表
    const createSessionsTable = `
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT UNIQUE NOT NULL,
        user_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL
      )
    `;

    // 创建订单表
    const createOrdersTable = `
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE,
        train_no TEXT,
        origin TEXT,
        destination TEXT,
        departure_date TEXT,
        seat_type TEXT,
        quantity INTEGER,
        total_price REAL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 创建订单乘客表
    const createOrderPassengersTable = `
      CREATE TABLE IF NOT EXISTS order_passengers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        name TEXT,
        seat_type TEXT,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `;

    this.db.run(createUsersTable);
    this.db.run(createVerificationCodesTable);
    this.db.run(createEmailVerificationCodesTable);
    this.db.run(createSessionsTable);
    this.db.run(createOrdersTable);
    this.db.run(createOrderPassengersTable);
  }

  // 通用查询方法 - 返回单行
  async get(sql, params = []) {
    if (!this.db) this.init();
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // 通用查询方法 - 返回所有行
  async all(sql, params = []) {
    if (!this.db) this.init();
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // 通用执行方法 - INSERT, UPDATE, DELETE
  async run(sql, params = []) {
    if (!this.db) this.init();
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  // 关闭数据库连接
  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Database connection closed');
        }
      });
    }
  }
}

module.exports = new DatabaseService();