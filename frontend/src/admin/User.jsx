import React, { useState, useEffect } from 'react';
import MUIDataTable from 'mui-datatables';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Select, MenuItem, FormControl, InputLabel, Alert, Snackbar, Box, LinearProgress, Typography } from '@mui/material';
import axios from 'axios';
import swal from 'sweetalert';
import LinearProgressWithLabel from '../admin/LinearProgressWithLabel'; // Adjust the import path

const UserTable = () => {
    const [data, setData] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editUserId, setEditUserId] = useState(null);
    const [newUser, setNewUser] = useState({
        username: '',
        email: '',
        status: 'Active',
        image: ''
    });
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('success');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/auth/users');
            const users = response.data.users.map((user) => ({
                id: user._id,
                username: user.username,
                email: user.email,
                status: user.status,
                image: user.image
            }));
            setData(users);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        setNewUser((prev) => ({ ...prev, image: e.target.files[0] }));
    };

    const handleAddUser = async () => {
        const formData = new FormData();
        formData.append('username', newUser.username);
        formData.append('email', newUser.email);
        formData.append('status', newUser.status);
        formData.append('image', newUser.image);

        try {
            const response = await axios.post('http://localhost:5000/api/v1/admin/user/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.data.success) {
                fetchUsers();
                handleCloseDialog();
            }
        } catch (error) {
            console.error('Error adding user:', error.response ? error.response.data : error.message);
        }
    };

    const handleEditUser = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append('username', newUser.username);
        formData.append('email', newUser.email);
        formData.append('status', newUser.status);
        formData.append('image', newUser.image);

        try {
            const response = await axios.put(`http://localhost:5000/api/v1/admin/user/update/${editUserId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const totalLength = progressEvent.lengthComputable ? progressEvent.total : progressEvent.target.getResponseHeader('content-length') || progressEvent.target.getResponseHeader('x-decompressed-content-length');
                    if (totalLength !== null) {
                        setProgress(Math.round((progressEvent.loaded * 100) / totalLength));
                    }
                }
            });
            if (response.data.success) {
                await fetchUsers();
                handleCloseDialog();
                setAlertMessage('User updated successfully.');
                setAlertSeverity('success');
                setAlertOpen(true);
            }
        } catch (error) {
            console.error('Error editing user:', error);
            setAlertMessage('Error updating user.');
            setAlertSeverity('error');
            setAlertOpen(true);
        } finally {
            setLoading(false);
            setProgress(0);
        }
    };

    const handleDeleteUser = (userId) => {
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this user!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then(async (willDelete) => {
            if (willDelete) {
                try {
                    const response = await axios.delete(`http://localhost:5000/api/v1/admin/user/delete/${userId}`);
                    if (response.data.success) {
                        fetchUsers();
                        swal("Poof! Your user has been deleted!", {
                            icon: "success",
                        });
                    }
                } catch (error) {
                    console.error('Error deleting user:', error);
                    swal("Error! Your user could not be deleted!", {
                        icon: "error",
                    });
                }
            } else {
                swal("Your user is safe!");
            }
        });
    };

    const handleOpenDialog = (user = null) => {
        if (user) {
            setIsEditing(true);
            setEditUserId(user.id);
            setNewUser({
                username: user.username,
                email: user.email,
                status: user.status,
                image: user.image
            });
        } else {
            setIsEditing(false);
            setNewUser({
                username: '',
                email: '',
                status: 'Active',
                image: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setNewUser({
            username: '',
            email: '',
            status: 'Active',
            image: ''
        });
    };

    const handleAlertClose = () => {
        setAlertOpen(false);
    };

    const columns = [
        { name: 'username', label: 'Username' },
        { name: 'email', label: 'Email' },
        { name: 'status', label: 'Status' },
        { name: 'image', label: 'Image', options: { customBodyRender: (value) => (
            <img src={value} alt="User" style={{ width: '50px', height: '50px' }} />
        )}},
        { name: 'action', label: 'Action', options: { customBodyRender: (value, tableMeta) => {
            const user = data[tableMeta.rowIndex];
            return (
                <div>
                    <Button
                        onClick={() => handleOpenDialog(user)}
                        variant="outlined"
                        color="primary"
                        style={{ marginRight: '10px' }}
                    >
                        Edit
                    </Button>
                    <Button
                        onClick={() => handleDeleteUser(user.id)}
                        variant="outlined"
                        color="secondary"
                    >
                        Delete
                    </Button>
                </div>
            );
        }}}
    ];

    const options = {
        selectableRows: 'multiple',
        onRowsDelete: (rowsDeleted) => {
            const idsToDelete = rowsDeleted.data.map(d => data[d.dataIndex].id);
            setSelectedRows(idsToDelete);
            handleBulkDeleteUsers();
            return false;
        }
    };

    const customTitle = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Users</h3>
            <div>
                <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
                    Add User
                </Button>
                <Button variant="contained" color="secondary" onClick={handleBulkDeleteUsers} style={{ marginLeft: '10px' }}>
                    Bulk Delete
                </Button>
            </div>
        </div>
    );

    return (
        <div>
            <MUIDataTable 
                title={customTitle} 
                data={data} 
                columns={columns} 
                options={options} 
            />

            <Dialog open={openDialog} onClose={handleCloseDialog} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">{isEditing ? 'Edit User' : 'Add User'}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Username"
                        name="username"
                        value={newUser.username}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Email"
                        name="email"
                        value={newUser.email}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Status</InputLabel>
                        <Select
                            name="status"
                            value={newUser.status}
                            onChange={handleInputChange}
                        >
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Inactive">Inactive</MenuItem>
                        </Select>
                    </FormControl>
                    <input
                        type="file"
                        onChange={handleImageChange}
                        style={{ marginTop: '16px' }}
                    />
                    {loading && <LinearProgressWithLabel value={progress} />}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={isEditing ? handleEditUser : handleAddUser} color="primary">
                        {isEditing ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={alertOpen} autoHideDuration={6000} onClose={handleAlertClose}>
                <Alert onClose={handleAlertClose} severity={alertSeverity} sx={{ width: '100%' }}>
                    {alertMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default UserTable;