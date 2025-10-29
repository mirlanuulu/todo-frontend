import axios from 'axios';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

export const getTasks = () => api.get('/tasks');
export const createTask = (title: string, imageURL?: string) => 
  api.post('/tasks', { title, image_url: imageURL || '' });
export const deleteTask = (id: number) => api.delete(`/tasks/${id}`);
export const updateTaskStatus = (id: number, status: string) => 
  api.patch(`/tasks/${id}`, { status });
export const updateTaskImage = (id: number, imageURL: string) => 
  api.patch(`/tasks/${id}`, { image_url: imageURL });
export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};