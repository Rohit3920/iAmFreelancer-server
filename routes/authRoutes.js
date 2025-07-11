const express = require('express');
const {
    registerUser,
    loginUser,
    getUserByEmail,
    changePassword,
    updateUser,
    getUserById,
    getUser } = require('../controllers/authController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', getUser);
router.get('/:userId', getUserById);
router.get('/forgetpassword/:email', getUserByEmail);
router.put('/:userId', updateUser);
router.put('/change-password/:id', changePassword);

module.exports = router;