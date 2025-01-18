// fetch/CustomerFetch.js
import BaseFetch from './BaseFetch';

class CustomerFetch extends BaseFetch {
  constructor() {
    super('/api/customer'); // Base URL for customers api
  }

  customerSearch(data) {
    return this.request(`/search`, 'POST', data);
  }
}

export default new CustomerFetch(); // Export as a singleton
