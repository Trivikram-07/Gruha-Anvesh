const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// No explicit config needed with CLOUDINARY_URL
console.log('Using CLOUDINARY_URL:', process.env.CLOUDINARY_URL);
console.log('Cloudinary config result:', cloudinary.config());

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    console.log('Preparing to upload:', file.originalname, 'MIME:', file.mimetype);
    const isImage = /image\/(jpeg|png)/.test(file.mimetype);
    return {
      folder: 'property_uploads',
      allowed_formats: ['jpg', 'jpeg', 'png', 'glb', 'gltf', 'obj'],
      resource_type: isImage ? 'image' : 'raw', // Use 'raw' for 3D models
    };
  },
});

// Multer Configuration for File Upload
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    console.log('File received:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
    });
    const allowedTypes = /jpeg|jpg|png|glb|gltf|obj/;
    const validMime = /image\/(jpeg|png)|model\/gltf-binary|application\/octet-stream/.test(file.mimetype);
    if (allowedTypes.test(file.originalname.toLowerCase()) && validMime) {
      console.log('File accepted:', file.originalname);
      cb(null, true);
    } else {
      console.log('File rejected:', file.originalname, 'MIME:', file.mimetype);
      cb(new Error('Only PNG, JPG, JPEG, GLB, GLTF, and OBJ files allowed'));
    }
  },
}).fields([
  { name: 'images', maxCount: 5 },
  { name: 'threeDModel', maxCount: 1 },
]);

const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err.message, 'File:', err.file || 'unknown', 'Details:', err);
      return res.status(400).json({
        message: 'File upload failed',
        error: err.message,
        details: err.message.includes('api_key') ? 'Cloudinary API key missing' : err,
      });
    }
    console.log('req.files after upload:', req.files);
    next();
  });
};

module.exports = { upload: uploadMiddleware };