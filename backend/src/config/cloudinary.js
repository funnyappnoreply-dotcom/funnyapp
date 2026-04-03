const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'funnyapp',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1080, crop: 'limit', quality: 'auto' }]
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const tipos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (tipos.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Formato não suportado. Use JPG, PNG, GIF ou WebP.'))
  }
})

module.exports = { cloudinary, upload }
