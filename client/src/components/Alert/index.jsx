'use client';
import {
  Box,
  Typography,
  TextField,
  Divider,
  Button,
  Collapse,
  Alert,
  IconButton,
} from '@mui/material';

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import CloseIcon from '@mui/icons-material/Close';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

export default function CustomAlert({ fetch, message }) {
  const [data, setData] = React.useState();
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    const doFetch = async () => {
      let data = await fetch();
      setData(data);
      setOpen(data.length > 0 && true);
    };

    doFetch();
  }, []);

  return (
    <Box>
      <Collapse in={open}>
        <Alert
          severity='error'
          action={
            <>
              <IconButton
                onClick={() => {
                  let link = `/Reports/GetAllInfo?SKUCode=${data?.join(
                    '_'
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
          {data?.length} {message}
        </Alert>
      </Collapse>
    </Box>
  );
}
