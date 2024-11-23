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
  Button
} from '@mui/material';
import Toast from "../Layout/Toast";
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext'; // Import Auth context

const ProductDetails = ({ onUpdateOrderCount }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isModalOpen, setModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1); // Default quantity
  const { user } = useAuth(); // Get the currently logged-in user
  const navigate = useNavigate();

  useEffect(() => {
    Swal.fire({
      title: 'Loading products...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API}/product/${id}`);
        setProduct(response.data.product);
        setLoading(false);
        Swal.close();
      } catch (error) {
        console.error("Error fetching product details:", error);
        setLoading(false);
        Swal.close();
        Toast("Failed to load products", "error");
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToOrderList = async () => {
    try {
      if (!user) {
        Toast("You must be logged in to add to the order list.", "error");
        return;
      }
  
      // Log the Firebase token
      const token = await user.getIdToken();
      console.log("Firebase Token:", token);
  
      // Fetch the user_id from the backend
      const userIdResponse = await axios.get(`${import.meta.env.VITE_API}/get-user-id`, {
        headers: {
          Authorization: `Bearer ${token}`, // Pass the token in the header
        },
        params: { email: user.email }, // Pass the email as a query parameter
      });
      console.log("User ID Response:", userIdResponse.data);
  
      const userId = userIdResponse.data.user_id;
      if (!userId) {
        Toast("Unable to fetch user information.", "error");
        return;
      }
  
      // Add the product to the order list
      const response = await axios.post(
        `${import.meta.env.VITE_API}/add-to-orderlist`,
        { product_id: product._id, user_id: userId, quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the token here
          },
        }
      );
  
      Toast("Product added to order list!", "success");
      setModalOpen(false); // Close the modal
  
      onUpdateOrderCount(); // Update the order count
    } catch (error) {
      console.error("Error adding product to order list:", error.response?.data || error.message);
      Toast("Failed to add product to order list.", "error");
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
            onClick={() => setModalOpen(true)} // Open the modal
          >
            Add to Order List
          </button>
          <button className="buy-button">Buy Now</button>
        </div>
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
            inputProps={{ min: 0 }} // Enforce minimum of 0
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