import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "../admin/layout"; // Matches layout.jsx
import Dashboard from "../Components/Dashboard"; // Matches Dashboard.jsx
import OrdersChart from "../admin/OrderChart"; // Matches OrderChart.jsx
import StatusTable from "../admin/StatusTable"; // Matches StatusTable.jsx
import ProductTable from "../admin/ProductTable"; // Matches Products.jsx

const Admin = () => {
  return (
    <Layout>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="orders-chart" element={<OrdersChart />} />
        <Route path="status-table" element={<StatusTable />} />
        <Route path="products" element={<ProductTable />} />
      </Routes>
    </Layout>
  );
};

export default Admin;
