export default function FormatImage(sku, imgsrc, size) {
  try {
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
  } catch (error) {
    return 'https://www.malanijewelers.com/Images/ImageNotAvailable.jpg';
  }
}
