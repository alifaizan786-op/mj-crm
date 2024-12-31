// fetch/UserFetch.js
import BaseFetch from './BaseFetch';

class MultiFetch extends BaseFetch {
  constructor() {
    super('/api/multi'); // Base URL for users
  }

  async getAllMulti() {
    return await this.request('/', 'GET');
  }

  async createMulti(data) {
    return await this.request('/', 'POST', data);
  }

  async getOneMulti(multiCode) {
    return await this.request(`/${multiCode}`, 'GET');
  }

  async deleteMulti(multiCode) {
    return await this.request(`/${multiCode}`, 'DELETE');
  }

  async updateMulti(multiCode, data) {
    return await this.request(`/${multiCode}`, 'PUT', data);
  }

  async getMultiByQuery(query) {
    return await this.request(`/query${query}`, 'GET');
  }

  async bulkMultiCode(data) {
    return await this.request(`/bulkMultiCode`, 'POST', {
      multiCode: data,
    });
  }

  async nextMulti() {
    return await this.request(`/nextMulti`, 'GET');
  }
}

export default new MultiFetch(); // Export as a singleton
