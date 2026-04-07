import apiClient from '../api/apiClient';

export const dataService = {
      // 1. API gọi data bình thường (Sẽ dính timeout 10s mặc định)
      getSomeData: () => {
            return apiClient.get('/api/data');
      },

      // 2. API Upload File (Sẽ bỏ qua 10s và cho phép thời gian tải lên dài hơn)
      uploadStatementFile: (file) => {
            const formData = new FormData();
            formData.append('file', file);

            return apiClient.post('/api/upload', formData, {
                  headers: {
                        'Content-Type': 'multipart/form-data',
                  },
                  timeout: 60000,
            });
      }
};