// fetch/UserFetch.js
import BaseFetch from './BaseFetch';

class UserRoutesFetch extends BaseFetch {
  constructor() {
    super('/api/userRoutes'); // Base URL for users
  }

  createUserRoute(data) {
    return this.request('/', 'POST', data);
  }

  getAllUserRoutes() {
    return this.request('/', 'GET');
  }

  getUserRoutesByPaths(data) {
    return this.request('/paths', 'POST', data);
  }

  updateUserRoutesById(id, data) {
    return this.request(`/${id}`, 'PUT', data);
  }

  deleteRouteById(id) {
    return this.request(`/${id}`, 'delete');
  }
}

export default new UserRoutesFetch(); // Export as a singleton
