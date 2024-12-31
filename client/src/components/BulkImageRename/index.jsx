import { useEffect, useState } from 'react';
import ImageFetch from '../../fetch/ImageFetch';
import MultiFetch from '../../fetch/MultiFetch';

const BulkRenamerProcessor = ({ data, submit }) => {
  const [processedData, setProcessedData] = useState([]);
  const [downloadImages, setDownloadImages] = useState([]);

  useEffect(() => {
    if (submit && data.length > 0) {
      processBulkRename();
    }
  }, [submit]);

  const processBulkRename = async () => {
    const multiCodeMap = new Map();

    // Fetch all multiCode data
    for (const item of data) {
      try {
        const multiCodeData = await MultiFetch.bulkMultiCode([
          item.multiCode,
        ]);

        if (multiCodeData.length > 0) {
          const masterImage = multiCodeData[0].image[0];
          const allImageArr = [
            masterImage,
            isImageAvailable(masterImage, '_1'),
            isImageAvailable(masterImage, '_2'),
            isImageAvailable(masterImage, '_3'),
          ].filter(Boolean);

          multiCodeMap.set(item.multiCode, allImageArr);
        }
      } catch (error) {
        console.error(
          `Error fetching multiCode data for ${item.multiCode}:`,
          error
        );
      }
    }

    // Process renaming for each multiCode
    const updatedData = [];
    for (const item of data) {
      const allImageArr = multiCodeMap.get(item.multiCode);
      if (allImageArr) {
        for (const sku of item.SKU) {
          for (const image of allImageArr) {
            await renamer(image, sku);
            updatedData.push({
              multiCode: item.multiCode,
              sku,
              status: 'processed',
            });
          }
        }
      }
    }

    setProcessedData(updatedData);

    console.log(processedData);
    console.log(downloadImages);

    for (let i = 0; i < downloadImages.length; i++) {
      const element = downloadImages[i];
      try {
        let link = `/api/image/${element}`;
        console.log(link);
        window.open(link, '_blank');
      } catch (error) {
        console.log(error);
      }
    }
  };

  const renamer = async (imageName, renameTo) => {
    try {
      const formattedName = formatSkuToImage(renameTo);
      const newImageName = imageName.includes('_')
        ? `${formattedName}_${
            imageName.split('.')[0].split('_')[1]
          }.jpg`
        : `${formattedName}.jpg`;

      const renameResponse = await ImageFetch.renameImage(
        imageName,
        newImageName
      );

      // Append the new image to the existing state
      setDownloadImages((prevDownloadImages) => [
        ...prevDownloadImages,
        newImageName,
      ]);

      // Log for debugging
    } catch (error) {
      console.error(
        `Error renaming or downloading image ${imageName} to ${renameTo}:`,
        error
      );
    }
  };

  const isImageAvailable = (imageName, suffix) => {
    const xhr = new XMLHttpRequest();
    const newImgName = `${imageName.split('.')[0]}${suffix}.jpg`;
    xhr.open(
      'HEAD',
      `https://www.malanijewelers.com/TransactionImages/Styles/Large/${newImgName}`,
      false
    );
    xhr.send();

    return xhr.status === 200 ? newImgName : null;
  };

  const formatSkuToImage = (sku) => {
    if (sku.length === 7) {
      return `00${sku.split('-').join('')}`;
    } else if (sku.length === 8) {
      return `0${sku.split('-').join('')}`;
    } else {
      return `${sku.split('-').join('')}`;
    }
  };

  return null;
};

export default BulkRenamerProcessor;
