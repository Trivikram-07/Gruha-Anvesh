const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Log Cloudinary setup
console.log('Using CLOUDINARY_URL:', process.env.CLOUDINARY_URL);
const cloudinaryConfig = cloudinary.config();
console.log('Cloudinary config result:', {
  cloud_name: cloudinaryConfig.cloud_name,
  api_key: !!cloudinaryConfig.api_key, // Hide actual key, just confirm it’s set
  api_secret: !!cloudinaryConfig.api_secret, // Hide actual secret
});

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    console.log('Preparing to upload:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      fieldname: file.fieldname,
    });
    const isImage = /image\/(jpeg|png|webp)/.test(file.mimetype); // Updated to include webp
    return {
      folder: 'property_uploads',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'glb', 'gltf', 'obj'], // Added webp
      resource_type: isImage ? 'image' : 'raw',
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

// Multer Configuration
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const fileInfo = {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
    };
    console.log('File received:', fileInfo);

    const allowedExt = /\.(jpeg|jpg|png|webp|glb|gltf|obj)$/i; // Added webp
    const allowedMime = /^(image\/(jpeg|png|webp)|model\/gltf-binary|application\/octet-stream)$/i; // Added image/webp
    const isValidExt = allowedExt.test(file.originalname);
    const isValidMime = allowedMime.test(file.mimetype);

    if (isValidExt && isValidMime) {
      console.log('File accepted:', file.originalname);
      cb(null, true);
    } else {
      console.log('File rejected:', file.originalname, 'MIME:', file.mimetype);
      const error = new Error('Only PNG, JPG, JPEG, WEBP, GLB, GLTF, and OBJ files allowed');
      error.file = fileInfo;
      cb(error);
    }
  },
}).fields([
  { name: 'images', maxCount: 5 },
  { name: 'threeDModel', maxCount: 1 },
]);

const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', {
        code: err.code,
        message: err.message,
        field: err.field,
      });
      return res.status(400).json({
        message: 'File upload failed',
        error: `Multer error: ${err.message}`,
      });
    } else if (err) {
      console.error('Upload error:', {
        message: err.message,
        file: err.file || 'unknown',
        stack: err.stack,
      });
      return res.status(400).json({
        message: 'File upload failed',
        error: err.message,
        details: err.message.includes('api_key') ? 'Cloudinary API key missing or invalid' : undefined,
      });
    }

    console.log('req.files after upload:', req.files || 'No files uploaded');
    console.log('req.body after upload:', req.body);
    next();
  });
};

module.exports = { upload: uploadMiddleware };