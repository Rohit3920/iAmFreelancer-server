const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    gigId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gig',
        required: true
    },
    userId: {
        type: String,
        required: true
    }
}, { timestamps: true });

likeSchema.index({ gigId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);