import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Dashboard/common/Sidebar';
import Header from './Dashboard/common/Header';
import './Dashboard.css'; // Import the Tailwind CSS for the Dashboard

const Dashboard = () => {
    return (
        
        <div className="dashboard-container flex">
           
            <div className="flex-1">
            <Sidebar />
                <Header title="Dashboard" />
                <div className="p-4">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;