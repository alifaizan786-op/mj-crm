import { Box, Button, TextField } from '@mui/material';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import AllInfoCard from '../../components/AllInfoCard';
import Loader from '../../components/Loader';
import InvFetch from '../../fetch/InvFetch';
import WebsiteFetch from '../../fetch/WebsiteFetch';
import Common from '../../layouts/common';

export default function GetAllInfo() {
  const [data, setData] = React.useState({
    loading: false,
    data: [],
  });
  const [index, setIndex] = React.useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (value) {
        params.set(name, value); // Update the parameter
      } else {
        params.delete(name); // Remove the parameter if value is empty
      }
      return params;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setData({
      loading: true,
      data: [],
    });
  
    try {
      const getSkuDataFromJS = await InvFetch.reportBySku(
        searchParams.get('sku').split(' ')
      );
  
      const webFetchArr = getSkuDataFromJS
        .filter(
          (element) =>
            element.onlinePurchasable !== null ||
            element.onlineHidden !== null ||
            element.onlineStockQty !== null
        )
        .map((element) => element.sku_no);
  
      const getSkuDataFromWeb = webFetchArr.length
        ? await WebsiteFetch.getReportBySku(webFetchArr)
        : [];
  
      let masterDataArray = getSkuDataFromJS.map((element) => {
        const webObj = getSkuDataFromWeb.find(
          (item) => item.SKUCode === element.sku_no
        );
  
        return {
          VJS: {
            ...element,
          },
          WEB: webObj || {},  // Ensure WEB exists even if empty
        };
      });
  
      setData({
        loading: false,
        data: masterDataArray,
      });
    } catch (error) {
      console.log(error);
      setData({
        loading: false,
        data: [],
      });
    }
  };
  

  console.log(data);
  

  

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
          onChange={handleChange} // Call handleChange on input change
          value={searchParams.get('sku') || ''} // Set the input value from searchParams
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
      {data.data.length == 0 ? (
        "Enter Sku's and click submit"
      ) : data.loading ? (
        <Loader size={75} />
      ) : (
        <AllInfoCard
          index={index}
          setIndex={setIndex}
          data={data.data}
        />
      )}
    </Common>
  );
}
