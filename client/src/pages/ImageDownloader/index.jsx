import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import LoadingButton from '@mui/lab/LoadingButton';
import { Button } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';
import { DataGrid, GridToolbarContainer } from '@mui/x-data-grid';
import React, { useState } from 'react';
import BulkImageRename from '../../components/BulkImageRename';
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

export default function ImageDownloader() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [submit, setSubmit] = useState(false);
  const [download, setDownload] = useState(false);

  const handleFileChange = (event) => {
    setLoading(true);
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setLoading(false);
  };

  const handleDownload = () => {
    setDownload(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);

    if (!file) {
      alert('Please select a CSV file');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const csvData = reader.result;
      const jsonData = convertCsvToJson(csvData);
      setData(jsonData);
      setSubmit(true);
      setLoading(false);
    };

    reader.readAsText(file);
  };

  const convertCsvToJson = (csvData) => {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    const jsonData = lines
      .slice(1)
      .map((line) => {
        const values = line.split(',');
        if (values.length === headers.length) {
          return headers.reduce((acc, header, index) => {
            acc[header.replace(/\r/g, '')] = values[index].replace(
              /\r/g,
              ''
            );
            return acc;
          }, {});
        }
        return null;
      })
      .filter(Boolean);

    return jsonData;
  };

  let columns = [
    { field: 'ID', headerName: 'ID', width: 150 },
    { field: 'SKUCode', headerName: 'SKUCode', width: 150 },
    {
      field: 'MultiStyleCode',
      headerName: 'MultiStyleCode',
      width: 150,
    },
    {
      field: 'Image',
      headerName: 'Image',
      width: 150,
    },
  ];

  function CustomToolbar() {
    return (
      <GridToolbarContainer
        sx={{ justifyContent: 'space-evenly', padding: '0% 5%' }}>
        <Button
          component='label'
          variant='standard'
          startIcon={<CloudUploadIcon />}>
          Upload file
          <VisuallyHiddenInput
            type='file'
            onChange={handleFileChange}
          />
        </Button>

        <LoadingButton
          disabled={!file}
          onClick={handleSubmit}
          loading={loading}
          startIcon={<SaveIcon />}
          variant='standard'>
          <span>Submit</span>
        </LoadingButton>

        <LoadingButton
          disabled={data.length == 0 || data[0].Image == ''}
          onClick={handleDownload}
          loading={loading}
          startIcon={<SaveIcon />}
          variant='standard'>
          <span>Download Images</span>
        </LoadingButton>
      </GridToolbarContainer>
    );
  }

  return (
    <Common>
      <DataGrid
        rows={data}
        columns={columns}
        components={{
          Toolbar: CustomToolbar,
          LoadingOverlay: LinearProgress,
        }}
        getRowId={(row) => row.ID}
      />
      <BulkImageRename
        data={data}
        setData={setData}
        submit={submit}
        setSubmit={setSubmit}
        download={download}
        setDownload={setDownload}
        loading={loading}
        setLoading={setLoading}
      />
    </Common>
  );
}
