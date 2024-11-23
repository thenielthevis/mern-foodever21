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
  Button,
  Modal,
  TextField,
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
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null); // Stores product details being reviewed
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);

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

  const handleOpenReviewModal = async (product) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.get(
        `${import.meta.env.VITE_API}/product/user-review?productId=${product.productId._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const existingReview = response.data.review;
  
      setReviewProduct(product);
      setReviewText(existingReview ? existingReview.comment : '');
      setReviewRating(existingReview ? existingReview.rating : 0);
      setReviewModalOpen(true);
    } catch (error) {
      console.error('Error fetching user review:', error);
      alert('Failed to fetch review. You can add a new review.');
      setReviewProduct(product);
      setReviewText('');
      setReviewRating(0);
      setReviewModalOpen(true);
    }
  };    

  const handleCloseReviewModal = () => {
    setReviewModalOpen(false);
    setReviewProduct(null);
    setReviewText('');
    setReviewRating(0);
  };

  const handleSubmitReview = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(
        `${import.meta.env.VITE_API}/product/${reviewProduct.productId._id}/review`,
        {
          rating: reviewRating,
          comment: reviewText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      handleCloseReviewModal();
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review.');
    }
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
      <Typography
        variant="h4"
        sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center', color: 'white' }}
      >
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
                  <TableRow
                    hover
                    sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
                  >
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
                                {order.status === 'completed' && (
                                  <TableCell>Review</TableCell>
                                )}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {order.products?.map((product, index) => {
                                const productName =
                                  product.productId?.name || 'Unknown Product';
                                const productPrice =
                                  product.productId?.price || 0;

                                return (
                                  <TableRow key={index}>
                                    <TableCell>{productName}</TableCell>
                                    <TableCell>{product.quantity}</TableCell>
                                    <TableCell>
                                      ₱{productPrice.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                      ₱{(productPrice * product.quantity).toFixed(
                                        2
                                      )}
                                    </TableCell>
                                    {order.status === 'completed' && (
                                      <TableCell>
                                        <Button
                                          variant="outlined"
                                          onClick={() =>
                                            handleOpenReviewModal(product)
                                          }
                                        >
                                          Review
                                        </Button>
                                      </TableCell>
                                    )}
                                  </TableRow>
                                );
                              })}
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

      {/* Review Modal */}
      <Modal
        open={reviewModalOpen}
        onClose={handleCloseReviewModal}
        aria-labelledby="review-modal-title"
        aria-describedby="review-modal-description"
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
            borderRadius: 2,
          }}
        >
          <Typography id="review-modal-title" variant="h6" component="h2">
            Review {reviewProduct?.productId?.name || 'Product'}
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
          <TextField
            fullWidth
            type="number"
            label="Rating"
            inputProps={{ min: 1, max: 5 }}
            value={reviewRating}
            onChange={(e) => setReviewRating(e.target.value)}
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
    </Box>
  );
};

export default OrderHistory;
