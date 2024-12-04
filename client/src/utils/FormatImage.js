export default function FormatImage(sku) {
    if (sku.length === 7) {
      return `00${sku.split('-').join('')}`;
    } else if (sku.length === 8) {
      return `0${sku.split('-').join('')}`;
    } else {
      return `${sku.split('-').join('')}`;
    }
  }