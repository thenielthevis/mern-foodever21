import React from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';

const Unauthorized = () => {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2c2c2c',
        color: '#ffffff',
      }}
    >
      <Card
        sx={{
          maxWidth: 500,
          textAlign: 'center',
          padding: 4,
          boxShadow: '0px 4px 20px rgba(0,0,0,0.5)',
        }}
      >
        <CardContent>
          <RestaurantIcon sx={{ fontSize: 60, color: '#ff9800' }} />
          <Typography variant="h4" sx={{ marginTop: 2, fontWeight: 'bold' }}>
            Unauthorized
          </Typography>
          <Typography variant="body1" sx={{ marginTop: 1, marginBottom: 3 }}>
            You do not have permission to access this page.
          </Typography>
          <Button
            variant="contained"
            color="warning"
            href="/"
            sx={{
              textTransform: 'none',
              fontWeight: 'bold',
              boxShadow: '0px 3px 10px rgba(0,0,0,0.3)',
            }}
          >
            Go back to Home
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Unauthorized;
