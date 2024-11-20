import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const authenticate = (data, next) => {
    if (window !== 'undefined') {
        // Ensure user data (including userImage) is stored correctly
        const userWithImage = {
            ...data.user,
            userImage: data.user.userImage ? data.user.userImage : '/defaults/profile-pic.webp', // Default image if no userImage
        };

        // Save both token and user data to sessionStorage
        sessionStorage.setItem('token', JSON.stringify(data.token));
        sessionStorage.setItem('user', JSON.stringify(userWithImage));  // Make sure we are saving the complete user object
        console.log('User stored in sessionStorage:', userWithImage);  // Debugging: log the stored user
    }
    next();
};


export const getToken = () => {
    if (window !== 'undefined') {
        if (sessionStorage.getItem('token')) {
            return JSON.parse(sessionStorage.getItem('token'));
        } else {
            return false;
        }
    }
};

// access user name from session storage
export const getUser = () => {
    if (window !== 'undefined') {
        if (sessionStorage.getItem('user')) {
            return JSON.parse(sessionStorage.getItem('user'));
        } else {
            return false;
        }
    }
};

// remove token from session storage
export const logout = next => {
    if (window !== 'undefined') {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
    }
    next();
};

export const errMsg = (message = '') => toast.error(message, {
    position: 'bottom-right'
});
export const successMsg = (message = '') => toast.success(message, {
    position: 'bottom-right'
});