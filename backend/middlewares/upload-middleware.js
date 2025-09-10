const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUD_SECRET
});

// Single storage configuration for all uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    // Dynamic folder based on route
    const folder = req.originalUrl.includes('register') 
      ? 'storage/registrations' 
      : 'storage/logins';
    
    return {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png'],
      transformation: [{ width: 800, height: 800, crop: 'limit' }],
      resource_type: 'auto',
      public_id: `${Date.now()}-${Math.round(Math.random() * 1E9)}` // Unique filename
    };
  }
});

// Single multer instance for all routes
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

module.exports = upload;