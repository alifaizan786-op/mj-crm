import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, IconButton } from '@mui/material';
import React, { useState } from 'react';

const Image = React.memo(({ sku, imageName, size, initialState }) => {
  const [imgsrc, setImgSrc] = useState(initialState || 'js');

  const toggleImageType = () => {
    setImgSrc((prev) => (prev === 'js' ? 'web' : 'js'));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
    >
      <IconButton onClick={toggleImageType}>
        <ChevronLeftIcon />
      </IconButton>
      <a
        href={`/api/image?sku=${sku}&type=${imgsrc}&size=${
          size || 'medium'
        }&imageName=${imageName}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          loading="lazy"
          src={`/api/image?sku=${sku}&type=${imgsrc}&size=${
            size || 'medium'
          }&imageName=${imageName}`}
          width={imgsrc === 'js' ? 300 : 250}
          alt={`${imageName}`}
        />
      </a>
      <IconButton onClick={toggleImageType}>
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );
});

// Export the memoized component
export default Image;
