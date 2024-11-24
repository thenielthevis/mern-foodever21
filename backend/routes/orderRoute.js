// routes/orderRoutes.js
const express = require('express');
const { getOrdersData, getAllOrders, getAllStatuses, updateOrderStatus } = require('../controllers/fetchOrder');  // Import your controller
const router = express.Router();
const protect = require('../middleware/protect');
const adminProtect = require('../middleware/adminprotect');
const userProtect = require('../middleware/userprotect');

// Define routes for fetching order data
router.get('/orders/status', adminProtect, getOrdersData);  // Route for fetching aggregated order data by status
router.get('/orders', adminProtect, getAllOrders);  // Route for fetching all orders with product and user details
router.get('/orders/statuses', adminProtect, getAllStatuses);  // Route for fetching all distinct statuses of the products
router.put('/orders/statuses/:orderId', updateOrderStatus);


module.exports = router;