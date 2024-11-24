import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { TextField, Button, Typography, Box, Card, Snackbar, Alert } from '@mui/material';

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
});

const UpdateEmail = () => {
  const { user, updateEmailAddress } = useAuth();
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    if (user) {
      Swal.fire({
        title: 'Loading...',
        text: 'Fetching user data, please wait.',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading(); // Show the loading animation
        },
      });

      // Simulate data fetching
      setTimeout(() => {
        setValue('email', user.email);
        setLoading(false);
        Swal.close(); // Close the loading dialog
      }, 1000); // Adjust timeout based on your API response time
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    try {
      Swal.fire({
        title: 'Updating...',
        text: 'Please wait while we update your email.',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading(); // Show the loading animation
        },
      });

      await updateEmailAddress(data.email);

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Email updated successfully. Please check your inbox for a verification email.',
      });

      setSnackbarMessage('Email updated successfully. Please check your inbox for a verification email.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to update email: ${error.message}`,
      });

      setSnackbarMessage(`Failed to update email: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
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
          Update Email
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              variant="outlined"
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email ? errors.email.message : ''}
              InputLabel={{
                shrink: true,
              }}
            />
          )}
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
            Update Email
          </Button>
        </form>
      </Card>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UpdateEmail;
