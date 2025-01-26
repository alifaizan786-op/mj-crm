import { useEffect, useState } from 'react';
import ImageFetch from '../../fetch/ImageFetch';
import MultiFetch from '../../fetch/MultiFetch';

// Sample "data" array:
// [
//   {
//     ID: '1',
//     SKUCode: '441-02861',
//     MultiStyleCode: '441-00770-GS-Y-Y',
//   },
//   {
//     ID: '2',
//     SKUCode: '440-02897',
//     MultiStyleCode: '440-00755-GS-Y-Y',
//   },
// ];

const BulkRenamerProcessor = ({
  data,
  setData,
  submit,
  setSubmit,
  download,
  setDownload,
  loading,
  setLoading,
}) => {
  const [processedData, setProcessedData] = useState([]);
  const [downloadImages, setDownloadImages] = useState([]);
  const [allMultiData, setAllMultiData] = useState([]);
  const [imageData, setImageData] = useState([]);

  useEffect(() => {
    if (submit && data.length > 0) {
      processBulkRename();
    }
  }, [submit]);

  useEffect(() => {
    if (download && downloadImages.length > 0) {
      handleDownload();
    }
  }, [download]);

  const processBulkRename = async () => {
    setLoading(true);
    const multiCodeMap = new Map();
    const allMultiCodes = [
      ...new Set(data.map((item) => item.MultiStyleCode)),
    ];

    try {
      const multiCodeData = await MultiFetch.bulkMultiCode(
        allMultiCodes
      );
      setAllMultiData(multiCodeData);
      for (const item of multiCodeData) {
        const masterImage = item.image[0];
        const allImageArr = [
          masterImage,
          isImageAvailable(masterImage, '_1'),
          isImageAvailable(masterImage, '_2'),
          isImageAvailable(masterImage, '_3'),
        ].filter(Boolean);

        multiCodeMap.set(item.multiCode, allImageArr);
      }

      setImageData(multiCodeMap);

      setSubmit(false);
    } catch (error) {
      console.log(error);
    }

    // Process renaming for each multiCode
    const updatedData = [];
    for (const item of data) {
      const allImageArr = multiCodeMap.get(item.MultiStyleCode);
      if (allImageArr) {
        for (const image of allImageArr) {
          await renamer(image, item.SKUCode);
          updatedData.push({
            multiCode: item.multiCode,
            SKUCode: item.SKUCode,
            Image: image,
            status: 'processed',
            ...item,
          });
        }
      }
    }

    setData(updatedData);
    setLoading(false);
    setProcessedData(updatedData);
  };

  const handleDownload = async () => {
    for (let i = 0; i < downloadImages.length; i++) {
      const element = downloadImages[i];
      try {
        let link = `/api/image/${element}`;
        window.open(link, '_blank');
      } catch (error) {
        console.log(error);
      }
    }
    setDownload(false);
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
