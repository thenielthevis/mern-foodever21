import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API, // Replace with your API's base URL
});

// Axios response interceptor
api.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    if (error.response) {
      const status = error.response.status;

      // Redirect to Unauthorized page on 401 or 403
      if (status === 401 || status === 403) {
        window.location.href = '/unauthorized'; // Redirect to error page
      }
    }
    return Promise.reject(error); // Pass the error along for further handling
  }
);

export default api; // Default export
