import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = 'uploads/';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}-${file.fieldname}${ext}`;
        cb(null, uniqueName);
    }
});

const resumeFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files are allowed"), false);  // Fixed typo: was `c` instead of `cb`
    }
};

export const uploadResume = multer({
    storage,
    fileFilter: resumeFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

export const upload = multer({ storage });
