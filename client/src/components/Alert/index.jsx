'use client';
import { Alert, Box, Collapse, IconButton } from '@mui/material';

import React, { useEffect } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import Loader from '../../components/Loader';

export default function CustomAlert({ fetch, message, altMessage }) {
  const [data, setData] = React.useState({
    loading: true,
    data: [],
  });
  const [open, setOpen] = React.useState(false);

  console.log('custom alert', data, open, message);

  useEffect(() => {
    const doFetch = async () => {
      let data = await fetch();
      setData({ loading: false, data: data });
      setOpen(true);
    };
    doFetch();
  }, []);

  return (
    <Box>
      {data.loading == true && <Loader size={50} />}
      <Collapse in={open}>
        {data.loading == false && data.data?.length > 0 ? (
          <Alert
            severity='error'
            action={
              <>
                <IconButton
                  onClick={() => {
                    let link = `/Merchandise/Reports/GetAllInfo?sku=${data.join(
                      '+'
                    )}`;
                    window.open(link, '_blank');
                  }}
                  aria-label='close'
                  color='inherit'
                  size='small'>
                  <RemoveRedEyeIcon fontSize='inherit' />
                </IconButton>

                <IconButton
                  aria-label='close'
                  color='inherit'
                  size='small'
                  onClick={() => {
                    setOpen(false);
                  }}>
                  <CloseIcon fontSize='inherit' />
                </IconButton>
              </>
            }
            sx={{ mb: 2 }}>
            {data?.data.length} {message}
          </Alert>
        ) : (
          <Alert
            severity='success'
            action={
              <>
                <IconButton
                  aria-label='close'
                  color='inherit'
                  size='small'
                  onClick={() => {
                    setOpen(false);
                  }}>
                  <CloseIcon fontSize='inherit' />
                </IconButton>
              </>
            }
            sx={{ mb: 2 }}>
            {altMessage}
          </Alert>
        )}
      </Collapse>
    </Box>
  );
}
