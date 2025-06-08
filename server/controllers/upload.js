import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}-${file.fieldname}${ext}`;
        cb(null, uniqueName);
    }
});

const resumeFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        c(new Error("Only PDF files are allowed"), false);
    }
}

export const uploadResume = multer({
    storage,
    fileFilter: resumeFilter,
    limits: {fileSize: 2 * 1024 * 1024}
})

export const upload = multer({ storage: storage});