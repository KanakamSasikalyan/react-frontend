// // Added dynamic base URL configuration
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8081' 
  : 'https://ubc-fashion-studio-ai-backend-container-gbhxfzafhxddd8bx.centralus-01.azurewebsites.net';

export default API_BASE_URL;