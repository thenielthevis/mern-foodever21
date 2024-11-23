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
    deleteProductsBulks,
    createProductReview,
    getProductReviews,
    deleteReview,
    getUserProductReview,
    getUserAllReviews
} = require('../controllers/product');

// USER
// Fetch a specific user's 
router.get('/products', getProducts);
router.get('/product/:id', getSingleProduct);

// Fetch a user's review for a specific product
router.get('/product/:productId/my-review', protect, getUserProductReview);
router.get('/product/user-reviews', protect, getUserAllReviews);
router.post('/product/:id/review', protect, createProductReview);
router.get('/product/reviews', getProductReviews);

// ADMIN
router.post('/admin/product/create', upload.array('images', 10), createProduct);
router.put('/admin/product/update/:id', updateProduct);
router.delete('/admin/product/delete/:id', deleteProduct);
router.post('/admin/products/deletebulk', deleteProductsBulks);

module.exports = router;
