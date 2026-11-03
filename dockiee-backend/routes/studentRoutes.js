const express = require('express');
const multer = require('multer');
const path = require('path');
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Unique filename: user-id-timestamp.ext
        const ext = path.extname(file.originalname);
        cb(null, `file-${req.user.id}-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Protect all routes
router.use(authMiddleware.protect);

router.post('/upload', upload.single('file'), studentController.uploadFile);
router.post('/create-order', studentController.createOrder);
router.get('/orders', studentController.getMyOrders);

module.exports = router;
