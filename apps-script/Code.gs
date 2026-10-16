/**
 * Task Cubes sync server (Google Apps Script, bound to a Google Sheet).
 *
 * Runs as you, so the dashboard never needs to sign in to Google:
 *  - board data is stored in this spreadsheet (sheet "board")
 *  - calendar requests are forwarded to the Google Calendar API (Advanced Service)
 *
 * Every request must carry the secret key created by setup(). The key lives in this
 * script's properties only; it is never written into code or the repository.
 */

const SHEET = 'board';
const CHUNK = 45000;   // characters per cell (Sheets allows 50,000)
const MARK = '#';      // stored before each chunk so Sheets never reads it as a formula, number or date

/** Run once from the editor: creates the secret key and grants permissions. */
function setup() {
  const props = PropertiesService.getScriptProperties();
  let key = props.getProperty('KEY');
  if (!key) {
    key = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '').slice(0, 16);
    props.setProperty('KEY', key);
  }
  boardSheet_();
  Calendar.CalendarList.get('primary');   // asks for calendar permission now rather than on first sync
  Logger.log('Task Cubes 비밀 키: ' + key);
  Logger.log('이 키를 대시보드 Google 설정의 「비밀 키」 칸에 붙여넣으세요. 다른 사람과 공유하지 마세요.');
}

/** Run if the key may have leaked: issues a new one (re-enter it on every device). */
function resetKey() {
  PropertiesService.getScriptProperties().deleteProperty('KEY');
  setup();
}

function doGet() {
  return ContentService.createTextOutput('Task Cubes sync server is running.');
}

function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); }
  catch (err) { return json_({ error: { status: 400, message: 'bad request' } }); }
  const key = PropertiesService.getScriptProperties().getProperty('KEY');
  if (!key || typeof req.key !== 'string' || req.key !== key) {
    return json_({ error: { status: 403, message: 'invalid key' } });
  }
  try {
    return json_({ ok: true, result: handle_(req) });
  } catch (err) {
    return json_({ error: { status: statusOf_(err), message: String(err && err.message || err).slice(0, 300) } });
  }
}

function handle_(r) {
  switch (r.op) {
    case 'rev':  return { rev: rev_() };
    case 'load': return load_();
    case 'save': return save_(r.data, r.baseRev);
    case 'cal':  return cal_(r);
    default: throw new Error('unknown op');
  }
}

/* ---------------- board storage (this spreadsheet) ---------------- */

function boardSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
}
function rev_() {
  return Number(PropertiesService.getScriptProperties().getProperty('REV') || 0);
}
function load_() {
  const sh = boardSheet_();
  const n = sh.getLastRow();
  const text = n ? sh.getRange(1, 1, n, 1).getValues().map(function (r) { return String(r[0]).slice(MARK.length); }).join('') : '';
  return { rev: rev_(), data: text ? JSON.parse(text) : null };
}
/** Saves only if nobody saved since baseRev; otherwise returns the newer board to merge. */
function save_(data, baseRev) {
  if (!data || !Array.isArray(data.items)) throw new Error('invalid board');
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const rev = rev_();
    if (baseRev !== rev) { const cur = load_(); cur.conflict = true; return cur; }
    const text = JSON.stringify(data);
    const rows = [];
    for (let i = 0; i < text.length; i += CHUNK) rows.push([MARK + text.slice(i, i + CHUNK)]);
    const sh = boardSheet_();
    sh.clearContents();
    if (rows.length) sh.getRange(1, 1, rows.length, 1).setNumberFormat('@').setValues(rows);
    PropertiesService.getScriptProperties().setProperty('REV', String(rev + 1));
    return { rev: rev + 1 };
  } finally {
    lock.releaseLock();
  }
}

/* ---------------- Google Calendar (same JSON as the REST API) ---------------- */

function cal_(r) {
  const calId = String(r.cal || 'primary');
  switch (r.m) {
    case 'list': {
      const q = r.query || {};
      const opts = {};
      ['timeMin', 'timeMax', 'orderBy', 'pageToken'].forEach(function (k) { if (q[k]) opts[k] = String(q[k]); });
      if (q.singleEvents) opts.singleEvents = String(q.singleEvents) === 'true';
      opts.maxResults = Math.min(Number(q.maxResults) || 250, 2500);
      return Calendar.Events.list(calId, opts);
    }
    case 'insert': return Calendar.Events.insert(r.body, calId);
    case 'patch':  return Calendar.Events.patch(r.body, calId, String(r.id));
    case 'remove': Calendar.Events.remove(calId, String(r.id)); return null;
    case 'calendar': return Calendar.CalendarList.get(calId);
    default: throw new Error('unknown calendar op');
  }
}

function statusOf_(err) {
  const m = String(err && err.message || err);
  if (/not found/i.test(m)) return 404;
  if (/deleted|gone/i.test(m)) return 410;
  if (/forbidden|insufficient|permission/i.test(m)) return 403;
  if (/invalid|bad request/i.test(m)) return 400;
  return 500;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
