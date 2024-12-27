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

  async getOpenToBuyData() {
    const openToBuy = await this.request(`/reports/opentobuy`, 'GET');

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

  async getOpenToBuyDataByClass(majorCode) {
    const openToBuy = await this.request(
      `/reports/opentobuy/${majorCode}`,
      'GET'
    );

    return openToBuy;
  }

  async getReportBySku(data) {
    try {
      const reportdata = await this.request('/search', 'POST', {
        SKUs: data,
      });
      return reportdata;
    } catch (error) {
      console.log(error);
    }
  }
}

export default new WebsiteFetch(); // Export as a singleton
