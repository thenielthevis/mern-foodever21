import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Paper, Box, Grid, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Sidebar from '../admin/Sidebar';
import ProductTable from '../admin/ProductTable';
import OrderChartContainer from '../admin/OrderChart';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SummaryCard = ({ title, count, icon, onViewDetails }) => {
  return (
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
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [summaryData, setSummaryData] = useState([
    { title: 'Products', count: 0, icon: <Inventory2Icon fontSize="large" />, onViewDetails: () => navigate('/admin/products') },
    { title: 'Orders', count: 0, icon: <ShoppingBagIcon fontSize="large" />, onViewDetails: () => navigate('/admin/status-table') },
    { title: 'Chart', count: 0, icon: <BarChartIcon fontSize="large" />, onViewDetails: () => navigate('/admin/orders-chart') },
    { title: 'User', count: 0, icon: <AccountCircleIcon fontSize="large" />, onViewDetails: () => navigate('View User') },
  ]);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const baseURL = import.meta.env.VITE_API;

        const [productsResponse, ordersResponse, usersResponse, chartsResponse] = await Promise.all([
          axios.get(`${baseURL}/products`),
          axios.get(`${baseURL}/orders/statuses`),
          axios.get(`${baseURL}/users`),
          axios.get(`${baseURL}/orders/statuses`)
        ]);

        setSummaryData([
          { title: 'Products', count: productsResponse.data.length, icon: <Inventory2Icon fontSize="large" />, onViewDetails: () => navigate('/admin/products') },
          { title: 'Orders', count: ordersResponse.data.length, icon: <ShoppingBagIcon fontSize="large" />, onViewDetails: () => navigate('/admin/status-table') },
          { title: 'Chart', count: chartsResponse.data.length, icon: <BarChartIcon fontSize="large" />, onViewDetails: () => navigate('/admin/orders-chart') },
          { title: 'User', count: usersResponse.data.length, icon: <AccountCircleIcon fontSize="large" />, onViewDetails: () => navigate('View User') },
        ]);
      } catch (error) {
        console.error('Error fetching summary data:', error);
      }
    };

    fetchSummaryData();
  }, [navigate]);

  return (
    <Box display="flex" flexDirection="column">
      <AppBar position="static" sx={{ backgroundColor: 'white', color: 'black' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => setSidebarOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h4" component="div" sx={{ flexGrow: 1, textAlign: 'center', fontWeight: 'bold' }}>
            DASHBOARD
          </Typography>
        </Toolbar>
      </AppBar>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box flexGrow={1} p={2}>
        <Paper elevation={3} sx={{ padding: 3, backgroundColor: '#f5f5f5' }}>
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