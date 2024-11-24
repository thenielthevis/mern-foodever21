import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Paper,
  Box,
  Grid,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import BarChartIcon from '@mui/icons-material/BarChart';
import Sidebar from '../admin/Sidebar';
import ProductTable from '../admin/ProductTable';
import OrderChartContainer from '../admin/OrderChart';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SummaryCard = ({ title, count, icon, onViewDetails }) => (
  <Paper
    elevation={3}
    sx={{
      padding: 2,
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '200px',
      transition: 'transform 0.3s, background-color 0.3s',
      '&:hover': {
        backgroundColor: 'yellow',
        transform: 'scale(1.05)',
      },
    }}
  >
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    <Typography variant="h4" color="primary" gutterBottom>
      {count}
    </Typography>
    <Box>{icon}</Box>
    <Button size="small" onClick={onViewDetails}>
      View Details
    </Button>
  </Paper>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [summaryData, setSummaryData] = useState([
    {
      title: 'Products',
      count: 0,
      icon: <Inventory2Icon fontSize="large" />,
      onViewDetails: () => navigate('/admin/products'),
    },
    {
      title: 'Orders',
      count: 0,
      icon: <ShoppingBagIcon fontSize="large" />,
      onViewDetails: () => navigate('/admin/status-table'),
    },
    {
      title: 'Chart',
      count: 0,
      icon: <BarChartIcon fontSize="large" />,
      onViewDetails: () => navigate('/admin/orders-chart'),
    },
  ]);

  const [error, setError] = useState(null);

  // Fetch summary data from the server
  const fetchSummaryData = async () => {
    try {
      setError(null); // Reset error state before fetching
      const baseURL = import.meta.env.VITE_API || 'http://localhost:5000/api/v1'; // Default base URL if env variable is missing

      console.log('Base URL:', baseURL); // Debugging

      const [productsResponse, ordersResponse, chartsResponse] = await Promise.all([
        axios.get(`${baseURL}/products`), // Fetch products
        axios.get(`${baseURL}/orders/statuses`), // Fetch orders
        axios.get(`${baseURL}/orders`), // Fetch chart data
      ]);

      console.log('Products Response:', productsResponse.data);
      console.log('Orders Response:', ordersResponse.data);
      console.log('Charts Response:', chartsResponse.data);

      // Update state with fetched data
      setSummaryData([
        {
          title: 'Products',
          count: productsResponse.data.filteredProductsCount || productsResponse.data.products.length,
          icon: <Inventory2Icon fontSize="large" />,
          onViewDetails: () => navigate('/admin/products'),
        },
        {
          title: 'Orders',
          count: ordersResponse.data.length || 0,
          icon: <ShoppingBagIcon fontSize="large" />,
          onViewDetails: () => navigate('/admin/status-table'),
        },
        {
          title: 'Chart',
          count: chartsResponse.data.length || 0,
          icon: <BarChartIcon fontSize="large" />,
          onViewDetails: () => navigate('/admin/orders-chart'),
        },
      ]);
    } catch (err) {
      console.error('Error fetching summary data:', err.message, err.response);
      setError('Failed to fetch summary data. Please try again later.');
    }
  };

  // Polling logic with useEffect
  useEffect(() => {
    fetchSummaryData(); // Fetch data on component mount

    // Set up polling
    const intervalId = setInterval(fetchSummaryData, 30000); // Poll every 30 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [navigate]);

  return (
    <Box display="flex" flexDirection="column">
      <AppBar position="static" sx={{ backgroundColor: 'white', color: 'black' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h4"
            component="div"
            sx={{ flexGrow: 1, textAlign: 'center', fontWeight: 'bold' }}
          >
            DASHBOARD
          </Typography>
        </Toolbar>
      </AppBar>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box flexGrow={1} p={2}>
        <Paper elevation={3} sx={{ padding: 3, backgroundColor: '#f5f5f5' }}>
          {error && (
            <Typography color="error" variant="body1">
              {error}
            </Typography>
          )}
          <Grid container spacing={3}>
            {summaryData.map((data, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <SummaryCard
                  title={data.title}
                  count={data.count}
                  icon={data.icon}
                  onViewDetails={data.onViewDetails}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
        <Box mt={4}>
          <ProductTable />
        </Box>
        <Box mt={4}>
          <OrderChartContainer />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
