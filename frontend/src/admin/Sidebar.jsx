import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home'; // Use for Dashboard
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard'; // Icon for Dashboard
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path); // Navigate to the selected path
    onClose(); // Close the sidebar
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box role="presentation" style={{ width: 250 }}>
        {/* Header Section */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p={2}
          sx={{ backgroundColor: '#FFD523', color: '#595260' }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Admin Panel
          </Typography>
          <IconButton onClick={onClose} sx={{ color: '#595260' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        {/* Menu Items */}
        <List>
          {/* Dashboard Link */}
          <ListItem button onClick={() => handleNavigation('/admin/dashboard')}>
            <ListItemIcon>
              <DashboardIcon sx={{ color: '#595260' }} />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>

          {/* Orders Chart Link */}
          <ListItem button onClick={() => handleNavigation('/admin/orders-chart')}>
            <ListItemIcon>
              <ShoppingCartIcon sx={{ color: '#595260' }} />
            </ListItemIcon>
            <ListItemText primary="Orders Chart" />
          </ListItem>

          {/* Status Table Link */}
          <ListItem button onClick={() => handleNavigation('/admin/status-table')}>
            <ListItemIcon>
              <HomeIcon sx={{ color: '#595260' }} />
            </ListItemIcon>
            <ListItemText primary="Status Table" />
          </ListItem>

          {/* Products Link */}
          <ListItem button onClick={() => handleNavigation('/admin/products')}>
            <ListItemIcon>
              <Inventory2Icon sx={{ color: '#595260' }} />
            </ListItemIcon>
            <ListItemText primary="Products" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
