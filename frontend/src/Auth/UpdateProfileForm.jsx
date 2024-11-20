import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Button, TextField, IconButton, Typography, Box, LinearProgress } from '@mui/material';
import { UploadFile, Close } from '@mui/icons-material'; // Import Close icon
import { styled } from '@mui/system';

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  username: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Username is required'),
  address: Yup.string()
    .min(5, 'Too Short!')
    .max(100, 'Too Long!')
    .required('Address is required'),
  phoneNumber: Yup.string()
    .matches(/^[0-9]+$/, 'Must be only digits')
    .min(10, 'Too Short!')
    .max(15, 'Too Long!')
    .required('Phone number is required'),
});

const Input = styled('input')({
  display: 'none',
});

const UpdateProfileForm = ({ userData, onUpdate, onCancel }) => { // Add onCancel prop
  const [selectedImage, setSelectedImage] = useState('');
  const [progress, setProgress] = useState(0); // Add progress state

  const { control, handleSubmit, setValue, formState: { errors, touchedFields } } = useForm({
    defaultValues: {
      email: userData.email,
      username: userData.username,
      address: userData.address || '',
      phoneNumber: userData.phoneNumber || '',
      file: null,
    },
    resolver: yupResolver(validationSchema),
  });

  const handleFileChange = (event) => {
    const file = event.currentTarget.files[0];
    setValue('file', file);

    // Create a URL for the selected image
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);

    // Simulate file upload progress
    setProgress(0);
    const uploadInterval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(uploadInterval);
          return 100;
        }
        return prevProgress + 10;
      });
    }, 200);
  };

  const onSubmit = (values) => {
    if (!values.email || !values.username) {
      alert('Please fill in all fields');
      return;
    }
    onUpdate(values);
  };

  return (
    <Box
      component="form"
      sx={{ '& .MuiTextField-root': { m: 1, width: '50ch' } }}
      noValidate
      autoComplete="off"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Update Profile</Typography>
        <IconButton color="secondary" onClick={onCancel}>
          <Close />
        </IconButton>
      </div>
      <div>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              error={touchedFields.email && Boolean(errors.email)}
              helperText={errors.email?.message}
              InputProps={{
                readOnly: true,
              }}
            />
          )}
        />
      </div>
      <div>
        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Username"
              variant="outlined"
              fullWidth
              margin="normal"
              error={touchedFields.username && Boolean(errors.username)}
              helperText={errors.username?.message}
            />
          )}
        />
      </div>
      <div>
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Address"
              variant="outlined"
              fullWidth
              margin="normal"
              error={touchedFields.address && Boolean(errors.address)}
              helperText={errors.address?.message}
            />
          )}
        />
      </div>
      <div>
        <Controller
          name="phoneNumber"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Phone Number"
              variant="outlined"
              fullWidth
              margin="normal"
              error={touchedFields.phoneNumber && Boolean(errors.phoneNumber)}
              helperText={errors.phoneNumber?.message}
            />
          )}
        />
      </div>

      <div>
        <label htmlFor="avatar-upload">
          <Input
            accept="image/*"
            id="avatar-upload"
            type="file"
            onChange={handleFileChange}
          />
          <IconButton color="primary" aria-label="upload picture" component="span">
            <UploadFile />
          </IconButton>
          <Typography variant="body2" component="span">
            Select File
          </Typography>
        </label>
      </div>

      {selectedImage && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <div style={{ width: '150px', height: '150px', overflow: 'hidden', margin: '0 auto' }}>
            <img src={selectedImage} alt="Selected Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      )}

      {progress > 0 && progress < 100 && (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
            {`${Math.round(progress)}%`}
          </Typography>
        </Box>
      )}

      <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
        Update Profile
      </Button>
    </Box>
  );
};

export default UpdateProfileForm;