// fetch/UserFetch.js
import BaseFetch from "./BaseFetch";

class GoldPriceFetch extends BaseFetch {
  constructor() {
    super("/api/goldweb"); // Base URL for users
  }

  getGoldPrice() {
    return this.request("/", "GET");
  }

  createGoldPrice(data) {
    return this.request("/", "POST", data);
  }
}

export default new GoldPriceFetch(); // Export as a singleton
