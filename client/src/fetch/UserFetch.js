// fetch/UserFetch.js
import BaseFetch from './BaseFetch';

class UserFetch extends BaseFetch {
  constructor() {
    super('/api/user'); // Base URL for users
  }

  loginHandler(data) {
    return this.request('/login', 'POST', data);
  }
}

export default new UserFetch(); // Export as a singleton
