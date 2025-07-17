// // Added dynamic base URL configuration
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8080' 
  : 'https://backend-fashion-studio-ai-ubc-bwbjcebtbrhjcjds.centralus-01.azurewebsites.net';

export default API_BASE_URL;