/**
 * Art By Shahbaz - Node.js Server (zero external dependencies)
 * Serves the website + Admin API so changes persist on the server.
 *
 * Run:  node server.js
 * Open: http://localhost:3000
 * Admin: admin@artbyshahbaz.com / admin123
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, 'data', 'data.json');
const PUBLIC_DIR = path.join(ROOT, 'public');
const UPLOADS_DIR = path.join(ROOT, 'uploads');

[path.join(ROOT, 'data'), UPLOADS_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    console.error('readData error:', e.message);
    return {
      credentials: { email: 'admin@artbyshahbaz.com', password: 'admin123' },
      settings: { title: 'Art By Shahbaz', description: '', about: '', logo: '', aboutImage: '', phone1: '', phone2: '', hoursWeekday: '', hoursSunday: '' },
      social: { instagram: '', tiktok: '', facebook: '', youtube: '' },
      categories: [], products: [], gallery: [], banners: [], reviews: [], faqs: []
    };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
}

const sessions = new Map();

function createToken() {
  return crypto.randomBytes(32).toString('hex');
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    const max = 60 * 1024 * 1024;
    req.on('data', c => {
      size += c.length;
      if (size > max) {
        reject(new Error('Body too large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        resolve({ _raw: raw });
      }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  });
  res.end(body);
}

function getToken(req) {
  return req.headers['x-admin-token'] || null;
}

function requireAuth(req, res) {
  const token = getToken(req);
  if (!token || !sessions.has(token)) {
    sendJSON(res, 401, { success: false, message: 'Unauthorized. Please login.' });
    return false;
  }
  return true;
}

function mimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm'
  };
  return map[ext] || 'application/octet-stream';
}

function serveStatic(req, res, filePath) {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const stream = fs.createReadStream(filePath);
  res.writeHead(200, { 'Content-Type': mimeType(filePath) });
  stream.pipe(res);
}

async function handleAPI(req, res, pathname) {
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, x-admin-token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    });
    return res.end();
  }

  if (method === 'GET' && pathname === '/api/data') {
    const data = readData();
    const publicData = { ...data };
    delete publicData.credentials;
    return sendJSON(res, 200, { success: true, data: publicData });
  }

  if (method === 'POST' && pathname === '/api/admin/login') {
    const body = await parseBody(req);
    const data = readData();
    if (body.email === data.credentials.email && body.password === data.credentials.password) {
      const token = createToken();
      sessions.set(token, { email: body.email, created: Date.now() });
      return sendJSON(res, 200, { success: true, token, message: 'Login successful' });
    }
    return sendJSON(res, 401, { success: false, message: 'Invalid email or password' });
  }

  if (method === 'POST' && pathname === '/api/admin/logout') {
    if (!requireAuth(req, res)) return;
    sessions.delete(getToken(req));
    return sendJSON(res, 200, { success: true });
  }

  if (method === 'GET' && pathname === '/api/admin/check') {
    if (!requireAuth(req, res)) return;
    return sendJSON(res, 200, { success: true });
  }

  if (method === 'PUT' && pathname === '/api/admin/data') {
    if (!requireAuth(req, res)) return;
    try {
      const incoming = await parseBody(req);
      const current = readData();
      const newData = { ...incoming, credentials: current.credentials };
      writeData(newData);
      return sendJSON(res, 200, { success: true, message: 'Data saved successfully' });
    } catch (e) {
      return sendJSON(res, 500, { success: false, message: e.message });
    }
  }

  if (method === 'PUT' && pathname === '/api/admin/settings') {
    if (!requireAuth(req, res)) return;
    const body = await parseBody(req);
    const data = readData();
    data.settings = { ...data.settings, ...body };
    writeData(data);
    return sendJSON(res, 200, { success: true, settings: data.settings });
  }

  if (method === 'PUT' && pathname === '/api/admin/social') {
    if (!requireAuth(req, res)) return;
    const body = await parseBody(req);
    const data = readData();
    data.social = { ...data.social, ...body };
    writeData(data);
    return sendJSON(res, 200, { success: true, social: data.social });
  }

  if (method === 'PUT' && pathname === '/api/admin/account') {
    if (!requireAuth(req, res)) return;
    const body = await parseBody(req);
    const data = readData();
    if (body.currentPassword && body.currentPassword !== data.credentials.password) {
      return sendJSON(res, 400, { success: false, message: 'Current password incorrect' });
    }
    if (body.email) data.credentials.email = body.email;
    if (body.password) data.credentials.password = body.password;
    writeData(data);
    return sendJSON(res, 200, { success: true, message: 'Account updated' });
  }

  if (pathname === '/api/admin/products' && method === 'POST') {
    if (!requireAuth(req, res)) return;
    const body = await parseBody(req);
    const data = readData();
    const product = { id: uuid(), ...body };
    data.products = data.products || [];
    data.products.push(product);
    writeData(data);
    return sendJSON(res, 200, { success: true, product });
  }

  if (pathname.startsWith('/api/admin/products/') && method === 'PUT') {
    if (!requireAuth(req, res)) return;
    const id = pathname.split('/').pop();
    const body = await parseBody(req);
    const data = readData();
    const idx = (data.products || []).findIndex(p => p.id === id);
    if (idx === -1) return sendJSON(res, 404, { success: false, message: 'Not found' });
    data.products[idx] = { ...data.products[idx], ...body, id };
    writeData(data);
    return sendJSON(res, 200, { success: true, product: data.products[idx] });
  }

  if (pathname.startsWith('/api/admin/products/') && method === 'DELETE') {
    if (!requireAuth(req, res)) return;
    const id = pathname.split('/').pop();
    const data = readData();
    data.products = (data.products || []).filter(p => p.id !== id);
    writeData(data);
    return sendJSON(res, 200, { success: true });
  }

  if (pathname === '/api/admin/categories' && method === 'POST') {
    if (!requireAuth(req, res)) return;
    const body = await parseBody(req);
    const data = readData();
    const cat = { id: uuid(), ...body };
    data.categories = data.categories || [];
    data.categories.push(cat);
    writeData(data);
    return sendJSON(res, 200, { success: true, category: cat });
  }

  if (pathname.startsWith('/api/admin/categories/') && method === 'DELETE') {
    if (!requireAuth(req, res)) return;
    const id = pathname.split('/').pop();
    const data = readData();
    data.categories = (data.categories || []).filter(c => c.id !== id);
    writeData(data);
    return sendJSON(res, 200, { success: true });
  }

  if (pathname === '/api/admin/gallery' && method === 'POST') {
    if (!requireAuth(req, res)) return;
    const body = await parseBody(req);
    const data = readData();
    data.gallery = data.gallery || [];
    data.gallery.push(body);
    writeData(data);
    return sendJSON(res, 200, { success: true });
  }

  if (pathname.startsWith('/api/admin/gallery/') && method === 'DELETE') {
    if (!requireAuth(req, res)) return;
    const idx = parseInt(pathname.split('/').pop(), 10);
    const data = readData();
    if (isNaN(idx) || idx < 0 || idx >= (data.gallery || []).length) {
      return sendJSON(res, 404, { success: false, message: 'Not found' });
    }
    data.gallery.splice(idx, 1);
    writeData(data);
    return sendJSON(res, 200, { success: true });
  }

  sendJSON(res, 404, { success: false, message: 'API route not found' });
}

const server = http.createServer(async (req, res) => {
  try {
    const parsed = url.parse(req.url, true);
    let pathname = parsed.pathname || '/';

    if (pathname.startsWith('/api/')) {
      return await handleAPI(req, res, pathname);
    }

    if (pathname.startsWith('/uploads/')) {
      const filePath = path.join(UPLOADS_DIR, path.basename(pathname));
      return serveStatic(req, res, filePath);
    }

    if (pathname === '/') pathname = '/index.html';
    const filePath = path.join(PUBLIC_DIR, pathname);
    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return serveStatic(req, res, filePath);
    }

    serveStatic(req, res, path.join(PUBLIC_DIR, 'index.html'));
  } catch (err) {
    console.error(err);
    sendJSON(res, 500, { success: false, message: err.message });
  }
});

server.listen(PORT, () => {
  console.log('');
  console.log('  Art By Shahbaz server running');
  console.log('  http://localhost:' + PORT);
  console.log('  Admin: admin@artbyshahbaz.com / admin123');
  console.log('  Data: ' + DATA_FILE);
  console.log('');
});
