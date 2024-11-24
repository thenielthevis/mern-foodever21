import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import EditIcon from '@mui/icons-material/Edit';
import Modal from '@mui/material/Modal';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Swal from 'sweetalert2';

const StatusTable = () => {
  const [statuses, setStatuses] = useState([]);
  const [editStatus, setEditStatus] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API}/orders/statuses`);
        console.log('Response data:', response.data); // Log the response data
        setStatuses(response.data);
      } catch (error) {
        console.error('Error fetching statuses:', error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
          console.error('Error response headers:', error.response.headers);
        } else if (error.request) {
          console.error('Error request:', error.request);
        } else {
          console.error('Error message:', error.message);
        }
      }
    };
  
    fetchStatuses();
  }, []);

  const handleEditClick = (status) => {
    if (status.status !== 'completed' && status.status !== 'cancelled') {
      setEditStatus(status);
      setOpenModal(true);
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API}/orders/statuses/${editStatus.orderId}`, editStatus);
      setStatuses((prevStatuses) =>
        prevStatuses.map((status) =>
          status.orderId === editStatus.orderId ? editStatus : status
        )
      );
      setOpenModal(false);
      Swal.fire({
        icon: 'success',
        title: 'Status updated successfully',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error updating status',
        text: error.message,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditStatus((prevStatus) => ({ ...prevStatus, [name]: value }));
  };

  function Row(props) {
    const { row } = props;
    const isCompletedOrCancelled = row.status === 'completed' || row.status === 'cancelled';
    const backgroundColor = row.status === 'completed' ? 'lightgreen' : row.status === 'cancelled' ? 'lightcoral' : 'inherit';

    return (
      <TableRow style={{ backgroundColor }}>
        <TableCell component="th" scope="row" style={{ backgroundColor }}>
          {row.status}
        </TableCell>
        <TableCell style={{ backgroundColor }}>{row.orderId}</TableCell>
        <TableCell style={{ backgroundColor }}>{row.products.join(', ')}</TableCell>
        <TableCell style={{ backgroundColor }}>
          {!isCompletedOrCancelled && (
            <IconButton aria-label="edit" size="small" onClick={() => handleEditClick(row)}>
              <EditIcon />
            </IconButton>
          )}
        </TableCell>
      </TableRow>
    );
  }

  Row.propTypes = {
    row: PropTypes.shape({
      orderId: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      products: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Order Statuses
      </Typography>
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>Order ID</TableCell>
              <TableCell>Products</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {statuses.map((status, index) => (
              <Row key={index} row={status} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={{ ...modalStyle, width: 400 }}>
          <Typography variant="h6" component="h2">
            Edit Status
          </Typography>
          <Select
            label="Status"
            name="status"
            value={editStatus?.status || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          >
            <MenuItem value="shipping">Shipping</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </Box>
      </Modal>
    </Container>
  );
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export default StatusTable;