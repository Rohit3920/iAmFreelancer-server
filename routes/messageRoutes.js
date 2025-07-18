const express = require('express');
const router = express.Router();
const { getMessages, getMessageUser } = require('../controllers/messageController');

router.get('/:senderId/:receiverId', getMessages);
router.get('/:userId', getMessageUser);

module.exports = router;
