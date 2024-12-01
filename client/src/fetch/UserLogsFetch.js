// fetch/UserFetch.js
import BaseFetch from './BaseFetch';

class UserLogsFetch extends BaseFetch {
  constructor() {
    super('/api/userlogs'); // Base URL for users
  }

  createUserLog(data) {
    return this.request('/', 'POST', data);
  }

  getAllUserLogs() {
    return this.request('/', 'GET');
  }

  getUserLogsByUserId(userId) {
    return this.request(`/user/${userId}`, 'GET');
  }

  getUserLogsByLogId(logId) {
    return this.request(`/${logId}`, 'GET');
  }

  updateLogById(logId, data) {
    return this.request(`/${logId}`, 'PUT', data);
  }

  deleteLogById(logId) {
    return this.request(`/${logId}`, 'DELETE');
  }
}

export default new UserLogsFetch(); // Export as a singleton
