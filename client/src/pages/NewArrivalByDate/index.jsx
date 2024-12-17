import CircleIcon from '@mui/icons-material/Circle';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Box, IconButton } from '@mui/material';
import React from 'react';
import { useParams } from 'react-router-dom';
import Filters from '../../components/Filters';
import Image from '../../components/Image';
import Loader from '../../components/Loader';
import InvFetch from '../../fetch/InvFetch';
import Common from '../../layouts/common';
import USDollar from '../../utils/USDollar';

export default function NewArrivalByDate() {
  const { date } = useParams();
  const [data, setData] = React.useState({
    loading: true,
    data: [],
  });
  const [selection, setSelection] = React.useState([]);

  React.useEffect(() => {
    async function getData() {
      const newarrivalsData = await InvFetch.getNewArrivalsByDate(
        date
      );
      setData({
        loading: false,
        data: newarrivalsData,
      });
    }
    getData();
  }, []);

  return (
    <Common>
      {data.loading && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}>
          <Loader />
        </Box>
      )}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          flexWrap: 'wrap',
          width: '100%',
        }}>
        <Box
          sx={{
            boxShadow: '3px 2px 10px #cbcbcb',
            margin: '0.5rem',
            padding: '1rem',
            width: '350px',
            height: '350px',
            borderRadius: 5,
            display: 'flex',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            flexDirection: 'column',
          }}>
          <Box
            sx={{
              width: '70%',
              display: 'flex',
              justifyContent: 'space-evenly',
              alignItems: 'center',
              margin: 1,
            }}>
            <CircleIcon
              fontSize='small'
              color={'success'}
            />{' '}
            SKU IS ONLINE
          </Box>
          <Box
            sx={{
              width: '70%',
              display: 'flex',
              justifyContent: 'space-evenly',
              alignItems: 'center',
              margin: 1,
            }}>
            <CircleIcon
              fontSize='small'
              color={'error'}
            />{' '}
            SKU IS NOT ONLINE
          </Box>
          <Filters
            data={data.data}
            selection={selection}
            orientation={'column'}
          />
        </Box>
        {data.data?.length > 0 &&
          data.data.map((item) => (
            <Box
              key={item.sku_no}
              sx={{
                boxShadow: '1px 1px 0px #cbcbcb',
                margin: '0.5rem',
                padding: '1rem',
                width: '350px',
                height: '350px',
                borderRadius: 5,
                display: 'flex',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                flexDirection: 'column',
              }}>
              <Box
                sx={{
                  display: 'flex',
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <CircleIcon
                  fontSize='small'
                  color={
                    item.onlineStockQty == 1 &&
                    item.onlinePurchasable == 1 &&
                    item.onlineHidden == 0
                      ? 'success'
                      : 'error'
                  }
                />
                <IconButton
                  onClick={() => {
                    setSelection([...selection, item]);
                  }}>
                  <FavoriteIcon
                    color={
                      selection.filter(
                        (sku) => sku.sku_no === item.sku_no
                      ).length > 0
                        ? 'error'
                        : ''
                    }
                  />
                </IconButton>
              </Box>
              <Image
                sku={item.sku_no}
                size='small'
              />
              <strong>
                {item.sku_no} | {USDollar.format(item.retail)} |{' '}
                {item.ven_code}
              </strong>
              <strong>{item.desc}</strong>
              <strong>
                {item.store_code} |{' '}
                {new Date(item.date).toLocaleDateString()}
              </strong>
            </Box>
          ))}
      </Box>
    </Common>
  );
}
