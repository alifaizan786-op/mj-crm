import { Box, Button, TextField } from '@mui/material';
import Common from '../../layouts/common';

import React from 'react';

import { useSearchParams } from 'react-router-dom';

import UploadingDataGrid from '../../components/UploadingDataGrid';
import InvFetch from '../../fetch/InvFetch';
import SizingFetch from '../../fetch/SizingFetch';

export default function UploadingSheet() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [uploadingData, setUploadingData] = React.useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({ SKUCode: value.split(' ').join('_') });
  };

  const handleClick = async (event) => {
    event.preventDefault();
    const Sku = searchParams.get('SKUCode').split('_');
    // Get VJS Data
    const vjsData = await InvFetch.getUploadingData(Sku);
    // Get Sizing Sheet Data
    const sizingData = await SizingFetch.getUploadingData(Sku);
    // Merge Both Arrays
    const mergedArray = sizingData
      .map((sizingObj, index) => {
        const vjsObj = vjsData.inStock.find(
          (item) => item.sku_no === sizingObj.SKUCode
        );

        if (vjsObj) {
          return {
            ...sizingObj,
            ...vjsObj,
            SrNo: index + 1,
            Category: '',
            SubCategory: '',
          };
        }

        return undefined; // Return undefined if no match
      })
      .filter((item) => item !== undefined); // Remove undefined items

    setUploadingData(mergedArray);
  };

  return (
    <Common>
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          justifyContent: 'space-evenly',
          alignContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}>
        <Box
          component={'form'}
          onSubmit={handleClick}
          sx={{
            display: 'flex',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            width: '90%',
            gap: '10px',
          }}>
          <TextField
            id='filled-basic'
            label='SKU Code ...'
            size='small'
            fullWidth
            autoFocus
            value={
              searchParams.get('SKUCode') &&
              searchParams.get('SKUCode').split('_').join(' ')
            }
            onChange={handleChange}
          />
          <Button
            size='small'
            variant='outlined'
            onClick={handleClick}>
            Submit
          </Button>
        </Box>
      </Box>
      <UploadingDataGrid
        uploadingData={uploadingData}
        setUploadingData={setUploadingData}
      />
    </Common>
  );
}
