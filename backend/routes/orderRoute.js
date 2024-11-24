// routes/orderRoutes.js
const express = require('express');
const { getOrdersData, getAllOrders, getAllStatuses, updateOrderStatus } = require('../controllers/fetchOrder');  // Import your controller
const router = express.Router();

// Define routes for fetching order data
router.get('/orders/status', getOrdersData);  // Route for fetching aggregated order data by status
router.get('/orders', getAllOrders);  // Route for fetching all orders with product and user details
router.get('/orders/statuses', getAllStatuses);  // Route for fetching all distinct statuses of the products
router.put('/orders/statuses/:orderId', updateOrderStatus);


module.exports = router;