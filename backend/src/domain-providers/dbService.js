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

    const dbPath = process.env.NODE_ENV === 'test'
      ? process.env.TEST_DB_PATH || './database/test.db'
      : process.env.DB_PATH || './database/railway.db';

    const isTest = process.env.NODE_ENV === 'test';

    if (!isTest) {
      try {
        const BetterSqlite3 = require('better-sqlite3');
        this.db = new BetterSqlite3(dbPath);
        this.createTables();
        return;
      } catch (e) {}

      try {
        const sqlite3 = require('sqlite3').verbose();
        this.db = new sqlite3.Database(dbPath, (err) => {
          if (err) {
            console.error('Database connection error:', err);
          } else {
            this.createTables();
          }
        });
        return;
      } catch (err) {
        console.error('Failed to initialize any sqlite driver:', err);
      }
    }

    const nowIso = () => new Date().toISOString();
    const toDate = (s) => new Date(s);
    const MemoryDb = class {
      constructor() {
        this.tables = {
          users: [],
          verification_codes: [],
          email_verification_codes: [],
          sessions: [],
          orders: [],
          order_passengers: [],
          passengers: [],
        };
        this.auto = { users: 1, verification_codes: 1, email_verification_codes: 1, sessions: 1, orders: 1, order_passengers: 1, passengers: 1 };
      }
      exec(sql) {}
      get(sql, params) {
        if (sql.startsWith('SELECT * FROM users WHERE username = ')) {
          const r = this.tables.users.find(u => u.username === params[0]);
          return r || null;
        }
        if (sql.startsWith('SELECT * FROM users WHERE id = ')) {
          const r = this.tables.users.find(u => u.id === params[0]);
          return r || null;
        }
        if (sql.startsWith('SELECT * FROM users WHERE id_card_type = ') && sql.includes('AND id_card_number = ')) {
          const r = this.tables.users.find(u => u.id_card_type === params[0] && u.id_card_number === params[1]);
          return r || null;
        }
        if (sql.startsWith('SELECT * FROM users WHERE phone = ')) {
          const r = this.tables.users.find(u => u.phone === params[0]);
          return r || null;
        }
        if (sql.startsWith('SELECT * FROM users WHERE email = ')) {
          const r = this.tables.users.find(u => u.email === params[0]);
          return r || null;
        }
        if (sql.startsWith('SELECT * FROM email_verification_codes')) {
          const email = params[0], code = params[1];
          const arr = this.tables.email_verification_codes.filter(r => r.email === email && r.code === code && r.used === 0);
          if (arr.length === 0) return null;
          const sorted = arr.sort((a,b)=> (a.created_at > b.created_at ? -1 : 1));
          return sorted[0];
        }
        if (sql.startsWith('SELECT * FROM verification_codes')) {
          const phone = params[0];
          const arr = this.tables.verification_codes.filter(r => r.phone === phone && r.used === 0 && toDate(r.expires_at) > new Date());
          if (arr.length === 0) return null;
          const sorted = arr.sort((a,b)=> (a.created_at > b.created_at ? -1 : 1));
          return sorted[0];
        }
        if (sql.startsWith('SELECT * FROM sessions WHERE session_id = ')) {
          const sid = params[0];
          const r = this.tables.sessions.find(s => s.session_id === sid && s.expires_at > nowIso());
          return r || null;
        }
        return null;
      }
      all(sql, params) {
        return [];
      }
      run(sql, params) {
        if (sql.startsWith('INSERT INTO users') || sql.startsWith('INSERT OR REPLACE INTO users')) {
          const isReplace = sql.startsWith('INSERT OR REPLACE INTO users');
          if (sql.includes('(username, password, phone, id_card_number)')) {
            const id = this.auto.users++;
            const row = { id, username: params[0], password: params[1], name: null, email: null, phone: params[2], id_card_type: null, id_card_number: params[3], discount_type: null, created_at: nowIso() };
            if (!isReplace) {
              if (this.tables.users.find(u => u.username === row.username)) throw new Error('UNIQUE constraint failed: users.username');
              if (row.phone && this.tables.users.find(u => u.phone === row.phone)) throw new Error('UNIQUE constraint failed: users.phone');
              if (row.id_card_number && this.tables.users.find(u => u.id_card_number === row.id_card_number)) throw new Error('UNIQUE constraint failed: users.id_card_number');
            } else {
              this.tables.users = this.tables.users.filter(u => !(u.username === row.username || (row.phone && u.phone === row.phone) || (row.email && u.email === row.email) || (row.id_card_number && u.id_card_number === row.id_card_number)));
            }
            this.tables.users.push(row);
            return { lastID: id, changes: 1 };
          }
          if (sql.includes('(username, password, phone, id_card_type, id_card_number)')) {
            const id = this.auto.users++;
            const row = { id, username: params[0], password: params[1], name: null, email: null, phone: params[2], id_card_type: params[3], id_card_number: params[4], discount_type: null, created_at: nowIso() };
            if (!isReplace) {
              if (this.tables.users.find(u => u.username === row.username)) throw new Error('UNIQUE constraint failed: users.username');
              if (row.phone && this.tables.users.find(u => u.phone === row.phone)) throw new Error('UNIQUE constraint failed: users.phone');
              if (row.id_card_number && this.tables.users.find(u => u.id_card_type === row.id_card_type && u.id_card_number === row.id_card_number)) throw new Error('UNIQUE constraint failed: users.id_card_number');
            } else {
              this.tables.users = this.tables.users.filter(u => !(u.username === row.username || (row.phone && u.phone === row.phone) || (row.email && u.email === row.email) || (row.id_card_type && row.id_card_number && u.id_card_type === row.id_card_type && u.id_card_number === row.id_card_number)));
            }
            this.tables.users.push(row);
            return { lastID: id, changes: 1 };
          }
          if (sql.includes('(username, password, email, phone, id_card_type, id_card_number, name)')) {
            const id = this.auto.users++;
            const row = { id, username: params[0], password: params[1], name: params[6], email: params[2], phone: params[3], id_card_type: params[4], id_card_number: params[5], discount_type: null, created_at: nowIso() };
            if (this.tables.users.find(u => u.username === row.username)) throw new Error('UNIQUE constraint failed: users.username');
            if (row.phone && this.tables.users.find(u => u.phone === row.phone)) throw new Error('UNIQUE constraint failed: users.phone');
            if (row.email && this.tables.users.find(u => u.email === row.email)) throw new Error('UNIQUE constraint failed: users.email');
            if (row.id_card_type && row.id_card_number && this.tables.users.find(u => u.id_card_type === row.id_card_type && u.id_card_number === row.id_card_number)) throw new Error('UNIQUE constraint failed: users.id_card_number');
            this.tables.users.push(row);
            return { lastID: id, changes: 1 };
          }
          if (sql.includes('(username, password, name, id_card_number, phone, email)')) {
            const id = this.auto.users++;
            const row = { id, username: params[0], password: params[1], name: params[2], email: params[5], phone: params[4], id_card_type: null, id_card_number: params[3], discount_type: null, created_at: nowIso() };
            if (!isReplace) {
              if (this.tables.users.find(u => u.username === row.username)) throw new Error('UNIQUE constraint failed: users.username');
              if (row.phone && this.tables.users.find(u => u.phone === row.phone)) throw new Error('UNIQUE constraint failed: users.phone');
              if (row.email && this.tables.users.find(u => u.email === row.email)) throw new Error('UNIQUE constraint failed: users.email');
              if (row.id_card_number && this.tables.users.find(u => u.id_card_number === row.id_card_number)) throw new Error('UNIQUE constraint failed: users.id_card_number');
            } else {
              this.tables.users = this.tables.users.filter(u => !(u.username === row.username || (row.phone && u.phone === row.phone) || (row.email && u.email === row.email) || (row.id_card_number && u.id_card_number === row.id_card_number)));
            }
            this.tables.users.push(row);
            return { lastID: id, changes: 1 };
          }
          const id = this.auto.users++;
          const row = { id, username: params[0], password: params[1], name: params[2], email: params[3], phone: params[4], id_card_type: params[5], id_card_number: params[6], discount_type: params[7], created_at: nowIso() };
          if (!isReplace) {
            if (this.tables.users.find(u => u.username === row.username)) throw new Error('UNIQUE constraint failed: users.username');
            if (row.phone && this.tables.users.find(u => u.phone === row.phone)) throw new Error('UNIQUE constraint failed: users.phone');
            if (row.email && this.tables.users.find(u => u.email === row.email)) throw new Error('UNIQUE constraint failed: users.email');
            if (row.id_card_type && row.id_card_number && this.tables.users.find(u => u.id_card_type === row.id_card_type && u.id_card_number === row.id_card_number)) throw new Error('UNIQUE constraint failed: users.id_card_number');
          } else {
            this.tables.users = this.tables.users.filter(u => !(u.username === row.username || (row.phone && u.phone === row.phone) || (row.email && u.email === row.email) || (row.id_card_type && row.id_card_number && u.id_card_type === row.id_card_type && u.id_card_number === row.id_card_number)));
          }
          this.tables.users.push(row);
          return { lastID: id, changes: 1 };
        }
        if (sql.startsWith('INSERT INTO email_verification_codes')) {
          const id = this.auto.email_verification_codes++;
          const row = { id, email: params[0], code: params[1], created_at: params[2], expires_at: params[3], sent_status: params[4], sent_at: params[5], used: 0 };
          this.tables.email_verification_codes.push(row);
          return { lastID: id, changes: 1 };
        }
        if (sql.startsWith('UPDATE email_verification_codes SET used = 1 WHERE id = ')) {
          const id = params[0];
          const r = this.tables.email_verification_codes.find(x => x.id === id);
          if (r) r.used = 1;
          return { lastID: 0, changes: r ? 1 : 0 };
        }
        if (sql.startsWith('UPDATE email_verification_codes SET expires_at = ')) {
          const exp = params[0];
          const email = params[1];
          const targets = this.tables.email_verification_codes.filter(x => x.email === email);
          targets.forEach(t => { t.expires_at = exp; });
          return { lastID: 0, changes: targets.length };
        }
        if (sql.startsWith('INSERT INTO verification_codes')) {
          const id = this.auto.verification_codes++;
          const row = { id, phone: params[0], code: params[1], created_at: params[2], expires_at: params[3], sent_status: 'sent', sent_at: params[4], used: 0 };
          this.tables.verification_codes.push(row);
          return { lastID: id, changes: 1 };
        }
        if (sql.startsWith('UPDATE verification_codes SET used = 1 WHERE id = ')) {
          const id = params[0];
          const r = this.tables.verification_codes.find(x => x.id === id);
          if (r) r.used = 1;
          return { lastID: 0, changes: r ? 1 : 0 };
        }
        if (sql.startsWith('INSERT OR REPLACE INTO sessions')) {
          const sid = params[0];
          const data = params[1];
          const exp = params[2];
          const exist = this.tables.sessions.find(s => s.session_id === sid);
          if (exist) { exist.user_data = data; exist.expires_at = exp; } else { const id = this.auto.sessions++; this.tables.sessions.push({ id, session_id: sid, user_data: data, created_at: nowIso(), expires_at: exp }); }
          return { lastID: 0, changes: 1 };
        }
        if (sql.startsWith('DELETE FROM sessions WHERE session_id = ')) {
          const sid = params[0];
          const len = this.tables.sessions.length;
          this.tables.sessions = this.tables.sessions.filter(s => s.session_id !== sid);
          return { lastID: 0, changes: len - this.tables.sessions.length };
        }
        if (sql.startsWith('DELETE FROM users')) { const len = this.tables.users.length; this.tables.users = []; return { lastID: 0, changes: len }; }
        if (sql.startsWith('DELETE FROM verification_codes')) { const len = this.tables.verification_codes.length; this.tables.verification_codes = []; return { lastID: 0, changes: len }; }
        if (sql.startsWith('DELETE FROM email_verification_codes')) { const len = this.tables.email_verification_codes.length; this.tables.email_verification_codes = []; return { lastID: 0, changes: len }; }
        return { lastID: 0, changes: 0 };
      }
      close() {}
    };
    if (global.__MEM_DB__) {
      this.db = global.__MEM_DB__;
    } else {
      this.db = new MemoryDb();
      global.__MEM_DB__ = this.db;
    }
    this.createTables();
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

    const createPassengersTable = `
      CREATE TABLE IF NOT EXISTS passengers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        id_card_type TEXT,
        id_card_number TEXT,
        discount_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, name, id_card_number),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    if (typeof this.db.exec === 'function') {
      this.db.exec(createVerificationCodesTable);
      this.db.exec(createEmailVerificationCodesTable);
      this.db.exec(createSessionsTable);
      this.db.exec(createOrdersTable);
      this.db.exec(createOrderPassengersTable);
      this.db.exec(createPassengersTable);
    } else {
      this.db.run(createVerificationCodesTable);
      this.db.run(createEmailVerificationCodesTable);
      this.db.run(createSessionsTable);
      this.db.run(createOrdersTable);
      this.db.run(createOrderPassengersTable);
      this.db.run(createPassengersTable);
    }
  }

  // 通用查询方法 - 返回单行
  async get(sql, params = []) {
    if (!this.db) this.init();
    if (!this.db) throw new Error('Database not initialized');
    if (typeof this.db.prepare === 'function') {
      const stmt = this.db.prepare(sql);
      return stmt.get(params);
    }
    if (typeof this.db.get === 'function' && this.db.get.length <= 2) {
      const row = this.db.get(sql, params);
      return row;
    }
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err); else resolve(row);
      });
    });
  }

  // 通用查询方法 - 返回所有行
  async all(sql, params = []) {
    if (!this.db) this.init();
    if (!this.db) throw new Error('Database not initialized');
    if (typeof this.db.prepare === 'function') {
      const stmt = this.db.prepare(sql);
      return stmt.all(params);
    }
    if (typeof this.db.all === 'function' && this.db.all.length <= 2) {
      const rows = this.db.all(sql, params);
      return rows;
    }
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });
  }

  // 通用执行方法 - INSERT, UPDATE, DELETE
  async run(sql, params = []) {
    if (!this.db) this.init();
    if (!this.db) throw new Error('Database not initialized');
    if (typeof this.db.prepare === 'function') {
      const stmt = this.db.prepare(sql);
      const res = stmt.run(...params);
      return { lastID: Number(res.lastInsertRowid || 0), changes: res.changes || 0 };
    }
    if (typeof this.db.run === 'function' && this.db.run.length <= 2) {
      const res = this.db.run(sql, params);
      return res;
    }
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err); else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  // 关闭数据库连接
  close() {
    if (this.db) {
      if (typeof this.db.close === 'function' && this.db.close.length === 0) {
        this.db.close();
      } else {
        this.db.close((err) => { if (err) console.error('Error closing database:', err); });
      }
    }
  }
}

module.exports = new DatabaseService();