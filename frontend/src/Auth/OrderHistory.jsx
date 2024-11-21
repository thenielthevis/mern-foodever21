import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import axios from 'axios';
import { auth } from '../firebaseConfig';

const OrderHistory = () => {
  const [orderHistory, setOrderHistory] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
          if (!currentUser) {
            setError('User is not logged in');
            setLoading(false);
            return;
          }

          const token = await currentUser.getIdToken();

          // Fetch user details to get MongoDB userId
          const userDetailsResponse = await axios.get(
            `${import.meta.env.VITE_API}/get-user-id`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const userId = userDetailsResponse.data.user_id;
          if (!userId) {
            setError('Unable to fetch user information.');
            setLoading(false);
            return;
          }

          // Fetch orders for the user
          const orderResponse = await axios.get(
            `${import.meta.env.VITE_API}/user-orders/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setOrderHistory(orderResponse.data.orders);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching order history:', error);
        setError('Failed to fetch order history');
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, []);

  const handleToggleRow = (rowId) => {
    setExpandedRow(expandedRow === rowId ? null : rowId);
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading order history...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center', color: 'white'}}>
        Order History
      </Typography>
      <Paper sx={{ width: '100%', boxShadow: 3, minHeight: '70vh' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Payment Method</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Details
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orderHistory.map((order) => (
                <React.Fragment key={order._id}>
                  <TableRow hover sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <TableCell>{order._id}</TableCell>
                    <TableCell>
                      {new Date(order.timestamp).toLocaleDateString()}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: order.status === 'shipping' ? 'blue' : 'green',
                        fontWeight: 'bold',
                      }}
                    >
                      {order.status}
                    </TableCell>
                    <TableCell>
                      {order.paymentMethod.replace('_', ' ').toUpperCase()}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => handleToggleRow(order._id)}
                        aria-label="expand row"
                      >
                        {expandedRow === order._id ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      style={{ paddingBottom: 0, paddingTop: 0 }}
                      colSpan={5}
                    >
                      <Collapse
                        in={expandedRow === order._id}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box sx={{ margin: 2 }}>
                          <Typography variant="h6" gutterBottom>
                            Products
                          </Typography>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Product Name</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Total</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {order.products.map((product, index) => (
                                <TableRow key={index}>
                                  <TableCell>{product.productId.name}</TableCell>
                                  <TableCell>{product.quantity}</TableCell>
                                  <TableCell>
                                    ₱{product.productId.price.toFixed(2)}
                                  </TableCell>
                                  <TableCell>
                                    ₱{(
                                      product.productId.price * product.quantity
                                    ).toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default OrderHistory;