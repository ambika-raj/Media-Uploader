import express from "express"
import upload from "../middleware/multer.config.js"
import fs from "fs"
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router()

// post - upload one file
router.post("/upload", upload.single("file"), (req, res) => {
    // upload.single("file") → This is Multer working as middleware
    // upload.single("file") → "file" must match the field name in frontend form
    if(!req.file) {
        return res.status(400).json({
            success: false,
            message: "No file uploaded"
        });
    }
    res.status(200).json({
        success: true,
        message: "File uploaded successfully!",
        file: {
            originalName: req.file.originalname, // original filename
            savedAs: req.file.filename, // renamed filename on disk
            size: req.file.size, //size in bytes
            mimetype: req.file.mimetype, // eg: image/png, video/mp4
            url: `/uploads/${req.file.filename}`, //public url to access file
        },
    });
});

// get - /api/files - get list of all uploaded files
router.get("/files", (req, res) => {
    const uploadDir = "uploads";

    // read all filenames from the uploads folder
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).json({
                success: false, 
                message: "Could not read files"
            });
        }
        // build a url for each file so frontend can display them
        const fileList = files.map((filename) => ({
            filename,
            url: `/uploads/${filename}`,
        }));
        res.status(200).json({
            success: true,
            files: fileList
        });
    });
});

// delete /api/files/:filename - delete a file
router.delete("/files/:filename", (req, res) => {
    const filename = req.params.filename;
    console.log("Deleting:", filename);

    const filePath = path.join(__dirname, "..", "uploads", filename);
    console.log("Full path:", filePath)

    // check if file actually exists before trying to delete
    if(!fs.existsSync(filePath)) {
        return res.status(404).json({
            success: false,
            message: "File not found"
        });
    }

    fs.unlink(filePath, (err) => {
        if(err) {
            return res.status(500).json({
                success: false,
                message: "Could not delete file"
            });
        }
        res.status(200).json({
            success: true,
            message: "File deleted successfully!"
        });
    });
});

export default router;