import BaseFetch from './BaseFetch';

class SizingFetch extends BaseFetch {
  constructor() {
    super('/api/sizing'); // Base URL for quotes
  }

  async pendingUpload() {
    const pendingUploadData = await this.request(
      '/pendingUpload',
      'GET'
    );
    return pendingUploadData;
  }

  async getUploadingData(data) {
    const uploadingData = await this.request(
      '/UploadingData',
      'POST',
      data
    );
    return uploadingData;
  }

  async getSkuByMultiCode(multCode) {
    const skuByMultiCodeData = await this.request(
      `/multiCode/${multCode}`
    );
    return skuByMultiCodeData;
  }

  async updateSizing(SKUCode, data) {
    const updateSizingData = await this.request(
      `/updateSku/${SKUCode}`,
      'PUT',
      data
    );
    return updateSizingData;
  }
}

export default new SizingFetch(); // Export as a singleton
