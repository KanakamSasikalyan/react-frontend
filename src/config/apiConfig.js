// Added dynamic base URL configuration
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8080' 
  : 'https://fashion-studio-ai-zbt4.onrender.com';

export default API_BASE_URL;