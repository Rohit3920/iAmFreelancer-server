const mongoose = require('mongoose');

const GigSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    categoryMain: {
        type: String,
        required: true,
    },
    categorySub: {
        type: [String],
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    like: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        required: true,
    },
    totalStars: {
        type: Number,
        default: 0,
    },
    starNumber: {
        type: Number,
        default: 0,
    },
    cover: {
        type: String,
    },
    images: {
        type: [String],
    },
    shortTitle: {
        type: String,
    },
    shortDesc: {
        type: String,
    },
    deliveryTime: {
        type: Number,
        default: 3,
    },
    revisionNumber: {
        type: Number,
        default: 1,
    },
    coreFeatures: {
        type: [String],
        default: [],
    },
    serviceType: {
        type: String,
        default: '',
    },
    searchTags: {
        type: [String],
        default: ['gig', 'gigs'],
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Gig', GigSchema);