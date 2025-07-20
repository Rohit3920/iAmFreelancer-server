const Order = require('../models/orderModel');
const Gig = require('../models/gigModel');
const catchAsync = require('../utils/catchAsync');

exports.createOrder = catchAsync(async (req, res, next) => {
    const { gigId } = req.body;
    const clientId = req.params.userId;

    const gig = await Gig.findById(gigId);

    if (!gig) {
        return res.status(404).json({
            status: 'fail',
            message: 'Gig not found.',
        });
    }

    const newOrder = await Order.create({
        gigId,
        clientId,
        freelancerId: gig.userId,
        price: gig.price,
        status: 'pending',
    });

    res.status(201).json({
        status: 'success',
        data: {
            order: newOrder,
        },
    });
});

exports.getOrders = catchAsync(async (req, res, next) => {
    const userId = req.params.userId;
    const userRole = req.params.userRole;

    let orders;
    if (userRole === 'user') {
        orders = await Order.find({ clientId: userId });
    } else if (userRole === 'freelancer') {
        orders = await Order.find({ freelancerId: userId });
    } else if (userRole === 'admin') {
        orders = await Order.find();
    } else {
        return res.status(403).json({
            status: 'fail',
            message: 'Unauthorized access.',
        });
    }

    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: {
            orders
        },
    });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
    const { id, userRole } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);

    if (!order) {
        return res.status(404).json({
            status: 'fail',
            message: 'Order not found.',
        });
    }

    const allowedClientTransitions = {
        'pending': ['cancelled'],
        'delivered': ['completed', 'disputed'],
    };

    const allowedFreelancerTransitions = {
        'pending': ['accepted', 'cancelled'],
        'accepted': ['in progress'],
        'in progress': ['delivered'],
    };

    if (userRole === 'user') {
        if (!allowedClientTransitions[order.status] || !allowedClientTransitions[order.status].includes(status)) {
            return res.status(400).json({
                status: 'fail',
                message: `Invalid status transition for client from ${order.status} to ${status}.`,
            });
        }
    } else if (userRole === 'freelancer') {
        if (!allowedFreelancerTransitions[order.status] || !allowedFreelancerTransitions[order.status].includes(status)) {
            return res.status(400).json({
                status: 'fail',
                message: `Invalid status transition for freelancer from ${order.status} to ${status}.`,
            });
        }
    } else if (userRole === 'admin') {
        // Admins can change status freely
    } else {
        return res.status(403).json({
            status: 'fail',
            message: 'Unauthorized role to update order status.',
        });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
        status: 'success',
        data: {
            order,
        },
    });
});