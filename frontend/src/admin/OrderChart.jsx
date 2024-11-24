import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, Typography, TextField, Box } from '@mui/material';

const OrdersChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="quantity" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

const OrdersChartContainer = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchOrdersStatusData = async () => {
      try {
        console.log('Fetching data with params:', { startDate, endDate });
        const response = await axios.get(`${import.meta.env.VITE_API}/orders`, {
          params: { startDate, endDate }
        });
        console.log('API Response:', response.data);
        const processedData = response.data.map(order => ({
          month: order.month,
          productName: order.mostBoughtProduct,
          quantity: order.quantity
        }));
        console.log('Processed Data:', processedData);
        setChartData(processedData);
      } catch (error) {
        console.error('Error fetching orders status data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchOrdersStatusData();
  }, [startDate, endDate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div">
          Orders Chart
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
        <OrdersChart data={chartData} />
      </CardContent>
    </Card>
  );
};

export default OrdersChartContainer;