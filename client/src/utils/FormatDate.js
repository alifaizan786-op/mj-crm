export default function formatDate(inputDateString) {
    // Create a new Date object from the input string
    var originalDate = new Date(inputDateString);
  
    // Extract the components of the date
    var month = originalDate.getMonth() + 1; // Months are zero-indexed
    var day = originalDate.getDate();
    var year = originalDate.getFullYear();
  
    // Format the date as MM/DD/YYYY
    var formattedDate = month + '/' + day + '/' + year;
  
    // Return the formatted date
    return formattedDate;
  }
  
  export function formatSkuToImage(sku) {
    if (sku.length === 7) {
      return `00${sku.split('-').join('')}`;
    } else if (sku.length === 8) {
      return `0${sku.split('-').join('')}`;
    } else {
      return `${sku.split('-').join('')}`;
    }
  }