const express = require('express');
const cors = require('cors');
const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://imadtbn.github.io';
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json');

const required = ['VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY', 'VAPID_SUBJECT'];
for (const name of required) {
  if (!process.env[name]) {
    console.error(`Missing environment variable: ${name}`);
    process.exit(1);
  }
}

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json({ limit: '256kb' }));

function loadData() {
  try {
    if (!fs.existsSync(DATA_FILE)) return { subscriptions: {}, schedules: [] };
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { subscriptions: {}, schedules: [] };
  }
}

let db = loadData();
function persist() {
  const tmp = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DATA_FILE);
}

function validSubscription(s) {
  return !!(s && typeof s.endpoint === 'string' && s.keys &&
    typeof s.keys.p256dh === 'string' && typeof s.keys.auth === 'string');
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'student-dz-web-push' });
});

app.get('/public-key', (_req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

app.post('/subscribe', (req, res) => {
  const { clientId, subscription } = req.body || {};
  if (!clientId || !/^[a-zA-Z0-9_-]{20,100}$/.test(clientId) || !validSubscription(subscription)) {
    return res.status(400).json({ ok: false, error: 'Invalid subscription' });
  }
  db.subscriptions[clientId] = { subscription, updatedAt: new Date().toISOString() };
  persist();
  res.json({ ok: true });
});

app.post('/schedule', (req, res) => {
  const { clientId, entries } = req.body || {};
  if (!clientId || !db.subscriptions[clientId] || !Array.isArray(entries)) {
    return res.status(400).json({ ok: false, error: 'Invalid schedule request' });
  }

  const now = Date.now();
  const incoming = entries
    .filter(e => e && e.id && e.date && e.time && !(e.type === 'task' && e.done))
    .map(e => ({
      key: `${clientId}:${e.id}:${e.date}:${e.time}:${Number(e.reminder) || 0}`,
      clientId,
      entryId: String(e.id),
      title: String(e.title || 'تذكير Student DZ').slice(0, 120),
      type: String(e.type || 'note'),
      dueAt: new Date(`${e.date}T${e.time}:00`).getTime() - (Number(e.reminder) || 0) * 60000
    }))
    .filter(e => Number.isFinite(e.dueAt) && e.dueAt > now - 60000);

  db.schedules = db.schedules.filter(x => x.clientId !== clientId);
  db.schedules.push(...incoming);
  persist();
  res.json({ ok: true, scheduled: incoming.length });
});

app.post('/unsubscribe', (req, res) => {
  const { clientId } = req.body || {};
  if (clientId) {
    delete db.subscriptions[clientId];
    db.schedules = db.schedules.filter(x => x.clientId !== clientId);
    persist();
  }
  res.json({ ok: true });
});

async function dispatchDue() {
  const now = Date.now();
  const due = db.schedules.filter(item => item.dueAt <= now);
  if (!due.length) return;

  const remaining = db.schedules.filter(item => item.dueAt > now);
  db.schedules = remaining;

  for (const item of due) {
    const record = db.subscriptions[item.clientId];
    if (!record) continue;
    const payload = JSON.stringify({
      title: 'Student DZ — تذكير',
      body: `${item.title} — موعد التذكير`,
      url: 'https://imadtbn.github.io/student-dz/tools/notes-calendar.html',
      tag: `student-dz-${item.entryId}`
    });
    try {
      await webpush.sendNotification(record.subscription, payload, { TTL: 3600 });
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 410) {
        delete db.subscriptions[item.clientId];
        db.schedules = db.schedules.filter(x => x.clientId !== item.clientId);
      } else {
        console.error('Push delivery failed:', error.statusCode || error.message);
      }
    }
  }
  persist();
}

setInterval(() => dispatchDue().catch(err => console.error(err)), 30000);

app.listen(PORT, () => console.log(`Student DZ Push server listening on ${PORT}`));
