import multer from "multer"
import path from "path"

// Configuration du stockage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Le dossier où seront sauvegardées les images
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname); 
        
        // On récupère l'email de la requête, on enlève les caractères spéciaux et les espaces
        const userEmail = req.body.email 
            ? req.body.email.replace(/[@.]/g, '-').toLowerCase() 
            : "anonymous";

        // Résultat : picture-jean-dupont-gmail-com-17182938.png
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

// Initialisation de Multer avec des limites (ex: max 5 Mo par fichier)
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 Mo
})

export default upload