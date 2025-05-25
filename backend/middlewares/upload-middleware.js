const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, "storage/"); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith("image/")) {
          return cb(new Error("Only image files are allowed!"), false);
      }
      cb(null, true);
  }
});


module.exports = upload;
