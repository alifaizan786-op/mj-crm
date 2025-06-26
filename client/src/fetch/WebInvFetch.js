import BaseFetch from './BaseFetch';

class WebInv extends BaseFetch {
  constructor() {
    super('/api/webInv');
  }

  async autoUpdatePrices(data) {
    const updatePrices = await this.request(
      '/update-prices',
      'POST',
      data
    );
    return updatePrices;
  }

  async webInvSync() {
    const sync = await this.request('/sync', 'POST');
    return sync;
  }
}

export default new WebInv(); // Export as a singleton
