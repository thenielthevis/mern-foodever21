import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, Typography, TextField, Box } from "@mui/material";

const OrdersChart = ({ data }) => {
  // Define a color mapping for each month
  const monthColors = {
    January: "#FF5733",
    February: "#33FF57",
    March: "#3357FF",
    April: "#FF33A8",
    May: "#FFA833",
    June: "#33FFF5",
    July: "#F5FF33",
    August: "#33FF93",
    September: "#FF33F5",
    October: "#FF8C33",
    November: "#33A8FF",
    December: "#8C33FF",
  };

  // Custom Tooltip for the chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { month, productName, quantity } = payload[0].payload;
      return (
        <div
          className="custom-tooltip"
          style={{
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            padding: "10px",
          }}
        >
          <p>{`Month: ${month}`}</p>
          <p>{`Product: ${productName}`}</p>
          <p>{`Quantity: ${quantity}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar
          dataKey="quantity"
          fill={({ payload }) => {
            const month = payload?.month?.split(" ")[0]; // Extract the month name
            return monthColors[month] || "#8884d8"; // Default to purple if month not found
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

const OrdersChartContainer = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchOrdersStatusData = async () => {
      try {
        console.log("Fetching data with params:", { startDate, endDate });
        const response = await axios.get(
          `${import.meta.env.VITE_API}/orders`,
          {
            params: { startDate, endDate },
          }
        );
        console.log("API Response:", response.data);
        const processedData = response.data.map((order) => ({
          month: order.month,
          productName: order.mostBoughtProduct,
          quantity: order.quantity,
        }));
        console.log("Processed Data:", processedData);
        setChartData(processedData);
      } catch (error) {
        console.error("Error fetching orders status data:", error);
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
        <Box
          sx={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}
        >
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
