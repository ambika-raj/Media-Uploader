
const BASE_URL = "https://media-uploader-imby.onrender.com";

// ─────────────────────────────────────────────
// 🎯 Grab all DOM elements we need
// ─────────────────────────────────────────────
const fileInput       = document.getElementById("fileInput");
const dropZone        = document.getElementById("dropZone");
const selectedFileName = document.getElementById("selectedFileName");
const uploadBtn       = document.getElementById("uploadBtn");
const progressWrap    = document.getElementById("progressWrap");
const progressBar     = document.getElementById("progressBar");
const statusMsg       = document.getElementById("statusMsg");
const gallery         = document.getElementById("gallery");
const refreshBtn      = document.getElementById("refreshBtn");

// ─────────────────────────────────────────────
// 📁 FILE SELECTION — via Browse button
// ─────────────────────────────────────────────
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0]; // get first selected file
  if (file) {
    selectedFileName.textContent = file.name; // show filename
  }
});

// ─────────────────────────────────────────────
// 🖱️ DRAG & DROP events
// ─────────────────────────────────────────────

// When file is dragged OVER the zone → highlight it
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault(); // MUST prevent default to allow drop
  dropZone.classList.add("dragover"); // adds purple border (from CSS)
});

// When file is dragged OUT of the zone → remove highlight
dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

// When file is DROPPED onto the zone
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");

  const file = e.dataTransfer.files[0]; // get dropped file
  if (file) {
    // Manually assign it to the fileInput so upload logic works the same
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;
    selectedFileName.textContent = file.name;
  }
});

// ─────────────────────────────────────────────
// 📤 UPLOAD FILE — on button click
// ─────────────────────────────────────────────
uploadBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];

  // Validate — no file selected
  if (!file) {
    showStatus("⚠️ Please select a file first!", "error");
    return;
  }

  // Build FormData — this is how we send files to backend
  // "file" must match upload.single("file") in routes
  const formData = new FormData();
  formData.append("file", file);

  try {
    // Disable button during upload
    uploadBtn.disabled = true;
    uploadBtn.textContent = "Uploading...";

    // Show progress bar
    progressWrap.style.display = "block";
    animateProgress(); // fake progress animation (XHR needed for real %)

    const response = await fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      body: formData,
      // ⚠️ Do NOT set Content-Type header manually
      // fetch sets it automatically with the correct boundary for FormData
    });

    const data = await response.json();

    if (data.success) {
      showStatus(`✅ "${data.file.originalName}" uploaded successfully!`, "success");
      fileInput.value = "";  // clear input
      selectedFileName.textContent = "No file selected";
      loadFiles(); // refresh gallery
    } else {
      showStatus(`❌ ${data.message}`, "error");
    }

  } catch (err) {
    showStatus("❌ Upload failed. Is the server running?", "error");
  } finally {
    // Always re-enable button and reset progress
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload File";
    setTimeout(() => {
      progressWrap.style.display = "none";
      progressBar.style.width = "0%";
      progressBar.textContent = "0%";
    }, 6000);
  }
});

// ─────────────────────────────────────────────
// 📋 LOAD FILES — fetch all files from backend
// ─────────────────────────────────────────────
async function loadFiles() {
  try {
    const response = await fetch(`${BASE_URL}/api/files`);
    const data = await response.json();

    if (data.success && data.files.length > 0) {
      // Build a card for each file and inject into gallery
      gallery.innerHTML = data.files.map((file) => buildCard(file)).join("");
    } else {
      // Show empty state
      gallery.innerHTML = `<div class="empty-state">📭 No files uploaded yet</div>`;
    }
  } catch (err) {
    gallery.innerHTML = `<div class="empty-state">❌ Could not load files. Is the server running?</div>`;
  }
}

// ─────────────────────────────────────────────
// 🃏 BUILD FILE CARD — returns HTML string
// ─────────────────────────────────────────────
function buildCard(file) {
  const fileURL  = `${BASE_URL}${file.url}`;
  const ext      = file.filename.split(".").pop().toLowerCase();
  const isImage  = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
  const isVideo  = ["mp4", "webm", "ogg"].includes(ext);

  // Preview: image → <img>, video → <video>, other → emoji icon
  let preview = "";
  if (isImage) {
    preview = `<img src="${fileURL}" alt="${file.filename}" loading="lazy" />`;
  } else if (isVideo) {
    preview = `
      <video width="100%" height="140" style="object-fit:cover" muted>
        <source src="${fileURL}" type="video/${ext}" />
      </video>`;
  } else {
    // Pick an emoji based on file type
    const icons = {
      pdf: "📄", mp3: "🎵", wav: "🎵", zip: "🗜️",
      rar: "🗜️", doc: "📝", docx: "📝", txt: "📝",
      xlsx: "📊", csv: "📊", pptx: "📊",
    };
    const icon = icons[ext] || "📁";
    preview = `<div class="file-icon">${icon}</div>`;
  }

  return `
    <div class="file-card" id="card-${file.filename}">
      ${preview}
      <div class="file-card-info">
        <p title="${file.filename}">${file.filename}</p>
        <div class="card-actions">
          <button class="btn-view"   onclick="viewFile('${fileURL}')">👁 View</button>
          <button class="btn-delete" onclick="deleteFile('${file.filename}')">🗑 Delete</button>
        </div>
      </div>
    </div>`;
}

// ─────────────────────────────────────────────
// 👁️ VIEW FILE — opens in new tab
// ─────────────────────────────────────────────
function viewFile(url) {
  window.open(url, "_blank");
}

// ─────────────────────────────────────────────
// 🗑️ DELETE FILE
// ─────────────────────────────────────────────
async function deleteFile(filename) {
  if (!confirm(`Delete "${filename}"?`)) return; // ask confirmation

  try {
    const response = await fetch(`${BASE_URL}/api/files/${filename}`, {
      method: "DELETE",
    });
    const data = await response.json();

    if (data.success) {
      // Remove card from DOM directly — no need to reload all
      document.getElementById(`card-${filename}`)?.remove();
      showStatus("🗑️ File deleted!", "success");

      // If gallery is now empty, show empty state
      if (gallery.children.length === 0) {
        gallery.innerHTML = `<div class="empty-state">📭 No files uploaded yet</div>`;
      }
    } else {
      showStatus(`❌ ${data.message}`, "error");
    }
  } catch (err) {
    showStatus("❌ Delete failed. Is the server running?", "error");
  }
}

// ─────────────────────────────────────────────
// 💬 SHOW STATUS MESSAGE
// ─────────────────────────────────────────────
function showStatus(message, type) {
  statusMsg.textContent = message;
  statusMsg.className = `status-msg ${type}`; // adds "success" or "error" class
  // Auto clear after 4 seconds
  setTimeout(() => {
    statusMsg.textContent = "";
    statusMsg.className = "status-msg";
  }, 4000);
}

// ─────────────────────────────────────────────
// ⏳ FAKE PROGRESS BAR ANIMATION
// ─────────────────────────────────────────────
// fetch() doesn't give real upload % easily
// For real progress you'd use XMLHttpRequest
// This gives a good enough visual feel
function animateProgress() {
  let width = 0;
  const interval = setInterval(() => {
    if (width >= 90) {
      clearInterval(interval); // stop at 90%, jumps to 100% after response
      return;
    }
    width += 10;
    progressBar.style.width = width + "%";
    progressBar.textContent = width + "%";
  }, 300);
}

// ─────────────────────────────────────────────
// 🔄 REFRESH BUTTON
// ─────────────────────────────────────────────
refreshBtn.addEventListener("click", loadFiles);

// ─────────────────────────────────────────────
// 🚀 Load files on page load
// ─────────────────────────────────────────────
loadFiles();