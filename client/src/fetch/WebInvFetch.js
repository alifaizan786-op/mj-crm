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

  async getSkuListing(params = {}) {
    const {
      search = '',
      classcode,
      vendor,
      gold_karat,
      autoUpdatePrice,
      page = 1,
      limit = 50,
      sortBy = 'classcode',
      sortOrder = 'asc',
    } = params;

    const queryParams = new URLSearchParams();

    if (search) queryParams.append('search', search);
    if (classcode) queryParams.append('classcode', classcode);
    if (vendor) queryParams.append('vendor', vendor);
    if (gold_karat) queryParams.append('gold_karat', gold_karat);
    if (autoUpdatePrice !== undefined)
      queryParams.append('autoUpdatePrice', autoUpdatePrice);
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    queryParams.append('sortBy', sortBy);
    queryParams.append('sortOrder', sortOrder);

    return await this.request(`?${queryParams.toString()}`, 'GET');
  }

  async getSkuDetails(sku) {
    if (!sku) {
      throw new Error('SKU is required');
    }
    return await this.request(`/${encodeURIComponent(sku)}`, 'GET');
  }

  async updateSkuDetails(sku, data) {
    const updatedSku = await this.request(
      `/${encodeURIComponent(sku)}`,
      'PUT',
      data
    );
  }

  async bulkAutoUpdatePricing(req, res) {
    return await this.request('/price-refresh', 'POST');
  }
}

export default new WebInv(); // Export as a singleton
