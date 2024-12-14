import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api/', // URL your Django API
  headers: {
    'Content-Type': 'application/json',
    // add headers
  },
  withCredentials: true, // if needs cookies
});

export default axiosInstance;