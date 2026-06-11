function pad(n) { return String(n).padStart(2, '0'); }
function key(y, m, d) { return `${y}-${pad(m)}-${pad(d)}`; }

function nthMonday(year, month, n) {
  const first = new Date(year, month - 1, 1);
  const dow = first.getDay();
  const firstMon = dow === 0 ? 2 : dow === 1 ? 1 : 9 - dow;
  return firstMon + (n - 1) * 7;
}

function vernalEquinox(year) {
  if (year <= 1979) return 20;
  if (year <= 2099) return Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
  return 21;
}

function autumnalEquinox(year) {
  if (year <= 1979) return 23;
  if (year <= 2099) return Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
  return 23;
}

export function getHolidaysForYear(year) {
  const h = {};
  h[key(year, 1, 1)]   = '元日';
  h[key(year, 2, 11)]  = '建国記念の日';
  h[key(year, 2, 23)]  = '天皇誕生日';
  h[key(year, 3, vernalEquinox(year))]   = '春分の日';
  h[key(year, 4, 29)]  = '昭和の日';
  h[key(year, 5, 3)]   = '憲法記念日';
  h[key(year, 5, 4)]   = 'みどりの日';
  h[key(year, 5, 5)]   = 'こどもの日';
  h[key(year, 8, 11)]  = '山の日';
  h[key(year, 11, 3)]  = '文化の日';
  h[key(year, 11, 23)] = '勤労感謝の日';
  h[key(year, 1,  nthMonday(year, 1, 2))]  = '成人の日';
  h[key(year, 7,  nthMonday(year, 7, 3))]  = '海の日';
  h[key(year, 9,  nthMonday(year, 9, 3))]  = '敬老の日';
  h[key(year, 10, nthMonday(year, 10, 2))] = 'スポーツの日';
  h[key(year, 9, autumnalEquinox(year))]   = '秋分の日';

  const extras = {};
  for (const [k, name] of Object.entries(h)) {
    const d = new Date(k);
    if (d.getDay() === 0) {
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const nk = next.toISOString().slice(0, 10);
      if (!h[nk]) extras[nk] = '振替休日';
    }
  }
  return { ...h, ...extras };
}

export function getHolidaysForRange(startYear, endYear) {
  let all = {};
  for (let y = startYear; y <= endYear; y++) {
    all = { ...all, ...getHolidaysForYear(y) };
  }
  return all;
}
