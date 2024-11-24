import React, { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Checkbox,
  Button,
  TextField,
} from "@mui/material";
import { Delete, Close, RestaurantMenu } from "@mui/icons-material";
import axios from "axios";
import Toast from "../Layout/Toast";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const OrderSidebar = ({ isSidebarOpen, toggleSidebar, user, onUpdateOrderCount }) => {
  const [orderList, setOrderList] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchOrderList = async () => {
    try {
      setLoading(true);
      if (!user) {
        Toast("You must be logged in to view your order list.", "error");
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();
      const response = await axios.get(
        `${import.meta.env.VITE_API}/user-orderlist`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrderList(response.data.orders);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order list:", error);
      Toast("Failed to load order list.", "error");
      setLoading(false);
    }
  };

  // Function to delete an order
  const handleDeleteOrder = async (orderId) => {
    try {
      const token = await user.getIdToken();
      await axios.delete(`${import.meta.env.VITE_API}/delete-order/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update the order list after successful deletion
      setOrderList((prev) => prev.filter((order) => order.order_id !== orderId));
      Toast("Order deleted successfully.", "success");

      // Update the total order count (if applicable)
      if (onUpdateOrderCount) {
        onUpdateOrderCount();
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      Toast("Failed to delete the order.", "error");
    }
  };

  // Function to update the quantity
  const handleUpdateQuantity = async (orderId, quantity) => {
    try {
      if (quantity <= 0) {
        Toast("Quantity must be greater than 0.", "error");
        return;
      }

      const token = await user.getIdToken();
      const response = await axios.put(
        `${import.meta.env.VITE_API}/update-order/${orderId}`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the order list with the new quantity
      setOrderList((prev) =>
        prev.map((order) =>
          order.order_id === orderId
            ? { ...order, quantity: response.data.order.quantity }
            : order
        )
      );
      Toast("Quantity updated successfully.", "success");
    } catch (error) {
      console.error("Error updating quantity:", error);
      Toast("Failed to update quantity.", "error");
    }
  };

  // Calculate the total price for selected (checked) items
  const calculateTotalPrice = () => {
    return orderList
      .filter((order) => order.selected)
      .reduce(
        (total, order) => total + order.product.price * order.quantity,
        0
      );
  };

  const handleOrder = async () => {
    const selectedItems = orderList.filter((order) => order.selected); // Get only selected items
    if (selectedItems.length === 0) {
      Toast("Please select items to proceed.", "error");
      return;
    }
  
    // Close the sidebar first
    toggleSidebar();
  
    // Show SweetAlert2 confirmation dialog
    const result = await Swal.fire({
      title: "Confirm Order",
      text: `You are about to order items worth ₱${calculateTotalPrice()}. Proceed?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, order now!",
      cancelButtonText: "Cancel",
    });
  
    if (result.isConfirmed) {
      try {
        // Remove purchased items from the order list
        setOrderList((prev) =>
          prev.filter((order) => !selectedItems.includes(order))
        );
  
        // Update total order count (if applicable)
        if (onUpdateOrderCount) {
          onUpdateOrderCount();
        }
  
        // Redirect to checkout page with the selected items and total price
        navigate("/checkout", {
          state: { selectedItems, totalPrice: calculateTotalPrice() },
        });
      } catch (error) {
        console.error("Error processing order:", error);
        Toast("Failed to place the order.", "error");
      }
    }
  };  

  useEffect(() => {
    if (isSidebarOpen) {
      fetchOrderList();
    }
  }, [isSidebarOpen]);

  return (
    <Drawer
      anchor="left"
      open={isSidebarOpen}
      onClose={toggleSidebar}
      ModalProps={{
        onClose: () => {},
      }}
    >
      <Box
        sx={{
          width: 400,
          bgcolor: "rgb(51, 51, 51)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          color: "white",
        }}
      >
        {/* Sidebar Header */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
          <IconButton
            color="inherit"
            onClick={toggleSidebar}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              border: "2px solid gold",
              borderRadius: "50%",
              padding: "5px",
            }}
          >
            <Close sx={{ color: "gold" }} />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ mb: 2, mt: 4, textAlign: "center", color: "white", fontWeight: "bold" }}
          >
            My Order List
          </Typography>
          {loading ? (
            <Typography sx={{ color: "white", textAlign: "center" }}>Loading...</Typography>
          ) : orderList.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mt: 4,
                color: "gray",
              }}
            >
              <RestaurantMenu sx={{ fontSize: 60, color: "gold", mb: 2 }} />
              <Typography variant="subtitle1" sx={{ color: "white", textAlign: "center" }}>
                Empty! Add products from the menu first.
              </Typography>
            </Box>
          ) : (
            orderList.map((order) => (
              <Box
                key={order.order_id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  p: 1,
                }}
              >
                <Checkbox
                  checked={order.selected || false}
                  onChange={(e) =>
                    setOrderList((prev) =>
                      prev.map((o) =>
                        o.order_id === order.order_id ? { ...o, selected: e.target.checked } : o
                      )
                    )
                  }
                  sx={{
                    color: "gold",
                    "&.Mui-checked": { color: "gold" },
                  }}
                />
                <img
                  src={order.product.image}
                  alt={order.product.name}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "8px",
                    marginRight: "10px",
                  }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ color: "gold", fontWeight: "bold" }}>
                    {order.product.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "lightgray" }}>
                    <b>₱{order.product.price}</b> x {order.quantity} ={" "}
                    <b>₱{order.product.price * order.quantity}</b>
                  </Typography>
                  {order.selected && (
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleUpdateQuantity(order.order_id, order.quantity - 1)}
                      sx={{
                        color: "white",
                        bgcolor: "dimgray",
                        width: "30px",
                        height: "30px",
                        borderRadius: "4px",
                        "&:hover": { bgcolor: "#f1c40f" },
                        mr: 1,
                      }}
                    >
                      -
                    </IconButton>
                    <Typography
                      sx={{
                        color: "white",
                        textAlign: "center",
                        minWidth: "30px",
                        lineHeight: "30px",
                        border: "1px solid white",
                        borderRadius: "4px",
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      {order.quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleUpdateQuantity(order.order_id, order.quantity + 1)}
                      sx={{
                        color: "white",
                        bgcolor: "dimgray",
                        width: "30px",
                        height: "30px",
                        borderRadius: "4px",
                        "&:hover": { bgcolor: "#f1c40f" },
                        ml: 1,
                      }}
                    >
                      +
                    </IconButton>
                      <IconButton
                        onClick={() => handleDeleteOrder(order.order_id)}
                        sx={{ color: "red", ml: 2 }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Box>
            ))
          )}
        </Box>

        {/* Footer Total and Order Button */}
        <Box
          sx={{
            borderTop: "1px solid lightgray",
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "rgb(51, 51, 51)",
          }}
        >
          <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
            Total Price: ₱{calculateTotalPrice()}
          </Typography>
          <Button
            variant="contained"
            color="warning"
            sx={{
              fontWeight: "bold",
              bgcolor: "gold",
              color: "black",
              "&:hover": { bgcolor: "#f1c40f" },
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
