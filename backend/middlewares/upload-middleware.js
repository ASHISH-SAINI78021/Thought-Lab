const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
console.log("🛠️ Configuring Cloudinary with:");
console.log(`- Cloud Name: ${process.env.CLOUD_NAME}`);
console.log(`- API Key: ${process.env.CLOUDINARY_API ? '✅ Present' : '❌ Missing'}`);
console.log(`- API Secret: ${process.env.CLOUD_SECRET ? '✅ Present' : '❌ Missing'}`);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUD_SECRET
});

// Single storage configuration for all uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    console.log(`📡 Multer-Cloudinary: Starting upload for ${file.originalname}`);
    
    // Dynamic folder based on route
    const folder = req.originalUrl.includes('register') 
      ? 'ThoughtLab/Registrations' 
      : 'ThoughtLab/Others';
    
    console.log(`📁 Target folder: ${folder}`);
    
    return {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      // Simplified params avoid signature mismatch issues
      transformation: [{ width: 500, height: 500, crop: 'fill' }]
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