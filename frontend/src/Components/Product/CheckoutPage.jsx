import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../../firebaseConfig';
import axios from 'axios';
import Swal from 'sweetalert2';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedItems = [], totalPrice = 0 } = location.state || { selectedItems: [], totalPrice: 0 };

  const [activeStep, setActiveStep] = useState(0);
  const [userId, setUserId] = useState(null);
  const [userInfo, setUserInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    country: '',
    postcode: '',
    phone: '',
  });
  const [shippingMethod, setShippingMethod] = useState('Free Shipping');

  const steps = ['Order Summary', 'Shipping Details', 'Payment'];

  // Set Authorization header when user is authenticated
  const setupAxiosAuthHeader = async (user) => {
    if (user) {
      try {
        const token = await user.getIdToken();
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Error setting Axios Authorization header:', error);
      }
    }
  };

  // Handle Firebase Auth State
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        setUserInfo((prev) => ({ ...prev, email: user.email }));
        await setupAxiosAuthHeader(user);
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Authentication Required',
          text: 'Please log in to proceed.',
        });
        navigate('/login'); // Redirect to login page
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [navigate]);

  useEffect(() => {
    console.log('Selected Items:', selectedItems);
    if (selectedItems.length === 0) {
      navigate('/'); // Redirect to homepage if no items are selected
    }
  }, [selectedItems, navigate]);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'Authentication Error',
        text: 'Please log in to place an order.',
      });
      return;
    }
  
    const payload = {
      userId,
      products: selectedItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      paymentMethod: shippingMethod.toLowerCase().replace(' ', '_'),
    };
  
    console.log('Placing order with payload:', payload);
  
    try {
      Swal.fire({
        title: 'Placing Order...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
  
      // Place the order
      const response = await axios.post(`${import.meta.env.VITE_API}/place-order`, payload);
      console.log('Order placed successfully:', response.data);
  
      // Remove ordered products from the order list
      const productIds = selectedItems.map((item) => item.product.id);
      console.log('Deleting ordered products with payload:', { userId, productIds });
  
      const deleteResponse = await axios({
        method: 'delete',
        url: `${import.meta.env.VITE_API}/delete-ordered-products`,
        data: { userId, productIds },
      });
      console.log('Delete Response:', deleteResponse.data);
  
      Swal.fire({
        icon: 'success',
        title: 'Order Placed Successfully!',
        text: `Your order ID is ${response.data.order._id}`,
      });
  
      navigate('/', { state: { order: response.data.order } });
    } catch (error) {
      console.error('Error placing order:', error);
  
      Swal.fire({
        icon: 'error',
        title: 'Order Failed',
        text: 'Something went wrong. Please try again.',
      });
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'rgb(245, 245, 245)',
      }}
    >
      <Box
        sx={{
          p: 4,
          maxWidth: 900,
          width: '100%',
          bgcolor: 'white',
          borderRadius: 2,
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 1: Order Summary */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Order Summary
            </Typography>
            {selectedItems.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 1,
                  padding: '8px',
                  bgcolor: 'rgb(245, 245, 245)',
                  borderRadius: 2,
                }}
              >
                <Typography>{`${item.product.name} x ${item.quantity}`}</Typography>
                <Typography>{`₱${item.product.price * item.quantity}`}</Typography>
              </Box>
            ))}
            <Typography
              variant="h6"
              sx={{ textAlign: 'right', mt: 2, fontWeight: 'bold' }}
            >
              Total: ₱{totalPrice}
            </Typography>
          </Box>
        )}

        {/* Step 2: Shipping Details */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Shipping Details
            </Typography>
            <TextField
              name="email"
              label="Email Address"
              fullWidth
              sx={{ mb: 2 }}
              value={userInfo.email}
              onChange={handleChange}
              InputProps={{
                readOnly: true, // Make the email field read-only
              }}
            />
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                name="firstName"
                label="First Name"
                fullWidth
                value={userInfo.firstName}
                onChange={handleChange}
              />
              <TextField
                name="lastName"
                label="Last Name"
                fullWidth
                value={userInfo.lastName}
                onChange={handleChange}
              />
            </Box>
            <TextField
              name="address"
              label="Street Address"
              fullWidth
              sx={{ mb: 2 }}
              value={userInfo.address}
              onChange={handleChange}
            />
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                name="country"
                label="Country"
                fullWidth
                value={userInfo.country}
                onChange={handleChange}
              />
              <TextField
                name="postcode"
                label="Postcode"
                fullWidth
                value={userInfo.postcode}
                onChange={handleChange}
              />
            </Box>
            <TextField
              name="phone"
              label="Phone Number"
              fullWidth
              sx={{ mb: 2 }}
              value={userInfo.phone}
              onChange={handleChange}
            />
          </Box>
        )}

        {/* Step 3: Payment */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Payment
            </Typography>
            {(() => {
              const taxRate = 0.05;
              const shippingRate = 0.10;
              const taxes = totalPrice * taxRate;
              const shippingFee = totalPrice * shippingRate;
              const finalTotal = totalPrice + taxes + shippingFee;

              return (
                <>
                  <Typography sx={{ mb: 2 }}>Subtotal: ₱{totalPrice.toFixed(2)}</Typography>
                  <Typography sx={{ mb: 2 }}>Shipping: ₱{shippingFee.toFixed(2)}</Typography>
                  <Typography sx={{ mb: 2 }}>Taxes: ₱{taxes.toFixed(2)}</Typography>
                  <Typography
                    variant="h6"
                    sx={{ textAlign: 'right', mt: 2, fontWeight: 'bold' }}
                  >
                    Total: ₱{finalTotal.toFixed(2)}
                  </Typography>
                </>
              );
            })()}

            <RadioGroup
              value={shippingMethod}
              onChange={(e) => setShippingMethod(e.target.value)}
              sx={{ mt: 2 }}
            >
              <FormControlLabel
                value="gcash"
                control={<Radio />}
                label="Gcash"
              />
              <FormControlLabel
                value="credit_card"
                control={<Radio />}
                label="Credit Card"
              />
              <FormControlLabel
                value="cash_on_delivery"
                control={<Radio />}
                label="Cash on Delivery"
              />
            </RadioGroup>
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 4 }}
              onClick={handlePlaceOrder}
            >
              Place Order
            </Button>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Back
          </Button>
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export default CheckoutPage;
