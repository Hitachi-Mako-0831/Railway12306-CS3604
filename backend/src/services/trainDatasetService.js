const fs = require('fs')
const path = require('path')

function baseDir() {
  const envDir = process.env.TRAIN_DATA_DIR
  if (envDir) return envDir
  return path.resolve(process.cwd(), '..', '12306-code-database-2023-12-15-main')
}

function pickDirs(highspeed) {
  const dir = baseDir()
  const roots = []
  if (highspeed === '1') {
    roots.push(path.join(dir, 'gbk', 'G'))
    roots.push(path.join(dir, 'gbk', 'D'))
  } else {
    roots.push(path.join(dir, 'gbk', 'G'))
    roots.push(path.join(dir, 'gbk', 'D'))
    roots.push(path.join(dir, 'gbk', 'C'))
  }
  return roots
}

function safeReadJson(fp) {
  try {
    const raw = fs.readFileSync(fp, 'utf-8')
    return JSON.parse(raw)
  } catch (_) {
    return null
  }
}

function toTrainItem(j) {
  const r = j && (j.route || j.basic || {})
  const fares = j && j.fares ? j.fares : {}
  const trainNo = j.train_no || j.trainNo || j.code || j.number
  if (!trainNo || !r) return null
  const origin = r.origin || r.from || r.start || r.departure
  const destination = r.destination || r.to || r.end || r.arrival
  const departure_time = r.departure_time || r.departureTime
  const arrival_time = r.arrival_time || r.arrivalTime
  const planned_duration_min = r.planned_duration_min || r.durationMin
  return {
    train_no: trainNo,
    train_type: j.train_type || j.type || '',
    route: {
      origin,
      destination,
      departure_time,
      arrival_time,
      planned_duration_min,
    },
    fares,
  }
}

async function search({ from, to, highspeed }) {
  try {
    const dirs = pickDirs(highspeed)
    const out = []
    for (const d of dirs) {
      if (!fs.existsSync(d)) continue
      const files = fs.readdirSync(d).slice(0, 200)
      for (const f of files) {
        const j = safeReadJson(path.join(d, f))
        const item = toTrainItem(j)
        if (!item) continue
        const origin = item.route?.origin
        const dest = item.route?.destination
        if (origin === from && dest === to) {
          out.push(item)
        }
      }
    }
    return out
  } catch (_) {
    return []
  }
}

module.exports = { search }