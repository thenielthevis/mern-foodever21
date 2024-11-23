import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TextField, Button, Typography, Box, Card } from '@mui/material';
import Swal from 'sweetalert2';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

const ChangePassword = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Show Swal loading dialog
      Swal.fire({
        title: 'Updating...',
        text: 'Please wait while we update your password.',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      if (user) {
        // Re-authenticate the user
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        // Update the password
        await updatePassword(user, newPassword);

        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Password updated successfully!',
        });
      } else {
        throw new Error('User not authenticated');
      }
    } catch (error) {
      // Show error message in Swal
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to update password: ${error.message}`,
      });
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 64px)',
        padding: '16px',
        backgroundColor: '#f9f9f9',
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 500,
          padding: 3,
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          borderRadius: 4,
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
          Change Password
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Current Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <TextField
            label="New Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              marginTop: 2,
              padding: '10px 20px',
              fontWeight: 'bold',
              textTransform: 'none',
            }}
          >
            Change Password
          </Button>
        </form>
      </Card>
    </Box>
  );
};

export default ChangePassword;
