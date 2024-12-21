export default function FormatImage(sku, imgsrc, size, imageName) {
  try {
    if (sku) {
      if (imgsrc == 'web') {
        if (sku.length === 7) {
          return `https://www.malanijewelers.com/TransactionImages/Styles/${size}/00${sku
            .split('-')
            .join('')}.JPG`;
        } else if (sku.length === 8) {
          return `https://www.malanijewelers.com/TransactionImages/Styles/${size}/0${sku
            .split('-')
            .join('')}.JPG`;
        } else {
          return `https://www.malanijewelers.com/TransactionImages/Styles/${size}/${sku
            .split('-')
            .join('')}.JPG`;
        }
      } else {
        if (sku.length === 7) {
          return `https://mjplusweb.com/Images/JS/00${sku
            .split('-')
            .join('')}.JPG`;
        } else if (sku.length === 8) {
          return `https://mjplusweb.com/Images/JS/0${sku
            .split('-')
            .join('')}.JPG`;
        } else {
          return `https://mjplusweb.com/Images/JS/${sku
            .split('-')
            .join('')}.JPG`;
        }
      }
    }
    if (imageName) {
      if (imgsrc == 'web') {
        return `https://www.malanijewelers.com/TransactionImages/Styles/${size}/${imageName}`;
      } else {
        return `https://mjplusweb.com/Images/JS/00${imageName}`;
      }
    }
  } catch (error) {
    return 'https://www.malanijewelers.com/Images/ImageNotAvailable.jpg';
  }
}
