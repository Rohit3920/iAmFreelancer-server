const catchAsync = require('../utils/catchAsync');
const Gig = require('../models/gigModel');
const Order = require('../models/orderModel');
const User = require('../models/authModel');
const mongoose = require('mongoose');

// Universal Search
exports.universalSearch = catchAsync(async (req, res, next) => {
    const { q } = req.query;
    if (!q) {
        return res.status(400).json({ status: 'fail', message: 'Query parameter "q" is required.' });
    }

    const searchRegex = new RegExp(q, 'i');
    const isValidObjectId = mongoose.Types.ObjectId.isValid(q);

    const gigResults = await Gig.find({
        $or: [
            { title: searchRegex },
            { description: searchRegex },
            { searchTags: searchRegex },
            { categoryMain: searchRegex },
            { categorySub: searchRegex },
        ]
    }).limit(10).populate('userId', 'username profilePicture');

    const orderSearchConditions = [
        { status: searchRegex },
    ];
    if (isValidObjectId) {
        orderSearchConditions.push({ _id: q });
    }
    const orderResults = await Order.find({ $or: orderSearchConditions })
        .populate('gigId')
        .populate('clientId')
        .populate('freelancerId')
        .limit(10);

    const userResults = await User.find({
        $or: [
            { username: searchRegex },
            { email: searchRegex },
            { 'DomainDetail.technologies': searchRegex },
            { 'DomainDetail.freelancerDomain': searchRegex }
        ]
    }).select('-password').limit(10);

    res.status(200).json({
        status: 'success',
        data: {
            gigs: gigResults,
            orders: orderResults,
            users: userResults,
        }
    });
});

// Order Search
exports.orderSearch = catchAsync(async (req, res, next) => {
    const { q, status, clientId, freelancerId } = req.query;
    let query = {};

    if (q) {
        const searchRegex = new RegExp(q, 'i');
        const isValidObjectId = mongoose.Types.ObjectId.isValid(q);

        const qConditions = [
            { status: searchRegex },
        ];
        if (isValidObjectId) {
            qConditions.push({ _id: q });
        }
        query.$or = qConditions;
    }
    if (status) {
        query.status = new RegExp(status, 'i');
    }
    if (clientId) {
        query.clientId = clientId;
    }
    if (freelancerId) {
        query.freelancerId = freelancerId;
    }

    const orders = await Order.find(query)
        .populate('gigId')
        .populate('clientId', 'username profilePicture')
        .populate('freelancerId', 'username profilePicture')
        .limit(20);

    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: {
            orders,
        },
    });
});

// Gig Search
exports.gigSearch = catchAsync(async (req, res, next) => {
    const { q, category, minPrice, maxPrice, deliveryTime, userId } = req.query;
    let query = {};

    if (q) {
        const searchRegex = new RegExp(q, 'i');
        query.$or = [
            { title: searchRegex },
            { description: searchRegex },
            { searchTags: searchRegex },
            { shortTitle: searchRegex },
            { shortDesc: searchRegex },
        ];
    }
    if (category) {
        query.$or = [
            ...(query.$or || []),
            { categoryMain: new RegExp(category, 'i') },
            { categorySub: new RegExp(category, 'i') }
        ];
    }
    if (minPrice) {
        query.price = { ...query.price, $gte: parseFloat(minPrice) };
    }
    if (maxPrice) {
        query.price = { ...query.price, $lte: parseFloat(maxPrice) };
    }
    if (deliveryTime) {
        query.deliveryTime = { ...query.deliveryTime, $lte: parseInt(deliveryTime) };
    }
    if (userId) {
        query.userId = userId;
    }

    const gigs = await Gig.find(query).populate('userId', 'username profilePicture').limit(20);

    res.status(200).json({
        status: 'success',
        results: gigs.length,
        data: {
            gigs,
        },
    });
});

// Technologies Search
exports.technologySearch = catchAsync(async (req, res, next) => {
    const { q } = req.query;
    if (!q) {
        return res.status(400).json({ status: 'fail', message: 'Query parameter "q" (technology name) is required.' });
    }

    const searchRegex = new RegExp(q, 'i');

    const usersWithTech = await User.find({
        'DomainDetail.technologies': searchRegex,
        userRole: 'freelancer'
    }).select('-password').limit(20);

    res.status(200).json({
        status: 'success',
        results: usersWithTech.length,
        data: {
            freelancers: usersWithTech,
        },
    });
});

// User Search
exports.userSearch = catchAsync(async (req, res, next) => {
    const { q, role } = req.query;
    let query = {};

    if (q) {
        const searchRegex = new RegExp(q, 'i');
        query.$or = [
            { username: searchRegex },
            { email: searchRegex },
            { 'DomainDetail.technologies': searchRegex },
            { 'DomainDetail.freelancerDomain': searchRegex },
            { 'education.fieldOfStudy': searchRegex },
            { 'education.institutionName': searchRegex },
            { 'education.fieldOfStudy': searchRegex },
            { 'address.street': searchRegex },
            { 'address.city': searchRegex },
            { 'address.state': searchRegex },
            { 'address.zipCode': searchRegex },
            { 'address.country': searchRegex }
        ];
    }
    if (role) {
        query.userRole = role;
    }

    const users = await User.find(query).select('-password').limit(20);

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users,
        },
    });
});