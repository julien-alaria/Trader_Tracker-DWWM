import multer from "multer"
import path from "path"

// Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')// The folder where the images will be saved
    }, 
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = path.extname(file.originalname)
        
        // retrieve the email from the request, remove the special characters and spaces
        const userEmail = req.body.email 
            ? req.body.email.replace(/[@.]/g, '-').toLowerCase() 
            : "anonymous";

        // Result: picture-john-doe-gmail-com-17182938.png
        cb(null, `${file.fieldname}-${userEmail}-${uniqueSuffix}${ext}`);
    }
})

// Optionnel mais recommandé : Filtrer les fichiers (accepter uniquement les images)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|pdf/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
        return cb(null, true)
    } else {
        cb(new Error("Only images (jpeg, jpg, png, webp) and PDF are authorized"))
    }
}

// Initializing Multer with limits (e.g., max 5 MB per file)
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 Mo
})

export default upload