import React, { useState, useEffect } from 'react';
import { Drawer, Box, Typography, IconButton, TextField, Checkbox, FormControlLabel, Button } from '@mui/material';
import { Delete, Close, RestaurantMenu } from '@mui/icons-material';
import axios from 'axios';
import Toast from '../Layout/Toast';

const OrderSidebar = ({ isSidebarOpen, toggleSidebar, user, onUpdateOrderCount }) => {
  const [orderList, setOrderList] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrderList = async () => {
    try {
      setLoading(true);
      if (!user) {
        Toast('You must be logged in to view your order list.', 'error');
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();
      const response = await axios.get(`${import.meta.env.VITE_API}/user-orderlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrderList(response.data.orders);
      setSelectedOrders(response.data.orders.map(order => ({ ...order, selected: false }))); // Initialize with unselected
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order list:', error);
      Toast('Failed to load order list.', 'error');
      setLoading(false);
    }
  };

  const updateQuantity = async (orderId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        Toast('Quantity must be greater than 0.', 'error');
        return;
      }

      const token = await user.getIdToken();
      await axios.put(
        `${import.meta.env.VITE_API}/update-order/${orderId}`,
        { quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Toast('Quantity updated successfully!', 'success');
      fetchOrderList();
      onUpdateOrderCount();
    } catch (error) {
      console.error('Error updating quantity:', error.response?.data || error.message);
      Toast('Failed to update quantity.', 'error');
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      const token = await user.getIdToken();
      await axios.delete(`${import.meta.env.VITE_API}/delete-order/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Toast('Order deleted successfully!', 'success');
      fetchOrderList();
      onUpdateOrderCount();
    } catch (error) {
      console.error('Error deleting order:', error.response?.data || error.message);
      Toast('Failed to delete order.', 'error');
    }
  };

  const handleCheckboxChange = (orderId) => {
    setSelectedOrders((prev) =>
      prev.map((order) =>
        order.order_id === orderId ? { ...order, selected: !order.selected } : order
      )
    );
  };

  const calculateTotalPrice = () => {
    return selectedOrders
      .filter((order) => order.selected)
      .reduce((total, order) => total + order.product.price * order.quantity, 0);
  };

  useEffect(() => {
    if (isSidebarOpen) {
      fetchOrderList();
    }
  }, [isSidebarOpen]);

  return (
    <Drawer
      anchor="right"
      open={isSidebarOpen}
      onClose={toggleSidebar}
      ModalProps={{
        onClose: () => {}, // Keeps the drawer open even if you click the backdrop
      }}
    >
      <Box
        sx={{
          width: 400,
          bgcolor: 'rgb(51, 51, 51)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          color: 'white',
        }}
      >
        {/* Header Section */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          <IconButton
            color="inherit"
            onClick={toggleSidebar}
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              border: '2px solid gold',
              borderRadius: '50%',
              padding: '5px',
            }}
          >
            <Close sx={{ color: 'gold' }} />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ mb: 2, mt: 4, textAlign: 'center', color: 'white', fontWeight: 'bold' }}
          >
            My Order List
          </Typography>
  
          {/* Loading State */}
          {loading ? (
            <Typography sx={{ color: 'white', textAlign: 'center' }}>Loading...</Typography>
          ) : orderList.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mt: 4,
                color: 'gray',
              }}
            >
              <RestaurantMenu sx={{ fontSize: 60, color: 'gold', mb: 2 }} />
              <Typography variant="subtitle1" sx={{ color: 'white', textAlign: 'center' }}>
                Empty! Add products from the menu first.
              </Typography>
            </Box>
          ) : (
            orderList.map((order) => (
              <Box
                key={order.order_id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  p: 1,
                }}
              >
                {/* Checkbox */}
                <Checkbox
                  checked={order.selected}
                  onChange={() => handleCheckboxChange(order.order_id)}
                  sx={{
                    color: 'gold',
                    '&.Mui-checked': { color: 'gold' },
                  }}
                />
  
                {/* Product Image */}
                <img
                  src={order.product.image}
                  alt={order.product.name}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '8px',
                    marginRight: '10px',
                  }}
                />
  
                {/* Product Details */}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ color: 'gold', fontWeight: 'bold' }}>
                    {order.product.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'lightgray' }}>
                    <b>₱{order.product.price}</b> x {order.quantity} ={' '}
                    <b>₱{order.product.price * order.quantity}</b>
                  </Typography>
                </Box>
  
                {/* Quantity Input */}
                <TextField
                  type="number"
                  value={order.quantity}
                  onChange={(e) => updateQuantity(order.order_id, parseInt(e.target.value))}
                  size="small"
                  sx={{
                    width: 60,
                    mr: 2,
                    '& .MuiInputBase-input': { color: 'white' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'lightgray' },
                      '&:hover fieldset': { borderColor: 'white' },
                    },
                  }}
                />
  
                {/* Delete Button */}
                <IconButton
                  color="error"
                  onClick={() => deleteOrder(order.order_id)}
                  sx={{ '&:hover': { backgroundColor: 'rgba(255, 0, 0, 0.2)' } }}
                >
                  <Delete sx={{ color: 'red' }} />
                </IconButton>
              </Box>
            ))
          )}
        </Box>
  
        {/* Total Price Section */}
        <Box
          sx={{
            borderTop: '1px solid lightgray',
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: 'rgb(51, 51, 51)',
          }}
        >
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            Total Price: ₱{calculateTotalPrice()}
          </Typography>
          <Button
            variant="contained"
            color="warning"
            sx={{
              fontWeight: 'bold',
              bgcolor: 'gold',
              color: 'black',
              '&:hover': { bgcolor: '#f1c40f' },
            }}
          >
            Order
          </Button>
        </Box>
      </Box>
    </Drawer>
  );  
};

export default OrderSidebar;
