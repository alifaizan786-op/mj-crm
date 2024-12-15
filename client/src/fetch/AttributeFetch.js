import BaseFetch from './BaseFetch';

class AttributeFetch extends BaseFetch {
  constructor() {
    super('/api/attribute'); // Base URL for attributes
  }

  async addAttribute(data) {
    const newAttributeData = await this.request('/', 'POST', data);
    return newAttributeData;
  }

  async getAllAttributes() {
    const allAttributesData = await this.request('/', 'GET');
    return allAttributesData;
  }

  async getAttributeByTitle(title) {
    const attributeByTitle = await this.request(
      `/title/${title}`,
      'GET'
    );
    return attributeByTitle;
  }

  async updateAttributeById(id, data) {
    const updatedAttribute = await this.request(
      `/${id}`,
      'PUT',
      data
    );
    return updatedAttribute;
  }

  async deleteAttributeById(id) {
    const deletedAttribute = await this.request(`/${id}`, 'DELETE');
    return deletedAttribute;
  }
}

export default new AttributeFetch(); // Export as a singleton
