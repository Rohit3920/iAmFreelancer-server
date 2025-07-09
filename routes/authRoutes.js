const express = require('express');
const { registerUser, loginUser, getUserByEmail, changePassword } = require('../controllers/authController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/forgetpassword/:email', getUserByEmail);
router.put('/change-password/:id', changePassword);

module.exports = router;