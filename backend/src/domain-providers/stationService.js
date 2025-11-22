const path = require('path')
const fs = require('fs')

function loadData() {
  const p = path.resolve(process.cwd(), '.trae', 'documents', '2-车票查询与筛选', '车次信息.json')
  try {
    const raw = fs.readFileSync(p, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

class StationService {
  list() {
    const data = loadData()
    const set = new Set()
    for (const t of data) {
      if (t?.route?.origin) set.add(String(t.route.origin))
      if (t?.route?.destination) set.add(String(t.route.destination))
    }
    return Array.from(set).sort()
  }

  validate(name) {
    const n = String(name || '').trim()
    if (!n) return { valid: false }
    const list = this.list()
    return { valid: list.includes(n) }
  }
}

module.exports = new StationService()