import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import useUpdateUser from '../hooks/UseUpdateUser';
import './UserUpdate.css'; // Assuming a CSS file for styling
import EditRoundedIcon from '@mui/icons-material/EditRounded';

const UserUpdate = () => {
    const { userData } = useContext(AuthContext);
    const navigate = useNavigate();
    const { updateUser, error } = useUpdateUser();
    const [formData, setFormData] = useState({
        username: userData?.username || '',
        email: userData?.email || '',
        image: null,
    });
    const [preview, setPreview] = useState(userData?.userImage);

    // Update preview when a new image is selected
    useEffect(() => {
        if (formData.image) {
            const objectUrl = URL.createObjectURL(formData.image);
            setPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [formData.image]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log('Form data before update:', formData); // Debugging: Log the form data
            await updateUser(formData);
            navigate('/dashboard'); // Redirect to dashboard on successful update
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    return (
        <div className="user-update-container">
            <form onSubmit={handleSubmit} className="user-update-form">
                <h2>Update Profile</h2>
                {preview ? (
                    <img className="user-avatar-preview" src={preview} alt="User Avatar" />
                ) : (
                    <div className="avatar-placeholder">Avatar</div>
                )}
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        name="username"
                        id="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="image">Profile Picture</label>
                    <input
                        type="file"
                        name="image"
                        id="image"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>
                <button type="submit" className="submit-button">
                    <EditRoundedIcon /> Save Changes
                </button>
                {error && <p className="error-message">Error updating profile: {error.message}</p>}
            </form>
        </div>
    );
};

export default UserUpdate;