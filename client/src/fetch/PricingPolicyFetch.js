// fetch/UserFetch.js
import BaseFetch from './BaseFetch';

class PricingPolicyRoutesFetch extends BaseFetch {
  constructor() {
    super('/api/PricingPolicy'); // Base URL for users
  }

  getPricingPolicy() {
    return this.request('/', 'GET');
  }

  createPricingPolicy(data) {
    return this.request('/', 'POST', data);
  }

  updatePricingPolicy(id, data) {
    return this.request(`/${id}`, 'PUT', data);
  }

  getByClassCode(classCode) {
    return this.request(`/classcode/${classCode}`, 'GET');
  }

  getLogs() {
    return this.request(`/logs`, 'GET');
  }

  getLogFile(fileName) {
    return this.request(`/logs/${fileName}`, 'GET');
  }
}

export default new PricingPolicyRoutesFetch(); // Export as a singleton
