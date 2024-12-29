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
}

export default new SizingFetch(); // Export as a singleton
