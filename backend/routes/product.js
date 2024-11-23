const express = require('express');
const router = express.Router();
const upload = require('../utils/multer');
const protect = require('../middleware/protect');

const {
    createProduct,
    getProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    getProductReviews,
    deleteReview,
    getUserProductReview,
} = require('../controllers/product');

// USER
// Fetch a specific user's 
router.get('/products', getProducts);
router.get('/product/:id', getSingleProduct);

router.get('/product/user-review', protect, getUserProductReview); // Must come before '/product/:id'

// Fetch all reviews for a product
router.get('/product/reviews', getProductReviews);

// Fetch a single product
router.get('/product/:id', getSingleProduct);

// Create Review (Protected route - requires authentication)
router.post('/product/:id/review', protect, createProductReview);

// ADMIN
router.post('/admin/product/create', upload.array('images', 10), createProduct);
router.put('/admin/product/update/:id', updateProduct);
router.delete('/admin/product/delete/:id', deleteProduct);

module.exports = router;
