import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListAltIcon from '@mui/icons-material/ListAlt';
import Tooltip from '@mui/material/Tooltip';
import Logout from '@mui/icons-material/Logout';
import Email from '@mui/icons-material/Email';
import Lock from '@mui/icons-material/Lock';
import DashboardIcon from '@mui/icons-material/Dashboard'; // Import Dashboard icon
import { useAuth } from '../context/AuthContext'; // Correct import path
import axios from 'axios'; // You might need to install axios if you don't have it

export default function AccountMenu() {
  const { logout } = useAuth(); // Get the logout function from context
  const [user, setUser] = React.useState(null); // Store user data
  const navigate = useNavigate(); // Use React Router's useNavigate hook
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  // Fetch current user data when the component mounts
  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Get the token from localStorage
          },
        });
        setUser(response.data.user); // Assuming user data is in the `user` field of the response
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login'); // Navigate to login page after logout
  };

  const handleProfile = () => {
    navigate('/profile'); // Navigate to profile page
  };

  const handleDashboard = () => {
    navigate('/dashboard'); // Navigate to dashboard page
  };

  const handleUpdateEmail = () => {
    navigate('/update-email'); // Navigate to update email page
  };

  const handleChangePassword = () => {
    navigate('/change-password'); // Navigate to change password page
  };

  const handleOrderHistory = () => {
    navigate('/order-history'); // Navigate to change password page
  };

  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar src={user?.avatarURL || '/images/default-avatar.png'} sx={{ width: 32, height: 32 }} />
            <span style={{color: 'gold'}}>{user?.username}</span>
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfile}>
        <Avatar src={user?.avatarURL || '/images/default-avatar.png'} sx={{ width: 32, height: 32, border: '2px solid black' }} /> Profile
        </MenuItem>
        <MenuItem onClick={handleOrderHistory}>
          <ListItemIcon>
            <ListAltIcon fontSize="small" />
          </ListItemIcon>
          Order History
        </MenuItem>
        <MenuItem onClick={handleDashboard}>
          <ListItemIcon>
            <DashboardIcon fontSize="small" />
          </ListItemIcon>
          Dashboard
        </MenuItem>
        <MenuItem onClick={handleUpdateEmail}>
          <ListItemIcon>
            <Email fontSize="small" />
          </ListItemIcon>
          Update Email
        </MenuItem>
        <MenuItem onClick={handleChangePassword}>
          <ListItemIcon>
            <Lock fontSize="small" />
          </ListItemIcon>
          Change Password
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
