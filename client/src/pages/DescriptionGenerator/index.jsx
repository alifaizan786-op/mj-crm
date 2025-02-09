import { Box, Button, TextField } from '@mui/material';
import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from '@mui/x-data-grid';
import ProgressTimer from 'react-progress-timer';
import WebsiteFetch from '../../fetch/WebsiteFetch';
import Common from '../../layouts/common';

import LinearProgress from '@mui/material/LinearProgress';

import React from 'react';

export default function DescriptionGenerator() {
  const [skus, setSku] = React.useState([]);

  const [longDescData, setLongDescData] = React.useState([]);

  const [percentage, setPercentage] = React.useState(0);

  let columns = [
    {
      field: 'SKUCode',
      headerName: 'SKUCode',
      width: 125,
    },
    {
      field: 'desc',
      headerName: 'Long Description',
      width: 3000,
    },
  ];

  function CustomToolbar() {
    return (
      <GridToolbarContainer
        sx={{ justifyContent: 'space-between', padding: '0% 5%' }}>
        <GridToolbarColumnsButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport
          csvOptions={{
            allColumns: true,
            fileName: 'LongDesc.csv',
            // delimiter: ';',
            utf8WithBom: true,
          }}
        />
      </GridToolbarContainer>
    );
  }

  const rows = [...longDescData];

  const handleSubmit = async (event) => {
    event.preventDefault();
    const uniqueSkus = [...new Set(skus)]; // Deduplicate SKUs

    try {
      const response = await WebsiteFetch.generateLongDesc(
        uniqueSkus
      ); // Send batch request

      setLongDescData(response); // Single state update

      setPercentage(100); // Since batch processing completes in one go
    } catch (error) {
      console.error('Error processing SKUs:', error);
    }
  };

  return (
    <Common>
      <Box
        component='form'
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          width: '95%',
          justifyContent: 'space-evenly',
          paddingX: '1rem',
        }}>
        <TextField
          label='SKU...'
          name='sku'
          fullWidth
          variant='outlined'
          size='small'
          sx={{
            marginX: '1rem',
          }}
          onChange={(event) => {
            setSku(event.target.value.split(' '));
          }}
          value={skus.join(' ')}
          // Set the input value from searchParams
        />
        <Button
          type='submit'
          variant='outlined'
          size='small'
          sx={{
            marginX: '1rem',
          }}>
          Submit
        </Button>
      </Box>
      <Box>
        <p>
          {longDescData.length} done out of {skus.length}
        </p>
        <ProgressTimer
          percentage={percentage}
          initialText={"Please add some SKU's and Click Submit"}
          completedText={'File Ready to Download, Click on export'}
          decreaseTime={true}
          calculateByAverage={true}
        />
      </Box>
      <DataGrid
        rows={rows}
        columns={columns}
        components={{
          Toolbar: CustomToolbar,
          LoadingOverlay: LinearProgress,
        }}
        disableColumnMenu
        getRowId={(row) => row.SKUCode}
      />
    </Common>
  );
}
