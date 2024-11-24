import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, IconButton, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box
        role="presentation"
        onClick={onClose}
        onKeyDown={onClose}
        style={{ width: 250 }}
      >
        <Box display="flex" justifyContent="flex-end" p={1}>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
       
        <Divider />
        <List>
          <ListItem button component={Link} to="/admin/orders-chart" onClick={() => navigate("/admin/orders-chart")}>
            <ListItemText primary="Orders Chart" />
          </ListItem>
          <ListItem button component={Link} to="/admin/status-table" onClick={() => navigate("/admin/status-table")}>
            <ListItemText primary="Status Table" />
          </ListItem>
          <ListItem button component={Link} to="/admin/products" onClick={() => navigate("/admin/products")}>
            <ListItemText primary="Products" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;