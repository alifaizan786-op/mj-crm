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
}

export default new WebInv(); // Export as a singleton
