const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const adminProtect = require('../middleware/adminprotect');
const userProtect = require('../middleware/userprotect');

const { placeOrder,
    getUserOrders,
    deleteOrderedProducts,
    updateOrderStatus,
 } = require('../controllers/order');


router.post('/place-order', protect, placeOrder);
router.get('/user-orders/:userId', protect, getUserOrders);
router.delete('/delete-ordered-products', protect, deleteOrderedProducts);

module.exports = router;
    