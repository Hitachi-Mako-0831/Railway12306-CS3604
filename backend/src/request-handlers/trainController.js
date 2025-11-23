const path = require('path');
const fs = require('fs');
const dataset = require('../domain-providers/trainDatasetService');
const db = require('../domain-providers/dbService');
const official = require('../domain-providers/official12306Api');
const cache = require('../domain-providers/cacheService');
const diff = require('../domain-providers/dataDiffService');

function loadTraeFallback() {
  const dataPath = path.resolve(process.cwd(), '.trae', 'documents', '2-车票查询与筛选', '车次信息.json');
  try {
    const raw = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function toResultItem(t) {
  const route = t.route || {};
  const fares = t.fares || {};
  const durationMin = route.planned_duration_min;
  const duration = typeof durationMin === 'number' ? `${Math.floor(durationMin / 60)}小时${durationMin % 60}分` : '';
  const businessSeat = 18;
  const firstClassSeat = 80;
  const secondClassSeat = 200;
  const softSleeperSeat = 40;
  const hardSleeperSeat = 60;
  return {
    id: t.train_no,
    trainNumber: t.train_no,
    departure: route.origin,
    arrival: route.destination,
    departureTime: route.departure_time,
    arrivalTime: route.arrival_time,
    duration,
    businessSeat,
    firstClassSeat,
    secondClassSeat,
    businessPrice: fares.business || 0,
    firstClassPrice: fares.first_class || 0,
    secondClassPrice: fares.second_class || 0,
    softSleeperSeat,
    hardSleeperSeat,
    softSleeperPrice: fares.soft_sleeper || 0,
    hardSleeperPrice: fares.hard_sleeper || 0,
  };
}

async function fetchDbTrains({ from, to, highspeed }) {
  try {
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    const names = tables.map((r) => r.name);
    const pick = async () => {
      for (const n of names) {
        const cols = await db.all(`PRAGMA table_info(${n})`);
        const cs = cols.map((c) => String(c.name || '').toLowerCase());
        const hasOrigin = cs.includes('origin') || cs.includes('from') || cs.includes('departure') || cs.includes('departure_station');
        const hasDest = cs.includes('destination') || cs.includes('to') || cs.includes('arrival') || cs.includes('arrival_station');
        const hasTrainNo = cs.includes('train_no') || cs.includes('trainno') || cs.includes('code') || cs.includes('number');
        const hasDepTime = cs.includes('departure_time') || cs.includes('departuretime');
        const hasArrTime = cs.includes('arrival_time') || cs.includes('arrivaltime');
        if (hasOrigin && hasDest && hasTrainNo && (hasDepTime || hasArrTime)) return { name: n, cs };
      }
      return null;
    };
    const chosen = await pick();
    if (!chosen) return [];
    const lower = (s) => String(s || '').toLowerCase();
    const originCol = ['origin','from','departure','departure_station'].find((k) => chosen.cs.includes(k)) || 'origin';
    const destCol = ['destination','to','arrival','arrival_station'].find((k) => chosen.cs.includes(k)) || 'destination';
    const trainNoCol = ['train_no','trainno','code','number'].find((k) => chosen.cs.includes(k)) || 'train_no';
    const depTimeCol = ['departure_time','departuretime'].find((k) => chosen.cs.includes(k)) || 'departure_time';
    const arrTimeCol = ['arrival_time','arrivaltime'].find((k) => chosen.cs.includes(k)) || 'arrival_time';
    const durMinCol = ['planned_duration_min','duration_min','durationmin'].find((k) => chosen.cs.includes(k)) || null;
    const typeCol = ['train_type','type'].find((k) => chosen.cs.includes(k)) || null;
    const rows = await db.all(`SELECT * FROM ${chosen.name} WHERE ${originCol} = ? COLLATE NOCASE AND ${destCol} = ? COLLATE NOCASE LIMIT 500`, [String(from || '').trim(), String(to || '').trim()]);
    console.log('db-fetch-trains', { table: chosen.name, originCol, destCol, count: Array.isArray(rows) ? rows.length : 0 })
    const okRows = rows.filter((r) => {
      if (highspeed === '1') {
        const type = typeCol ? lower(r[typeCol]) : '';
        const no = String(r[trainNoCol] || '');
        if (type && (type.includes('高速') || no.startsWith('G') || no.startsWith('D'))) return true;
        return no.startsWith('G') || no.startsWith('D');
      }
      return true;
    });
    return okRows.map((r) => {
      const durationMin = durMinCol ? Number(r[durMinCol]) : NaN;
      const fares = {
        business: Number(r.business_price || r.businessPrice || 0) || 0,
        first_class: Number(r.first_class_price || r.firstClassPrice || 0) || 0,
        second_class: Number(r.second_class_price || r.secondClassPrice || 0) || 0,
        soft_sleeper: Number(r.soft_sleeper_price || r.softSleeperPrice || 0) || 0,
        hard_sleeper: Number(r.hard_sleeper_price || r.hardSleeperPrice || 0) || 0,
      };
      return {
        train_no: String(r[trainNoCol]),
        train_type: typeCol ? String(r[typeCol] || '') : '',
        route: {
          origin: String(r[originCol]),
          destination: String(r[destCol]),
          departure_time: String(r[depTimeCol] || ''),
          arrival_time: String(r[arrTimeCol] || ''),
          planned_duration_min: Number.isFinite(durationMin) ? durationMin : undefined,
        },
        fares,
      };
    });
  } catch (e) {
    console.error('db-fetch-trains-error', { error: String(e && e.message || e), params: { from, to, highspeed } })
    return [];
  }
}

class TrainController {
  async searchTrains(req, res) {
    try {
      const t0 = Date.now()
      const { from, to, date, highspeed } = req.query;
      if (!from || !to || !date) {
        return res.status(400).json({ success: false, message: '缺少必要参数：from、to、date' });
      }
      let list = [];
      const useOfficial = false
      const cacheKey = `api:search:${from}:${to}:${date}:${highspeed || '-'}`
      const cached = await cache.get(cacheKey)
      if (cached) {
        return res.status(200).json({ success: true, trains: cached })
      }
      // Official API disabled: always use local database and dataset fallback
      try {
        const dbRows = await fetchDbTrains({ from, to, highspeed });
        if (Array.isArray(dbRows) && dbRows.length) {
          list = dbRows.map(toResultItem);
        }
      } catch (_) {}
      try {
        const ds = await dataset.search({ from, to, highspeed });
        if (Array.isArray(ds) && ds.length) {
          if (!list.length) list = ds.map(toResultItem);
        }
      } catch (_) {}
      if (!list.length) {
        const data = loadTraeFallback();
        list = data.filter((t) => {
          const origin = t.route?.origin;
          const destination = t.route?.destination;
          const matchBasic = origin === from && destination === to;
          if (!matchBasic) return false;
          if (highspeed === '1') {
            return t.train_type && (t.train_type.includes('高速') || t.train_no.startsWith('G'));
          }
          return true;
        }).map(toResultItem);
      }
      await cache.set(cacheKey, list)
      const metrics = require('../monitoring/metrics')
      metrics.observe(Date.now() - t0, true)
      try {
        // compare with fallback dataset regularly for consistency auditing
        const ds = await dataset.search({ from, to, highspeed })
        const dsNorm = Array.isArray(ds) ? ds.map(toResultItem) : []
        const report = diff.diffLists(list, dsNorm)
        if (report.onlyOfficial.length || report.onlyBackup.length) {
          console.log('data-diff', { onlyOfficial: report.onlyOfficial.slice(0,5), onlyBackup: report.onlyBackup.slice(0,5) })
        }
      } catch (_) {}
      return res.status(200).json({ success: true, trains: list });
    } catch (error) {
      const metrics = require('../monitoring/metrics')
      metrics.observe(0, false)
      return res.status(500).json({ success: false, message: '查询失败' });
    }
  }

  async getTrainDetail(req, res) {
    try {
      const { trainNo } = req.params;
      const data = loadTraeFallback();
      const item = data.find((t) => t.train_no === trainNo);
      if (!item) {
        return res.status(404).json({ success: false, message: '车次不存在' });
      }
      return res.status(200).json({ success: true, train: item });
    } catch (error) {
      return res.status(500).json({ success: false, message: '获取详情失败' });
    }
  }

  async getAvailableDates(req, res) {
    try {
      const out = []
      const base = new Date()
      for (let i = 0; i < 30; i++) {
        const d = new Date(base)
        d.setDate(d.getDate() + i)
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const dd = String(d.getDate()).padStart(2, '0')
        out.push(`${d.getFullYear()}-${mm}-${dd}`)
      }
      return res.status(200).json({ success: true, dates: out })
    } catch (error) {
      return res.status(500).json({ success: false, message: '获取可售日期失败' })
    }
  }
}

module.exports = new TrainController();