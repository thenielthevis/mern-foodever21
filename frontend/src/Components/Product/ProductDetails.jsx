import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, redirect } from 'react-router-dom';
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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Rating from '@mui/material/Rating';
import { auth } from '../../firebaseConfig';

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
  const [reviewText, setReviewText] = useState(''); // For storing the review text
const [reviewRating, setReviewRating] = useState(0); // For storing the rating
const [reviewModalOpen, setReviewModalOpen] = useState(false); // For controlling modal visibility
const [selectedReview, setSelectedReview] = useState(null); // For storing the review being edited


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
        console.log("Reviews:", reviewsResponse.data.reviews);
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

// Open the modal with the selected review
const handleEdit = (review) => {
  setSelectedReview(review);
  setReviewText(review.comment); // Pre-fill the review text
  setReviewRating(review.rating); // Pre-fill the rating
  setReviewModalOpen(true); // Open the modal
};

// Close the modal
const handleCloseReviewModal = () => {
  setReviewModalOpen(false);
  setSelectedReview(null); // Clear the selected review when closing
  setReviewText('');
  setReviewRating(0);
};

// Submit the updated review
const handleSubmitReview = async () => {
  try {
    const token = await auth.currentUser.getIdToken();
    await axios.put(
      `${import.meta.env.VITE_API}/product/${product._id}/review/${selectedReview._id}`,
      { rating: reviewRating, comment: reviewText },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    handleCloseReviewModal(); // Close the modal after submission
    Swal.fire('Success', 'Review updated successfully!', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    console.error('Error submitting review:', error);
    Swal.fire('Error', 'Failed to update review.', 'error');
  }
};
  
const handleDelete = async (reviewId) => {
  try {
    // Make sure the user is an admin before proceeding with the delete action
    if (localStorage.getItem('role') !== 'admin') {
      Swal.fire('Permission Denied', 'You are not authorized to delete reviews.', 'error');
      return;
    }

    // Ask for confirmation before deletion
    const confirmDelete = await Swal.fire({
      title: 'Are you sure?',
      text: 'This review will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (confirmDelete.isConfirmed) {
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(
        `${import.meta.env.VITE_API}/product/${product._id}/review/${reviewId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        Swal.fire('Deleted!', 'Review has been deleted.', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    }
  } catch (error) {
    console.error('Error deleting review:', error);
    Swal.fire('Error', 'Failed to delete the review.', 'error');
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
          position: 'relative', // Positioning icons
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

        {/* Conditionally render edit or delete icons */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 1,
          }}
        >
        {
          (review.user === user._id) && (
            <IconButton
              onClick={() => handleEdit(review)}
              sx={{ color: 'white' }}
            >
              <EditIcon />
            </IconButton>
          )
        }

        {/* Show delete icon only if the logged-in user is an admin */}
        {localStorage.getItem('role') === 'admin' && (
          <IconButton
            onClick={() => handleDelete(review._id)}
            sx={{ color: '#d32f2f' }}
          >
            <DeleteIcon />
          </IconButton>
        )}
        </Box>
      </Box>
    ))
  )}
</div>

{/* Modal for editing the review */}
<Modal open={reviewModalOpen} onClose={handleCloseReviewModal}>
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
          borderRadius: 2,
          position: 'relative',
        }}
      >
        {/* Close button */}
        <IconButton
          onClick={handleCloseReviewModal}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'gray',
          }}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>

        {/* Modal content */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Edit Review
        </Typography>
        <TextField
          fullWidth
          label="Review"
          multiline
          rows={4}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          sx={{ my: 2 }}
        />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Rating:
        </Typography>
        {/* Rating Component */}
        <Rating
          name="user-rating"
          value={reviewRating}
          onChange={(event, newValue) => {
            setReviewRating(newValue); // Update the rating state when a star is clicked
          }}
          precision={1} // Set rating precision to 1
          max={5} // Maximum 5 stars
          size="large" // Adjust star size
        />
        <Button
          variant="contained"
          fullWidth
          onClick={handleSubmitReview}
          sx={{ mt: 2 }}
        >
          Submit Review
        </Button>
      </Box>
    </Modal>

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
            color="primary"
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
