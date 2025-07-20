const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
    {
        rating: {
            type: Number,
            min: [1, 'Rating must be at least 1.0'],
            max: [5, 'Rating must be at most 5.0'],
            required: [true, 'A review must have a rating.'],
            set: (val) => Math.round(val * 10) / 10,
        },
        comment: {
            type: String,
            trim: true,
            required: [true, 'A review must have a comment.'],
            minlength: [10, 'Comment must be at least 10 characters long.'],
        },
        userId: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'A review must belong to a user.'],
        },
        gigId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Gig',
            required: [true, 'A review must belong to a gig.'],
        },
        orderId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Order',
            required: [true, 'A review must belong to a gig.'],
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

ReviewSchema.index({ gigId: 1, userId: 1 }, { unique: true });

ReviewSchema.statics.calcAverageRatings = async function (gigId) {
    const stats = await this.aggregate([
        {
            $match: { gigId: gigId },
        },
        {
            $group: {
                _id: '$gigId',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            },
        },
    ]);

    try {
        if (stats.length > 0) {
            await mongoose.model('Gig').findByIdAndUpdate(gigId, {
                ratingsQuantity: stats[0].nRating,
                ratingsAverage: stats[0].avgRating,
            });
        } else {
            await mongoose.model('Gig').findByIdAndUpdate(gigId, {
                ratingsQuantity: 0,
                ratingsAverage: 0,
            });
        }
    } catch (err) {
        console.error('Error updating gig ratings:', err);
    }
};

ReviewSchema.post('save', function () {
    this.constructor.calcAverageRatings(this.gigId);
});

ReviewSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.findOne();
    next();
});

ReviewSchema.post(/^findOneAnd/, async function () {
    if (this.r) {
        await this.r.constructor.calcAverageRatings(this.r.gigId);
    }
});

ReviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'userId',
        select: 'username profilePicture',
    });
    next();
});

const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;