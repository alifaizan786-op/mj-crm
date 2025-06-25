import auth from '../utils/auth';

// fetch/BaseFetch.js
class BaseFetch {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(
    endpoint,
    method = 'GET',
    body = null,
    customHeaders = {}
  ) {
    const isFormData = body instanceof FormData;

    // Get auth token and add to headers
    const token = auth.getToken();
    const authHeaders = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    const headers = isFormData
      ? {
          ...authHeaders,
          ...customHeaders,
        } // No need to set 'Content-Type' for FormData; the browser sets it automatically
      : {
          'Content-Type': 'application/json',
          ...authHeaders,
          ...customHeaders,
        };

    const config = {
      method,
      headers,
    };

    if (body) {
      config.body = isFormData ? body : JSON.stringify(body);
    }

    try {
      const response = await fetch(
        `${this.baseURL}${endpoint}`,
        config
      );

      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401) {
        // Check if user is logged in but token is expired
        if (auth.loggedIn() === false && auth.getToken()) {
          // Token exists but is expired, logout user
          auth.logout();
          return;
        }
        throw new Error('Unauthorized: Please log in');
      }

      if (!response.ok) {
        throw new Error(
          `Error: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }
}

export default BaseFetch;
