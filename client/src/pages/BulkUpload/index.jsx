import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Button, styled } from '@mui/material';
import React from 'react';
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

export default function BulkUpload() {
  const [file, setFile] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const handleFileChange = (event) => {
    setLoading(true);
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setLoading(false);
  };

  return (
    <Common>
      <Button
        component='label'
        role={undefined}
        variant='contained'
        tabIndex={-1}
        startIcon={<CloudUploadIcon />}>
        Upload file
        <VisuallyHiddenInput
          type='file'
          onChange={handleFileChange}
        />
      </Button>
    </Common>
  );
}
