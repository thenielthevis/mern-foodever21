const express = require('express');
const router = express.Router();
const upload = require("../utils/multer");

const {
    createProduct,
    getProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    deleteProductsBulks,
    createProductReview,
    getProductReviews,
    deleteReview
} = require('../controllers/product');

//USER
//read
router.get('/products', getProducts);
router.get('/product/:id', getSingleProduct);
router.get('/product/review')

//ADMIN
//create
router.post('/admin/product/create', upload.array('images', 10), createProduct);
//update
router.put('/admin/product/update/:id', updateProduct);
//delete
router.delete('/admin/product/delete/:id', deleteProduct);
router.post('/admin/products/deletebulk', deleteProductsBulks);

module.exports = router;