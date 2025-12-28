const multer = require('multer');
const path = require('path');
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors());
app.use(express.json());

// create connection pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'myapp_user',
  password: 'MyStrongPass123!',
  database: 'animal_rescue'
});

// test route
app.get('/', (req, res) => {
  res.send('API is working');
});

// get all todos
app.get('/api/reports', (req, res) => {
  const onlyOpen = req.query.onlyOpen === 'true';

  let sql = `
    SELECT id, image_path, description, reporter_name, reporter_phone,
           latitude, longitude, status, created_at
    FROM reports
  `;
  if (onlyOpen) {
    sql += " WHERE status != 'RESOLVED'";
  }
  sql += ' ORDER BY created_at DESC';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('DB error in GET /api/reports:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    console.log('Sending reports:', results.length);
    res.json(results);
  });
});

// create a todo
app.post('/api/reports', upload.single('photo'), (req, res) => {
  const { description, reporter_name, reporter_phone, latitude, longitude } = req.body;
  console.log('Received body:', req.body);
  const image_path = req.file ? `/uploads/${req.file.filename}` : null;

  const sql = `
    INSERT INTO reports (image_path, description, reporter_name, reporter_phone, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [image_path, description, reporter_name, reporter_phone, latitude || null, longitude || null],
    (err, result) => {
      if (err) {
        console.error('DB error in POST /api/reports:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({
        id: result.insertId,
        image_path,
        description,
        reporter_name,
        reporter_phone,
        latitude,
        longitude
      });
    }
  );
});

app.patch('/api/reports/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ['PENDING', 'ON_THE_WAY', 'RESOLVED'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const sql = 'UPDATE reports SET status = ? WHERE id = ?';

  db.query(sql, [status, id], (err, result) => {
    if (err) {
      console.error('DB error in PATCH /api/reports/:id/status:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.status(204).end();
  });
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

