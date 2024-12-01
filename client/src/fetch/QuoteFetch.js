import BaseFetch from './BaseFetch';

class QuoteFetch extends BaseFetch {
  constructor() {
    super('/api/quotes'); // Base URL for quotes
  }

  async addQuote(data) {
    const newQuoteData = await this.request('/', 'POST', data);
    return newQuoteData;
  }

  async getAllQuotes() {
    const allQuotesData = await this.request('/', 'GET');
    return allQuotesData;
  }

  async getQuoteById(id) {
    const quoteById = await this.request(`/${id}`, 'GET');
    return quoteById;
  }

  async updateQuoteById(id, data) {
    const updatedQuote = await this.request(`/${id}`, 'PUT', data);
    return updatedQuote;
  }

  async deleteQuoteById(id) {
    const deletedQuote = await this.request(`/${id}`, 'DELETE');
    return deletedQuote;
  }

  async getRandomQuotes(count) {
    const randomQuotes = await this.request(
      `/random/${count}`,
      'GET'
    );
    return randomQuotes;
  }
}

export default new QuoteFetch(); // Export as a singleton
