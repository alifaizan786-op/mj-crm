// fetch/BaseFetch.js
class BaseFetch {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, method = 'GET', body = null, customHeaders = {}) {
    const isFormData = body instanceof FormData;
    
    const headers = isFormData
      ? customHeaders // No need to set 'Content-Type' for FormData; the browser sets it automatically
      : {
          'Content-Type': 'application/json',
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
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }
}

export default BaseFetch;
