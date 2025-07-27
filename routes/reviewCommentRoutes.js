const express = require('express');
const reviewCommentController = require('../controllers/reviewCommentController');
// const authController = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

// router.use(authController.protect);

    router.post("/:userId/reviews/:gigId", reviewCommentController.createReview)
    router.get("/", reviewCommentController.getGigReviews);
    router.get('/users/:userId', reviewCommentController.getReviewsByUserId)
    router.get('/:id', reviewCommentController.getReview)
    router.put('/:id', reviewCommentController.updateReview)
    router.delete('/:id', reviewCommentController.deleteReview);

module.exports = router;