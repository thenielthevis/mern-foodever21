import React, { useState } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { MdOutlineRestaurantMenu } from 'react-icons/md';
import axios from 'axios';
import logo from '/images/logo.png';
import { useAuth } from '../../context/AuthContext';
import AccountMenu from '../../Auth/AccountMenu';
import OrderSidebar from '../Product/OrderSidebar'; // Import the new component

const Header = ({ orderCount, onUpdateOrderCount }) => {
  const { user } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <Navbar variant="dark" expand="lg" className="navbar">
        <Container>
          <Navbar.Brand href="/">
            <img
              src={logo}
              alt="FOODEVER 21 Logo"
              style={{ width: '40px', height: '40px', marginRight: '10px' }}
            />
            FOODEVER 21
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/">Home</Nav.Link>
              <Nav.Link href="/products">Menu</Nav.Link>
              <Nav.Link href="/">Let's Connect</Nav.Link>
              <Nav.Link href="/">About Us</Nav.Link>
            </Nav>
            <Nav className="ms-auto d-flex align-items-center">
              <div
                className="order-icon-container"
                style={{ position: 'relative', marginRight: '15px' }}
              >
                <MdOutlineRestaurantMenu
                  style={{ fontSize: '1.5rem', color: 'white', cursor: 'pointer' }}
                  onClick={toggleSidebar}
                />
                {orderCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-10px',
                      backgroundColor: 'gold',
                      color: 'black',
                      borderRadius: '50%',
                      padding: '2px 6px',
                      fontSize: '0.75rem',
                    }}
                  >
                    {orderCount}
                  </span>
                )}
              </div>
              {user ? <AccountMenu /> : <Nav.Link href="/login">Login</Nav.Link>}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Sidebar Component */}
      <OrderSidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        user={user}
        onUpdateOrderCount={onUpdateOrderCount}
      />
    </>
  );
};

export default Header;
