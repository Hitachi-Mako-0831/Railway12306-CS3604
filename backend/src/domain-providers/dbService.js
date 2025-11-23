const fs = require('fs');
const initSqlJs = require('sql.js');

class DatabaseService {
  constructor() {
    this.db = null;
  }

  async init() {
    if (!this.db) {
      const SQL = await initSqlJs();
      const fileBuffer = fs.readFileSync('e:/LQiu/CS3604/12306_Follow/backend/database/railway.db');
      this.db = new SQL.Database(fileBuffer);
    }
  }

  getDb() {
    return this.db;
  }
}

module.exports = new DatabaseService();