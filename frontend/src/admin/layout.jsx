import React, { useState } from "react";
import { Box, AppBar, Toolbar, IconButton, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "./Sidebar"; // Assuming Sidebar exists in admin directory
import Header from "../Components/Layout/Header"; // Adjust the import path if Navbar exists elsewhere

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box display="flex" flexDirection="column">
      {/* AppBar with Navbar */}
      <AppBar position="static" sx={{ backgroundColor: "#FFD523" }}>
        <Toolbar>
          <IconButton color="inherit" aria-label="menu" onClick={toggleSidebar}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
          </Typography>
          <Header /> {/* Include your Navbar component here */}
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={toggleSidebar} />

      {/* Main Content */}
      <Box component="main" p={3}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
