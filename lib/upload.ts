import api from './api';

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const { data } = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return data.data.url;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to upload image via backend');
  }
};
