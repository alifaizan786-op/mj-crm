// fetch/InvFetch.js
import BaseFetch from './BaseFetch';

class InvFetch extends BaseFetch {
  constructor() {
    super('/api/inventory'); // Base URL for users
  }

  async getOneSKUData(sku) {
    const skuData = await this.request(`/sku/${sku}`, 'GET');

    return skuData;
  }

  async getOpenToBuyByStore(store) {
    const openToBuy = await this.request(
      `/opentobuy/${store}`,
      'GET'
    );

    return openToBuy;
  }

  async getOpenToBuyByStoreAndClass(store, majorCode) {
    const openToBuy = await this.request(
      `/opentobuy/${store}/${majorCode}`,
      'GET'
    );

    return openToBuy;
  }
}

export default new InvFetch(); // Export as a singleton
