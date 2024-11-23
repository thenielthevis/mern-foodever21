import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Breadcrumbs,
  Link,
  Typography,
  CircularProgress,
  Modal,
  Box,
  TextField,
  Button,
  Avatar,
} from '@mui/material';
import Toast from "../Layout/Toast";
import Swal from 'sweetalert2';

const ProductDetails = ({ onUpdateOrderCount }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]); // State to store reviews
  const [user, setUser] = useState(null); // State to store logged-in user
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isModalOpen, setModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1); // Default quantity
  const navigate = useNavigate();

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Get the token from localStorage
          },
        });
        setUser(response.data.user); // Assuming user data is in the `user` field of the response
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Fetch product details and reviews
  useEffect(() => {
    Swal.fire({
      title: 'Loading product details...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const fetchProductAndReviews = async () => {
      try {
        // Fetch product details
        const productResponse = await axios.get(`${import.meta.env.VITE_API}/product/${id}`);
        setProduct(productResponse.data.product);

        // Fetch reviews for the product
        const reviewsResponse = await axios.get(`${import.meta.env.VITE_API}/product/${id}/reviews`);
        setReviews(reviewsResponse.data.reviews);

        setLoading(false);
        Swal.close();
      } catch (error) {
        console.error("Error fetching product details or reviews:", error);
        setLoading(false);
        Swal.close();
        Toast("Failed to load product details or reviews", "error");
      }
    };

    fetchProductAndReviews();
  }, [id]);

  const handleAddToOrderList = async () => {
    try {
      if (!user) {
        Toast("You must be logged in to add to the order list.", "error");
        return;
      }
  
      console.log("User object:", user);
      console.log("Product ID:", product._id);
      console.log("Quantity:", quantity);
  
      const token = localStorage.getItem('token');
  
      await axios.post(
        `${import.meta.env.VITE_API}/add-to-orderlist`,
        { product_id: product._id, user_id: user._id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      Toast("Product added to order list!", "success");
      setModalOpen(false);
      onUpdateOrderCount();
    } catch (error) {
      console.error("Error adding product to order list:", error.response?.data || error.message);
      Toast(error.response?.data?.message || "Failed to add product to order list.", "error");
    }
  };  

  if (loading) {
    return (
      <div className="loading-container">
        <CircularProgress />
      </div>
    );
  }

  if (!product) {
    return (
      <Typography className="error-message">
        Product not found
      </Typography>
    );
  }

  return (
    <div className="product-details-container">
      <div className="breadcrumbs-container">
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="/" onClick={() => navigate('/')}>
            Home
          </Link>
          <Link color="inherit" href="/products" onClick={() => navigate('/products')}>
            Menu
          </Link>
          <Typography color="textPrimary">{product.name}</Typography>
        </Breadcrumbs>
      </div>

      <div className="product-details-layout">
        <div className="image-section">
          <img src={product.images[selectedImage].url} alt={product.name} className="main-image" />
          <div className="thumbnails">
            {product.images.map((img, index) => (
              <img
                key={index}
                src={img.url}
                alt={`Thumbnail ${index + 1}`}
                className={selectedImage === index ? 'thumbnail selected' : 'thumbnail'}
                onClick={() => setSelectedImage(index)}
              />
            ))}
          </div>
        </div>

        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="product-desc">{product.description}</p>
          <p className="product-price">₱{product.price}</p>
          <button
            className="order-button"
            onClick={() => setModalOpen(true)}
          >
            Add to Order List
          </button>
          <button className="buy-button">Buy Now</button>
        </div>
      </div>

      {/* Display Reviews */}
      <div className="reviews-section">
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          Reviews
        </Typography>
        {reviews.length === 0 ? (
          <Typography>No reviews yet. Be the first to review this product!</Typography>
        ) : (
          reviews.map((review, index) => (
            <Box
              key={index}
              sx={{
                mb: 2,
                p: 2,
                border: '1px solid #ddd',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                backgroundColor: '#444',
              }}
            >
              {/* Show avatar fetched from the review */}
              <Avatar
                sx={{ width: 48, height: 48 }}
                src={review.avatarURL || '/images/default-avatar.png'} // Use review.avatarURL
                alt={review.name} // Fallback alt text
              />
              <div>
                <Typography variant="body1" fontWeight="bold">
                  {review.username}
                </Typography>
                {/* Display stars for the rating */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Typography
                      key={i}
                      sx={{
                        color: i < review.rating ? '#FFD700' : '#DDDDDD', // Gold for filled, gray for unfilled
                        fontSize: 20,
                        mr: 0.5,
                      }}
                    >
                      ★
                    </Typography>
                  ))}
                </Box>
                <Typography variant="body2">{review.comment}</Typography>
              </div>
            </Box>
          ))
        )}
      </div>

      {/* Modal for Adding to Order List */}
      <Modal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="add-to-orderlist-modal"
        aria-describedby="add-to-orderlist-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2
          }}
        >
          <Typography id="add-to-orderlist-modal" variant="h6" component="h2" gutterBottom>
            Add to Order List
          </Typography>
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => {
              const value = Math.max(0, parseInt(e.target.value, 10)); // Prevent values less than 0
              setQuantity(value || 0); // Default to 0 if input is invalid
            }}
            inputProps={{ min: 0 }}
            fullWidth
            margin="normal"
          />
          <Button
            variant="contained"
            color="warning"
            onClick={handleAddToOrderList}
            sx={{ mt: 2 }}
          >
            Add to Order List
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default ProductDetails;
