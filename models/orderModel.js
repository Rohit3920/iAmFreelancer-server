const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
    {
        gigId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Gig',
            required: [true, 'Order must belong to a gig.'],
        },
        clientId: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Order must have a client.'],
        },
        freelancerId: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Order must have a freelancer.'],
        },
        price: {
            type: Number,
            required: [true, 'Order must have a price.'],
            min: 0,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'in progress', 'completed', 'delivered', 'cancelled', 'disputed'],
            default: 'pending',
        },
        deliveryDate: {
            type: Date,
            // Optional: Set if gig has a specific delivery time
        },
        isReviewed: {
            type: Boolean,
            default: false,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

OrderSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

OrderSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'gigId',
        select: 'title cover shortDesc price owner',
    }).populate({
        path: 'clientId',
        select: 'username profilePicture',
    }).populate({
        path: 'freelancerId',
        select: 'username profilePicture',
    });
    next();
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;