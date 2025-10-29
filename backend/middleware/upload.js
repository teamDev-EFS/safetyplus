// middleware/uploads.js
import multer from "multer";
import path from "path";
import fs from "fs";

/**
 * Centralized bucket → directory map.
 * You can pass any of these keys to setBucket(key).
 * If you pass a custom path to setBucket("/some/dir"), that path will be used directly.
 */
const BUCKET_DIRS = {
  team: "uploads/team",
  products: "uploads/products",
  branches: "uploads/branches",
  posts: "uploads/posts",
  "gallery/albums": "uploads/gallery/albums",
  "gallery/images": "uploads/gallery/images",
  settings: "uploads/settings",
  default: "uploads",
};

const createDirectories = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * Resolve destination directory.
 * Priority:
 *   1) req.bucket (set via setBucket) – may be a known key or a direct path
 *   2) fieldname mapping (backward compatible)
 *   3) default
 */
function resolveDest(req, file) {
  // 1) setBucket override (supports key or direct path)
  if (req.bucket) {
    // If it's a known key, map it; otherwise treat as a path
    return BUCKET_DIRS[req.bucket] || req.bucket;
  }

  // 2) Backward-compatible fieldname mapping
  switch (file.fieldname) {
    case "photo":
      return BUCKET_DIRS.team;
    case "cover":
      return BUCKET_DIRS["gallery/albums"];
    case "images":
      return BUCKET_DIRS.products;
    case "branchImage":
      return BUCKET_DIRS.branches;
    case "postCover":
      return BUCKET_DIRS.posts;
    // New: hero banner for site settings
    case "hero":
      return BUCKET_DIRS.settings;
    default:
      return BUCKET_DIRS.default;
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const dir = resolveDest(req, file);
      createDirectories(dir);
      cb(null, dir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (_req, file, cb) => {
    const base = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "");
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${base || file.fieldname}-${unique}${path
        .extname(file.originalname)
        .toLowerCase()}`
    );
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  cb(new Error("Invalid file type. Only images are allowed."));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/**
 * setBucket(keyOrPath)
 * - keyOrPath can be one of BUCKET_DIRS keys (e.g., "team", "posts", "gallery/albums")
 *   OR a custom relative/absolute path like "uploads/custom" or "/var/data/uploads".
 * - This value takes precedence over fieldname mapping for all files in the request.
 */
export const setBucket = (keyOrPath) => (req, _res, next) => {
  req.bucket = keyOrPath; // we resolve it in resolveDest()
  next();
};
