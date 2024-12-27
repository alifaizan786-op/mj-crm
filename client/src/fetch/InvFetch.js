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

  async getNewArrivalsByDays(days) {
    const newArrivals = await this.request(
      `/reports/newarrivals/${days}`,
      'GET'
    );

    return newArrivals;
  }

  async getNewArrivalsByVendor(days) {
    const newArrivals = await this.request(
      `/reports/newarrivals/vendor/${days}`,
      'GET'
    );

    return newArrivals;
  }

  async getNewArrivalsByVendorByDays(days, vendor) {
    const newArrivals = await this.request(
      `/reports/newarrivals/vendor/${days}/${vendor}`,
      'GET'
    );

    return newArrivals;
  }

  async getNewArrivalsByDate(date) {
    const newArrivals = await this.request(
      `/reports/newarrivals/date/${date}`,
      'GET'
    );

    return newArrivals;
  }

  async getOpenToBuyByStore(store) {
    const openToBuy = await this.request(
      `/reports/opentobuy/${store}`,
      'GET'
    );

    return openToBuy;
  }

  async getOpenToBuyByStoreAndClass(store, majorCode) {
    const openToBuy = await this.request(
      `/reports/opentobuy/${store}/${majorCode}`,
      'GET'
    );

    return openToBuy;
  }

  async reportBuilder(data) {
    const reportBuilderData = await this.request(
      `/reports/reportBuilder`,
      'POST',
      data
    );

    return reportBuilderData;
  }

  async reportBySku(data) {
    const reportBySkuData = await this.request(
      `/reports/BySku`,
      'POST',
      { sku: data }
    );

    return reportBySkuData;
  }
}

export default new InvFetch(); // Export as a singleton
