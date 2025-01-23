import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';
import ImageFetch from '../../fetch/ImageFetch';
import Common from '../../layouts/common';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function FileConverter() {
  const [fromFormat, setFromFormat] = useState('');
  const [toFormat, setToFormat] = useState('');
  const [height, setHeight] = useState('');
  const [width, setWidth] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [convertedFile, setConvertedFile] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFromFormat(file.name.split('.').pop()); // Get file extension as format
    }
  };

  const handleConversion = async () => {
    if (!selectedFile || !toFormat) {
      alert('Please upload a file and select the target format.');
      return;
    }

    setLoading(true);
    try {
      const response = await ImageFetch.convertImage(
        selectedFile,
        fromFormat,
        toFormat,
        width || 0,
        height || 0
      );

      if (response && response.convertedFileName) {
        setConvertedFile(response.convertedFileName);
        alert(
          `File converted successfully: ${response.convertedFileName}`
        );
      }
    } catch (error) {
      alert('Image conversion failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Common>
      <Typography
        variant='h4'
        gutterBottom>
        File Converter
      </Typography>
      <Box
        sx={{
          display: 'flex',
          padding: 4,
          justifyContent: 'space-evenly',
          alignItems: 'center',
        }}>
        <Box>
          <Autocomplete
            size='small'
            disablePortal
            options={['jpg', 'webp', 'png']}
            value={fromFormat}
            onChange={(event, newValue) => setFromFormat(newValue)}
            sx={{ width: 300 }}
            renderInput={(params) => (
              <TextField
                size='small'
                {...params}
                label='From'
              />
            )}
          />
        </Box>
        <ArrowForwardIcon fontSize='large' />
        <Box>
          <Autocomplete
            size='small'
            disablePortal
            options={['jpg', 'webp', 'png']}
            value={toFormat}
            onChange={(event, newValue) => setToFormat(newValue)}
            sx={{ width: 300 }}
            renderInput={(params) => (
              <TextField
                size='small'
                {...params}
                label='To'
              />
            )}
          />
          <Box
            sx={{
              marginTop: 2,
              display: 'flex',
              justifyContent: 'space-evenly',
            }}>
            <TextField
              sx={{ width: '125px' }}
              label='H'
              size='small'
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
            <TextField
              sx={{ width: '125px' }}
              label='W'
              size='small'
              value={width}
              onChange={(e) => setWidth(e.target.value)}
            />
          </Box>
        </Box>
      </Box>

      <Button
        component='label'
        variant='contained'
        startIcon={<CloudUploadIcon />}>
        Upload File
        <VisuallyHiddenInput
          type='file'
          onChange={handleFileUpload}
        />
      </Button>

      {selectedFile && (
        <Typography mt={2}>
          Selected File: {selectedFile.name}
        </Typography>
      )}

      <Box mt={3}>
        <Button
          variant='contained'
          color='primary'
          onClick={handleConversion}
          disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Convert'}
        </Button>
      </Box>

      {convertedFile && (
        <Typography
          mt={2}
          color='success.main'>
          Converted File:{' '}
          <a
            href={`/api/image/${convertedFile}`}
            download>
            {convertedFile}
          </a>
        </Typography>
      )}
    </Common>
  );
}
