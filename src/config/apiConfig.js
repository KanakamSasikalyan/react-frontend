// // Added dynamic base URL configuration
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8081' 
  : 'https://ubc-backend-fashion-studio-ai-server-btfmcahmf0b7ayfe.canadacentral-01.azurewebsites.net';

export default API_BASE_URL;