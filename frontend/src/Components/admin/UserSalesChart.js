import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import React, { useState } from "react";
export default function UserSalesChart({ data }) {
  const barColors = ["#1f77b4", "#ff7f0e", "#2ca02c"];
  return (
    <ResponsiveContainer width="90%" height={600}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="2 2" />
        <XAxis dataKey="userDetails.name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {/* <Bar dataKey="total" fill="green"  /> */}
        {/* <Bar dataKey="total" fill="green" stroke="#000000"
                    strokeWidth={5} />  */}
        <Bar dataKey="total" stroke="#000000" strokeWidth={5}>
          {data.map((item, index) => (
            <Cell key={`cell-${index}`} fill={barColors[index % 20]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
