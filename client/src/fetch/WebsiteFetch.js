// fetch/WebsiteFetch.js
import BaseFetch from './BaseFetch';

class WebsiteFetch extends BaseFetch {
  constructor() {
    super('/api/website'); // Base URL for website data
  }

  async getOneSKUData(sku) {
    const getOneSku = await this.request(`/sku/${sku}`, 'GET');

    return getOneSku;
  }

  async getOpenToBuyData(sku) {
    const openToBuy = await this.request(`/reports/opentobuy`, 'GET');

    return openToBuy;
  }
}

export default new WebsiteFetch(); // Export as a singleton
