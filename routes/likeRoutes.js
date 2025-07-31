const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');

router.post('/gig/:gigId', likeController.likeGig);
router.delete('/gig/:gigId/:userId', likeController.unlikeGig);
router.get('/liked-gigs/:userId', likeController.getLikedByUserId);
router.get('/gigs/:gigId/is-liked', likeController.getLikedByGigId);

module.exports = router;