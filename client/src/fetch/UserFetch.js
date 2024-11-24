// fetch/UserFetch.js
import BaseFetch from './BaseFetch';

class UserFetch extends BaseFetch {
  constructor() {
    super('/api/user'); // Base URL for users
  }

  loginHandler(data) {
    return this.request('/login', 'POST', data);
  }

  getAllUsers() {
    return this.request('/', 'GET');
  }

  getUserById(id) {
    return this.request(`/${id}`, 'GET');
  }

  UpdateUserById(id, data) {
    return this.request(`/${id}`, 'PUT', data);
  }

  ///bookmarks/:id
  getUserBookmarks(id) {
    return this.request(`/bookmarks/${id}`, 'get');
  }
}

export default new UserFetch(); // Export as a singleton
