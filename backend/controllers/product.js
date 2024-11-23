const Product = require('../models/Product')
const cloudinary = require('cloudinary')
const { admin, db } = require('../utils/firebaseAdminConfig');
const serviceAccount = require('../utils/serviceAccountKey.json'); 
const User = require('../models/userModel');
const APIFeatures = require('../utils/apiFeatures')
const mongoose = require('mongoose');

//CREATE
exports.createProduct = async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Please upload product images.'
        });
    }

    let imagesLinks = [];

    for (let i = 0; i < req.files.length; i++) {
        try {
            const result = await cloudinary.v2.uploader.upload(req.files[i].path, {
                folder: 'products',
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: 'Error uploading images.'
            });
        }
    }

    req.body.images = imagesLinks;
	// req.body.user = req.user.id;
    const product = await Product.create(req.body);

    if (!product) {
        return res.status(400).json({
            success: false,
            message: 'Product not created.'
        });
    }

    return res.status(201).json({
        success: true,
        product
    });
};

//READ ALL PRODUCTS

exports.getProducts = async (req, res, next) => {
	try {
	  const resPerPage = req.query.limit
	  const currentPage = req.query.page
	  const productsCount = await Product.countDocuments();
  
	  const apiFeatures = new APIFeatures(Product.find(), req.query).search().filter();
	  apiFeatures.pagination(resPerPage, currentPage);
  
	  const products = await apiFeatures.query;
	  const filteredProductsCount = products.length;
    
	  if (!products) return res.status(400).json({ message: 'Error loading products' });
  
	  return res.status(200).json({
		success: true,
		count: products.length,
		products,
		resPerPage,
		filteredProductsCount,
		productsCount
	  });
	} catch (error) {
	  return res.status(500).json({ message: error.message });
	}
  };

//READ SPECIFIC PRODUCT
exports.getSingleProduct = async (req, res, next) => {
	const product = await Product.findById(req.params.id);
	if (!product) {
		return res.status(404).json({
			success: false,
			message: 'Product not found'
		})
	}
	return res.status(200).json({
		success: true,
		product
	})
}

// UPDATE PRODUCT
exports.updateProduct = async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        let images = [];

        if (typeof req.body.images === 'string') {
            images.push(req.body.images);
        } else if (Array.isArray(req.body.images)) {
            images = req.body.images;
        }

        if (images.length > 0) {
            for (let i = 0; i < product.images.length; i++) {
                await cloudinary.v2.uploader.destroy(product.images[i].public_id);
            }

            let imagesLinks = [];
            for (let i = 0; i < images.length; i++) {
                const result = await cloudinary.v2.uploader.upload(images[i], {
                    folder: 'products',
                });
                imagesLinks.push({
                    public_id: result.public_id,
                    url: result.secure_url
                });
            }

            req.body.images = imagesLinks;
        } else {
            req.body.images = product.images;
        }
        

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        return res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    if (product.images && product.images.length > 0) {
        const deleteImageResult = await cloudinary.uploader.destroy(product.images[0].public_id);
        if (deleteImageResult.result !== 'ok') {
            return res.status(500).json({
                success: false,
                message: 'Failed to delete image from Cloudinary'
            });
        }
    }

    await Product.findByIdAndDelete(req.params.id);

    return res.status(200).json({
        success: true,
        message: `Product "${product.name}" deleted successfully.`
    });
}

//Delete Bulks
exports.deleteProductsBulks = async (req, res, next) => {
    try {
        const { ids } = req.body;
        console.log('Deleting products with IDs:', ids); // Log the IDs being deleted
        const result = await Product.deleteMany({ _id: { $in: ids } });
        console.log('Delete result:', result); // Log the result of the delete operation
        res.status(200).json({
            success: true,
            message: 'Products deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting products:', error); // Log the error
        res.status(500).json({
            success: false,
            message: 'Error deleting products',
            error: error.message
        });
    }
};
exports.createProductReview = async (req, res) => {
    try {
      const { id: productId } = req.params; // Match the param name to the route
      const { rating, comment } = req.body;
  
      // Extract Firebase token and decode it
      const token = req.headers.authorization.split(' ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      const firebaseUid = decodedToken.uid;
  
      // Find the MongoDB user associated with this Firebase UID
      const user = await User.findOne({ firebaseUid });
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      // Find the product by its ID
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }
  
      // Check if the user has already reviewed the product
      const existingReview = product.reviews.find(
        (review) => review.user.toString() === user._id.toString()
      );
  
      if (existingReview) {
        // Update existing review
        existingReview.rating = rating;
        existingReview.comment = comment;
      } else {
        // Add new review
        product.reviews.push({
          user: user._id,
          name: user.username,
          rating,
          comment,
          createdAt: new Date(),
        });
        product.numOfReviews = product.reviews.length;
      }
  
      // Recalculate the product's overall ratings
      product.ratings =
        product.reviews.reduce((sum, review) => sum + review.rating, 0) /
        product.reviews.length;
  
      // Save the product with updated reviews
      await product.save();
  
      res.status(200).json({
        success: true,
        reviews: product.reviews,
        numOfReviews: product.numOfReviews,
        ratings: product.ratings,
      });
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ message: 'Failed to create review.' });
    }
  };  
  
  exports.getUserProductReview = async (req, res) => {
    try {
      const { productId } = req.params; // Use req.params for productId
      const authHeader = req.headers.authorization;
  
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided.' });
      }
  
      const token = authHeader.split(' ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      const firebaseUid = decodedToken.uid;
  
      console.log('Product ID:', productId);
  
      const user = await User.findOne({ firebaseUid });
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      console.log('MongoDB User ID:', user._id);
  
      // Validate the productId
      if (!mongoose.isValidObjectId(productId)) {
        console.log('Invalid Product ID format:', productId);
        return res.status(400).json({ message: 'Invalid Product ID format.' });
      }
  
      // Fetch the product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }
  
      // Fetch the user's review
      const userReview = product.reviews.find(
        (review) => review.user.toString() === user._id.toString()
      );
  
      if (!userReview) {
        return res.status(404).json({ message: 'No review found for this product by the user.' });
      }
  
      return res.status(200).json({
        success: true,
        review: userReview,
      });
    } catch (error) {
      console.error('Error fetching user review:', error);
      return res.status(500).json({ message: 'Failed to fetch user review.' });
    }
  };  
  
  exports.getUserAllReviews = async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
  
      // Decode Firebase token to get the user's Firebase UID
      const token = authHeader.split(' ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      const firebaseUid = decodedToken.uid;
  
      // Find the corresponding MongoDB User ID
      const user = await User.findOne({ firebaseUid });
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      // Find all products that contain a review by the user
      const productsWithReviews = await Product.find({
        'reviews.user': user._id,
      });
  
      // Extract only the reviews made by the user
      const userReviews = productsWithReviews.map((product) => {
        const review = product.reviews.find(
          (review) => review.user.toString() === user._id.toString()
        );
        return {
          productId: product._id,
          productName: product.name,
          review,
        };
      });
  
      return res.status(200).json({
        success: true,
        reviews: userReviews,
      });
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      return res.status(500).json({ message: 'Failed to fetch user reviews.' });
    }
  };
    

//get reviews
exports.getProductReviews = async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found',
        });
    }

    return res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
};

//delete review
exports.deleteReview = async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found',
        });
    }

    const reviews = product.reviews.filter(
        (review) => review._id.toString() !== req.query.id.toString()
    );

    const numOfReviews = reviews.length;

    const ratings =
        reviews.length > 0
            ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
            : 0;

    await Product.findByIdAndUpdate(
        req.query.productId,
        {
            reviews,
            ratings,
            numOfReviews,
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    return res.status(200).json({
        success: true,
        message: 'Review deleted successfully',
        reviews,
        ratings,
        numOfReviews,
    });
};
