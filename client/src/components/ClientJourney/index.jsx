import { Box } from '@mui/material';
import React from 'react';

export default function ClientJourney({ data }) {
  const buttonOptions = {
    size: 'small',
    variant: 'outlined',
    sx: {
      margin: '0 5px',
      bgcolor: 'white',
      width: '100px',
    },
  };

  return (
    <Box
      sx={{
        bgcolor: 'white',
        width: '75%',
        marginTop: '10px',
      }}>
      Client Journey
    </Box>
  );
}
