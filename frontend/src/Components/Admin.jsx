import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../admin/layout"; // Matches layout.jsx
import Dashboard from "../Components/Dashboard"; // Matches Dashboard.jsx
import OrdersChart from "../admin/OrderChart"; // Matches OrderChart.jsx
import StatusTable from "../admin/StatusTable"; // Matches StatusTable.jsx
import ProductTable from "../admin/ProductTable"; // Matches Products.jsx

const Admin = () => {
  return (
    <Layout>
      <Routes>
        {/* Default route for /admin */}
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="orders-chart" element={<OrdersChart />} />
        <Route path="status-table" element={<StatusTable />} />
        <Route path="products" element={<ProductTable />} />
        {/* Catch-all route for undefined paths */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

export default Admin;
