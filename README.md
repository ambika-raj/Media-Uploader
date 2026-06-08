# 📁 Media Uploader

A full-stack media uploading app built with **Node.js**, **Express**, and **Multer** on the backend, and plain **HTML/CSS/JS** on the frontend.

Supports uploading **any file type** — images, videos, PDFs, audio, and more.

---

## ✨ Features

- 📤 Upload any file type (images, videos, PDFs, audio, zip, etc.)
- 🖱️ Drag & drop support
- 📋 View all uploaded files in a gallery
- 👁️ Open/preview any file in a new tab
- 🗑️ Delete files
- ⏳ Upload progress bar
- 🌐 REST API backend (Express + Multer)
- 📦 ES Modules throughout (`import/export`)

---

## 🗂️ Folder Structure

```
media-uploader/
│
├── backend/
│   ├── uploads/                  # Uploaded files stored here (auto-created)
│   ├── middleware/
│   │   └── multer.config.js      # Multer storage & file filter config
│   ├── routes/
│   │   └── upload.routes.js      # API routes (upload, list, delete)
│   ├── server.js                 # Express app entry point
│   ├── .env                      # Environment variables (PORT)
│   └── package.json
│
└── frontend/
    ├── index.html                # Main UI
    ├── style.css                 # Pastel peach/pink styling
    └── script.js                 # Fetch API + drag & drop logic
```

---

## 🚀 Getting Started


### 🛣️ API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/api/upload` | Upload a single file |
| `GET` | `/api/files` | Get list of all uploaded files |
| `DELETE` | `/api/files/:filename` | Delete a specific file |

### Example: Upload a file

```bash
curl -X POST http://localhost:5000/api/upload \
  -F "file=@/path/to/your/photo.png"
```

### Example Response

```json
{
  "success": true,
  "message": "File uploaded successfully!",
  "file": {
    "originalName": "photo.png",
    "savedAs": "1717123456789-482910293.png",
    "size": 204800,
    "mimetype": "image/png",
    "url": "/uploads/1717123456789-482910293.png"
  }
}
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| File Upload | Multer |
| Environment | dotenv |
| Cross-Origin | cors |
| Frontend | HTML, CSS, Vanilla JS |
| Module System | ES Modules (`import/export`) |

---

## 🌍 Deployment

### Backend → [[Render]([https://render.com](https://media-uploader-imby.onrender.com))](https://media-uploader-imby.onrender.com)


---

