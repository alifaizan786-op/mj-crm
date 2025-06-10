// fetch/UserFetch.js
import BaseFetch from "./BaseFetch";

class PricingPolicyRoutesFetch extends BaseFetch {
  constructor() {
    super("/api/PricingPolicy"); // Base URL for users
  }

  getPricingPolicy() {
    return this.request("/", "GET");
  }

  createPricingPolicy(data) {
    return this.request("/", "POST", data);
  }

  getByClassCode(classCode) {
    return this.request(`/classcode/${classCode}`, "GET");
  }
}

export default new PricingPolicyRoutesFetch(); // Export as a singleton
