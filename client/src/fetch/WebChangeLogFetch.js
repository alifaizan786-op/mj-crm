import BaseFetch from './BaseFetch';

class WebChangeLog extends BaseFetch {
  constructor() {
    super('/api/webchangelog');
  }

  async getChangeLog(data) {
    /*
        destination,
        id,
        user,
        fieldName,
        source,
        fromDate,
        toDate,
        page = 1,
        limit = 50,
    */
    const limit = data?.limit || 50;
    const page = data?.page || 1;
    const destination = data?.destination || '';
    const fieldName = data?.fieldName || '';
    const fromDate = data?.fromDate || '';
    const toDate = data?.toDate || '';

    const updatePrices = await this.request(
      `?limit=${limit}&page=${page}${
        destination ? `&destination=${destination}` : ''
      }${fieldName ? `&fieldName=${fieldName}` : ''}${
        fromDate ? `&fromDate=${fromDate}` : ''
      }${toDate ? `&toDate=${toDate}` : ''}`,
      'get'
    );
    return updatePrices;
  }
}

export default new WebChangeLog(); // Export as a singleton
