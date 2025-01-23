// fetch/ImageFetch.js
import BaseFetch from './BaseFetch';

class ImageFetch extends BaseFetch {
  constructor() {
    super('/api/image'); // Base URL for image operations
  }

  async renameImage(curImage, newImage) {
    try {
      return await this.request(`/${curImage}/to/${newImage}`, 'GET');
    } catch (error) {
      console.error(
        `Error renaming image from ${curImage} to ${newImage}:`,
        error
      );
      throw error;
    }
  }

  async getImage(imageName) {
    try {
      return await this.request(`/${imageName}`, 'GET');
    } catch (error) {
      console.error(`Error fetching image ${imageName}:`, error);
      throw error;
    }
  }

  async convertImage(file, fromFormat, toFormat, width, height) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('fromFormat', fromFormat);
      formData.append('toFormat', toFormat);
      formData.append('width', width || 0);
      formData.append('height', height || 0);

      return await this.request('/convert', 'POST', formData);
    } catch (error) {
      console.error(
        `Error converting image ${file.name} from ${fromFormat} to ${toFormat}:`,
        error
      );
      throw error;
    }
  }
}

export default new ImageFetch(); // Export as a singleton
