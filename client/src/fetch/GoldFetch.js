// fetch/UserFetch.js
import BaseFetch from './BaseFetch';

class GoldFetch extends BaseFetch {
  constructor() {
    super('/api/gold'); // Base URL for users
  }

  async getGold() {
    return await this.request('/', 'GET');
  }
}

export default new GoldFetch(); // Export as a singleton
