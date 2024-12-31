// fetch/UserFetch.js
import BaseFetch from './BaseFetch';

class ImageFetch extends BaseFetch {
  constructor() {
    super('/api/image'); // Base URL for users
  }

  async renameImage(curImage, newImage) {
    return await this.request(`/${curImage}/to/${newImage}`, 'GET');
  }

  async getImage(imageName) {
    return await this.request(`/${imageName}`, 'GET');
  }
}

export default new ImageFetch(); // Export as a singleton
