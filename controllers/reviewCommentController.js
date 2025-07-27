const ReviewComments = require('../models/reviewCommentModel');
const Gig = require('../models/gigModel');
const catchAsync = require('../utils/catchAsync');

exports.createReview = catchAsync(async (req, res, next) => {
    if (!req.body.gigId) req.body.gigId = req.params.gigId;
    if (!req.body.userId) req.body.userId = req.params.userId;

    const gig = await Gig.findById(req.body.gigId);
    if (!gig) {
        return res.status(404).json({
            status: 'fail',
            message: 'Gig not found with that ID.',
        });
    }

    const existingReview = await ReviewComments.findOne({
        gigId: req.body.gigId,
        userId: req.body.userId,
    });
    if (existingReview) {
        return res.status(400).json({
            status: 'fail',
            message: 'You have already reviewed this gig.',
        });
    }

    const newReview = await ReviewComments.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            review: newReview,
        },
    });
});

exports.getGigReviews = catchAsync(async (req, res, next) => {
    const reviews = await ReviewComments.find();

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews,
        },
    });
});

exports.getReview = catchAsync(async (req, res, next) => {
    const review = await ReviewComments.findById(req.params.id);

    if (!review) {
        return res.status(200).json({
            status: 'success',
            message: 'No review found with that ID.',
            data: {
                review: null,
            },
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            review,
        },
    });
});

exports.updateReview = catchAsync(async (req, res, next) => {
    const review = await ReviewComments.findById(req.params.id);

    if (!review) {
        return res.status(404).json({
            status: 'fail',
            message: 'No review found with that ID.',
        });
    }

    const allowedUpdates = ['rating', 'comment'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) =>
        allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
        return res.status(400).json({
            status: 'fail',
            message: 'Invalid updates!',
        });
    }

    updates.forEach((update) => (review[update] = req.body[update]));
    await review.save();

    res.status(200).json({
        status: 'success',
        data: {
            review,
        },
    });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
    const review = await ReviewComments.findById(req.params.id);

    if (!review) {
        return res.status(404).json({
            status: 'fail',
            message: 'No review found with that ID.',
        });
    }

    await ReviewComments.deleteOne({ _id: req.params.id }); // Corrected to delete the found review

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

exports.getReviewsByUserId = catchAsync(async (req, res, next) => {
    // Populate the 'gigId' field to get gig information, specifically the 'title'
    const reviews = await ReviewComments.find({ userId: req.params.userId })
        .populate({
            path: 'gigId',
            select: 'title', // Only select the 'title' field from the Gig model
        });

    if (reviews.length === 0) {
        return     res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews : null,
        },
    });
    }

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews,
        },
    });
});