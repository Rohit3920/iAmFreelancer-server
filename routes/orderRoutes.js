const express = require('express');
const orderController = require('../controllers/orderController');
// const authController = require('../middleware/authMiddleware');

const router = express.Router();

// router.use(authController.protect);

router.post('/:userId', orderController.createOrder)
router.get('/:userId/:userRole', orderController.getOrders);
router.get('/:orderId', orderController.getOrderById)
router.put('/:userRole/:id', orderController.updateOrderStatus);

module.exports = router;