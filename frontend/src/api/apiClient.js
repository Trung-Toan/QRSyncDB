import axios from 'axios';

const apiClient = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'https://qrsyncdb.onrender.com',
      timeout: 10000, 
      headers: {
            'Content-Type': 'application/json',
      },
});

// Interceptor cho Request (Tự động gắn Token vào mọi request)
apiClient.interceptors.request.use(
      (config) => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                  config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
      },
      (error) => Promise.reject(error)
);

// Interceptor cho Response (Bắt lỗi 401, 403, 500 toàn cục)
apiClient.interceptors.response.use(
      (response) => response.data, // Chỉ lấy phần data, bỏ qua config/headers của axios
      (error) => {
            if (error.response?.status === 401) {
                  // Logic logout hoặc refresh token ở đây
                  console.error('Unauthorized! Redirecting to login...');
            }
            return Promise.reject(error);
      }
);

export default apiClient;