// fetch/WebsiteFetch.js
import BaseFetch from './BaseFetch';

class WebsiteFetch extends BaseFetch {
  constructor() {
    super('/api/website'); // Base URL for users
  }

  async getOneSKUData(sku) {
    const userById = await this.request(`/sku/${sku}`, 'GET');

    return userById;
  }
}

export default new WebsiteFetch(); // Export as a singleton
