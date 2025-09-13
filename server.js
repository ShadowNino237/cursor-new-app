"use strict";

const express = require("express");
const multer = require("multer");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();

const UPLOAD_DIR = path.resolve(__dirname, "uploads");
const DATA_DIR = path.resolve(__dirname, "data");
const DATA_FILE = path.resolve(DATA_DIR, "files.json");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2));
}

function readDatabase() {
  try {
    const content = fs.readFileSync(DATA_FILE, "utf8");
    if (!content) return {};
    return JSON.parse(content);
  } catch (error) {
    return {};
  }
}

function writeDatabase(database) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(database, null, 2));
}

const storage = multer.diskStorage({
  destination: function destination(_req, _file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function filename(_req, file, cb) {
    const id = crypto.randomUUID();
    const extension = path.extname(file.originalname || "");
    const storedName = `${id}${extension}`;
    file._generatedId = id;
    file._storedName = storedName;
    cb(null, storedName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024
  }
});

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", function (_req, res) {
  res.json({ ok: true });
});

app.post("/api/upload", upload.array("files", 50), function (req, res) {
  const database = readDatabase();
  const files = (req.files || []).map(function mapFile(file) {
    const metadata = {
      id: file._generatedId,
      originalName: file.originalname,
      storedName: file._storedName || file.filename,
      size: file.size,
      mimeType: file.mimetype,
      uploadDate: new Date().toISOString()
    };
    database[metadata.id] = metadata;
    return metadata;
  });
  writeDatabase(database);
  res.json({ files });
});

app.get("/api/files", function (_req, res) {
  const database = readDatabase();
  const files = Object.values(database).sort(function sortByDate(a, b) {
    return new Date(b.uploadDate) - new Date(a.uploadDate);
  });
  res.json({ files });
});

app.get("/api/files/:id/download", function (req, res) {
  const database = readDatabase();
  const record = database[req.params.id];
  if (!record) {
    return res.status(404).json({ error: "File not found" });
  }
  const filePath = path.join(UPLOAD_DIR, record.storedName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File missing on disk" });
  }
  res.download(filePath, record.originalName);
});

app.delete("/api/files/:id", function (req, res) {
  const database = readDatabase();
  const record = database[req.params.id];
  if (!record) {
    return res.status(404).json({ error: "File not found" });
  }
  const filePath = path.join(UPLOAD_DIR, record.storedName);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (_e) {
  }
  delete database[req.params.id];
  writeDatabase(database);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function onListen() {
  /* eslint-disable no-console */
  console.log(`File upload server running on http://localhost:${PORT}`);
});

