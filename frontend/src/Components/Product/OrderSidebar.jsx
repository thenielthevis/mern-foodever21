import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Checkbox,
  Button,
} from '@mui/material';
import { Delete, Close, RestaurantMenu } from '@mui/icons-material';
import axios from 'axios';
import Toast from '../Layout/Toast';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

const OrderSidebar = ({ isSidebarOpen, toggleSidebar, user, onUpdateOrderCount }) => {
  const [orderList, setOrderList] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize navigation hook

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
      setSelectedOrders(response.data.orders.map((order) => ({ ...order, selected: false })));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order list:', error);
      Toast('Failed to load order list.', 'error');
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    return selectedOrders
      .filter((order) => order.selected)
      .reduce((total, order) => total + order.product.price * order.quantity, 0);
  };

  const handleOrder = () => {
    const selectedItems = selectedOrders.filter((order) => order.selected);
    if (selectedItems.length === 0) {
      Toast('Please select at least one item to proceed.', 'error');
      return;
    }

    // Redirect to checkout page with selected orders and total price
    navigate('/checkout', {
      state: { selectedItems, totalPrice: calculateTotalPrice() },
    });
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
        {/* Sidebar Content */}
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
                <Checkbox
                  checked={order.selected}
                  onChange={() =>
                    setSelectedOrders((prev) =>
                      prev.map((o) =>
                        o.order_id === order.order_id
                          ? { ...o, selected: !o.selected }
                          : o
                      )
                    )
                  }
                  sx={{
                    color: 'gold',
                    '&.Mui-checked': { color: 'gold' },
                  }}
                />
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
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ color: 'gold', fontWeight: 'bold' }}>
                    {order.product.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'lightgray' }}>
                    <b>₱{order.product.price}</b> x {order.quantity} ={' '}
                    <b>₱{order.product.price * order.quantity}</b>
                  </Typography>
                </Box>
              </Box>
            ))
          )}
        </Box>

        {/* Footer Total and Order Button */}
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
            onClick={handleOrder}
          >
            Order
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default OrderSidebar;
