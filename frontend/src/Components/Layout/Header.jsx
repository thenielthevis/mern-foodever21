import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { AccountCircle, Login as LoginIcon } from '@mui/icons-material'; // Import icons
import logo from '/images/logo.png';
import { getUser } from '../../utils/helpers'; // Assuming the helper function to retrieve user data

const Header = () => {
  // Use state to determine if the user is logged in
  const [user, setUser] = useState(null);  // Initially set user as null (not logged in)

  useEffect(() => {
    // Fetch the user data (from sessionStorage)
    const storedUser = getUser(); // Retrieve the user data from helpers
    if (storedUser) {
      setUser(storedUser);
    }
    console.log('Logged in user:', storedUser);  // Log the user data for debugging
  }, []);

  const handleLogout = () => {
    // Handle logout (for example, remove user from sessionStorage)
    sessionStorage.removeItem('user');
    setUser(null); // Update the state to show default profile
  };

  return (
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
          <Nav className="ms-auto">
            {user ? (
              // If logged in, show profile picture or AccountCircle icon
              <Nav.Link href="/profile">
                <figure className="avatar avatar-nav">
                  {/* Check if user has an avatar URL, else show default */}
                  <img
                    src={user.userImage ? user.userImage : '/defaults/profile-pic.webp'} // Fallback to default if no image is set
                    alt={user.username}
                    className="rounded-circle"
                    style={{ width: '40px', height: '40px' }} // Size of profile image
                  />
                </figure>
                <span>{user.username}</span>
              </Nav.Link>
            ) : (
              // If not logged in, show Login icon
              <Nav.Link href="/login">
                <LoginIcon
                  style={{ fontSize: '25px', color: '#FFD700' }} // Icon for not logged-in
                />
              </Nav.Link>
            )}
            {/* If logged in, show logout option */}
            {user && (
              <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
