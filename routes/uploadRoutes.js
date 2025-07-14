const express = require('express');
const {uploadImage} = require('../controllers/uploadController');
const router = express.Router();
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.single('image'), uploadImage);

module.exports = router;