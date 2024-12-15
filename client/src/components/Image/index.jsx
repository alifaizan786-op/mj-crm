import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import FormatImage from '../../utils/FormatImage';

import { Box, IconButton } from '@mui/material';

import React from 'react';

export default function Image({ sku, size, initialState }) {
  const [imgsrc, setImgSrc] = React.useState(initialState || 'js');

  console.log(FormatImage(sku, size || 'medium'));

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}>
      <IconButton
        onClick={() => {
          imgsrc == 'js' ? setImgSrc('web') : setImgSrc('js');
        }}>
        <ChevronLeftIcon />
      </IconButton>
      <a
        href={FormatImage(sku, imgsrc, size || 'medium')}
        target='_blank'
        rel='noopener noreferrer'>
        <img
          loading='lazy'
          src={FormatImage(sku, imgsrc, size || 'medium')}
          width={imgsrc == 'js' ? 300 : 250}
        />
      </a>
      <IconButton
        onClick={() => {
          imgsrc == 'js' ? setImgSrc('web') : setImgSrc('js');
        }}>
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );
}
