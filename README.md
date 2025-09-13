# File Uploader App

Simple, responsive web app for uploading, listing, downloading, and deleting files. Built with Node.js, Express, and Multer.

## Run

1. Install dependencies

```bash
npm install
```

2. Start the server

```bash
npm start
```

3. Open the app

- Visit `http://localhost:3000`

## Features

- Multiple file uploads (drag-and-drop or file picker)
- Progress indication per file
- List, download, and delete files
- Stores files on disk in `uploads/` and metadata in `data/files.json`

## Notes

- File size limit is 100 MB per file (configure in `server.js`).
- Endpoints:
  - `POST /api/upload` (field name: `files`)
  - `GET /api/files`
  - `GET /api/files/:id/download`
  - `DELETE /api/files/:id`

# cursor-new-app
new app testv on cursor
