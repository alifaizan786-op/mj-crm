// fetch/WebsiteFetch.js
import BaseFetch from './BaseFetch';

class WebsiteFetch extends BaseFetch {
  constructor() {
    super('/api/website'); // Base URL for website data
  }

  async getOneSKUData(sku) {
    try {
      const getOneSku = await this.request(`/sku/${sku}`, 'GET');

      return getOneSku;
    } catch (error) {
      console.log(error);
    }
  }

  async generateLongDesc(sku) {
    try {
      const generateLongDescData = await this.request(
        `/utils/description/`,
        'POST',
        {
          SKUArr: sku,
        }
      );

      return generateLongDescData;
    } catch (error) {
      console.log(error);
    }
  }

  async getOpenToBuyData() {
    try {
      const openToBuy = await this.request(
        `/reports/opentobuy`,
        'GET'
      );

      return openToBuy;
    } catch (error) {
      console.log(error);
    }
  }

  async reportBuilder(data) {
    try {
      const reportBuilderData = await this.request(
        `/reports/reportBuilder`,
        'POST',
        data
      );

      return reportBuilderData;
    } catch (error) {
      console.log(error);
    }
  }

  async getOpenToBuyDataByClass(majorCode) {
    try {
      const openToBuy = await this.request(
        `/reports/opentobuy/${majorCode}`,
        'GET'
      );

      return openToBuy;
    } catch (error) {
      console.log(error);
    }
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

  async getUploadingReport(data) {
    try {
      const uploadingReport = await this.request(
        '/reports/uploadingReport',
        'GET'
      );
      return uploadingReport;
    } catch (error) {
      console.log(error);
    }
  }

  async getSkuBySearchUploadDate(date) {
    try {
      const skuBySearchUploadDateData = await this.request(
        `/reports/getSkuBySearchDate/${date}`,
        'GET'
      );
      return skuBySearchUploadDateData;
    } catch (error) {
      console.log(error);
    }
  }

  async getOutOfStockOnline() {
    try {
      const getOutOfStockOnlineData = await this.request(
        `/reports/outOfStockOnline`,
        'GET'
      );
      return getOutOfStockOnlineData;
    } catch (error) {
      console.log(error);
    }
  }

  async getSkuByMulti(multiCode) {
    try {
      const getSkuByMultiData = await this.request(
        `/reports/multiCode/${multiCode}`,
        'GET'
      );
      return getSkuByMultiData;
    } catch (error) {
      console.log(error);
    }
  }

  async hiddenButInstock() {
    try {
      const getHiddenButInstock = await this.request(
        `/reports/hiddenButInstock`,
        'GET'
      );
      return getHiddenButInstock;
    } catch (error) {
      console.log(error);
    }
  }

  async clientSearch(data) {
    try {
      const getClientByInfo = await this.request(
        `/client`,
        'POST',
        data
      );
      return getClientByInfo;
    } catch (error) {
      console.log(error);
    }
  }
}

export default new WebsiteFetch(); // Export as a singleton
