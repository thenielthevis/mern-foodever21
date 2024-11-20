import React from 'react';
import { Nav } from 'react-bootstrap';

const Navigation = () => {
  return (
    <Nav className="me-auto">
      <Nav.Link href="/">Home</Nav.Link>
      <Nav.Link href="/order">Order</Nav.Link>
      <Nav.Link href="/connect">Let's Connect</Nav.Link>
      <Nav.Link href="/about">About Us</Nav.Link>
      <Nav.Link href="/login">Login</Nav.Link>
    </Nav>
  );
};

export default Navigation;
