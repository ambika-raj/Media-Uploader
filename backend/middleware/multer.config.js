import multer from "multer"
import path from "path"
import fs from "fs"

// uploads folder should exists
const uploadDir = "uploads";

if(!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// storage config - tells multer where & how to save files
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir)
    },

    // Filename: rename file to avoid duplicates
    // Example: image.png → 1717123456789-482910293.png
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname); // get extension e.g. .png
        cb(null, uniqueSuffix + ext);
    },
});

// FILE FILTER — accept all file types
const fileFilter = (req, file, cb) => {
    cb(null, true); // true = accept the file
};

// LIMITS — max file size 50MB 
const limits = {
    fileSize: 50 * 1024 * 1024, // 50MB in bytes
};

// Final multer instance — export this to use in routes
const upload = multer({
    storage,
    fileFilter,
    limits,
});

export default upload;