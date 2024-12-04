// fetch/InvFetch.js
import BaseFetch from './BaseFetch';

class InvFetch extends BaseFetch {
  constructor() {
    super('/api/inventory'); // Base URL for users
  }

  async getOneSKUData(sku) {
    const userById = await this.request(`/sku/${sku}`, 'GET');

    return userById;
  }
}

export default new InvFetch(); // Export as a singleton
