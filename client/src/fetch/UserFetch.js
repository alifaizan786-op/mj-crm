// fetch/UserFetch.js
import BaseFetch from './BaseFetch';

class UserFetch extends BaseFetch {
  constructor() {
    super('/api/user'); // Base URL for users
  }

  async createUser(data) {
    const newUserData = await this.request('/', 'POST', data);

    return newUserData;
  }

  async loginHandler(data) {
    const loginData = await this.request('/login', 'POST', data);

    return loginData;
  }

  async getAllUsers() {
    const allUserData = await this.request('/', 'GET');

    return allUserData;
  }

  async getUserById(id) {
    const userById = await this.request(`/${id}`, 'GET');

    return userById;
  }

  async UpdateUserById(id, data) {
    const updateUser = await this.request(`/${id}`, 'PUT', data);

    return updateUser;
  }

  ///bookmarks/:id
  getUserBookmarks(id) {
    return this.request(`/bookmarks/${id}`, 'get');
  }
}

export default new UserFetch(); // Export as a singleton
