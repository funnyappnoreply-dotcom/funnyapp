const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Storage para imagens
const storageImagem = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'funnyapp',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1080, crop: 'limit', quality: 'auto' }]
  }
})

// Storage para vídeos
const storageVideo = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'funnyapp/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'webm', 'avi'],
    transformation: [{ width: 1080, crop: 'limit', quality: 'auto' }]
  }
})

const tiposImagem = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const tiposVideo = ['video/mp4', 'video/quicktime', 'video/webm', 'video/avi']

// Upload unificado: aceita imagem ou vídeo
const uploadMidia = multer({
  storage: multer.memoryStorage(), // armazena em memória para decidir o storage depois
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB para vídeos
  fileFilter: (req, file, cb) => {
    if ([...tiposImagem, ...tiposVideo].includes(file.mimetype)) cb(null, true)
    else cb(new Error('Formato não suportado. Use JPG, PNG, GIF, WebP, MP4, MOV ou WebM.'))
  }
})

// Upload só de imagem (usado em avatar)
const upload = multer({
  storage: storageImagem,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (tiposImagem.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Formato não suportado. Use JPG, PNG, GIF ou WebP.'))
  }
})

// Função para fazer upload direto no cloudinary baseado no tipo
const uploadParaCloudinary = async (buffer, mimetype, originalname) => {
  const isVideo = tiposVideo.includes(mimetype)
  const resourceType = isVideo ? 'video' : 'image'
  const folder = isVideo ? 'funnyapp/videos' : 'funnyapp'

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        ...(isVideo
          ? {}
          : { transformation: [{ width: 1080, crop: 'limit', quality: 'auto' }] })
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    stream.end(buffer)
  })
}

module.exports = { cloudinary, upload, uploadMidia, uploadParaCloudinary, tiposVideo }
