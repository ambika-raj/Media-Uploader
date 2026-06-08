import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import uploadRoutes from "./routes/upload.routes.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename);

dotenv.config()
const PORT = process.env.PORT || 5000

const app = express()

app.use(cors({
    origin: "*", // allow all origin
    methods: ["GET", "POST", "DELETE"],
}))

app.use(express.json())

app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static files
// e.g. http://localhost:5000/uploads/photo.png will work directly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", uploadRoutes)

app.get("/", (req, res) => {
    res.json({ success: true, message: "Media Uploader API is running 🚀" });
})

app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    
    // Multer specific errors (e.g. file too large)
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
        success: false,
        message: "File too large! Max size is 50MB.",
        });
    }

    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
    })
})

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`)
})
