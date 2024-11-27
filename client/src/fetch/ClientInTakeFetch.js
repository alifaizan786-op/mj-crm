// fetch/ClientInTakeFetch.js
import BaseFetch from './BaseFetch';

class ClientInTakeFetch extends BaseFetch {
  constructor() {
    super('/api/ClientForm'); // Base URL for users
  }

  getTodayEntries(store) {
    return this.request(`/today/${store}`, 'GET');
  }

  getMonthEntries(store) {
    return this.request(`/month/${store}`, 'GET');
  }
}

export default new ClientInTakeFetch(); // Export as a singleton
