import SearchIcon from '@mui/icons-material/Search';

import {
  Box,
  Divider,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import StoreData from '../../components/StoreData';
import InvFetch from '../../fetch/InvFetch';
import WebsiteFetch from '../../fetch/WebsiteFetch';
import Common from '../../layouts/common';
import FormatImage from '../../utils/FormatImage';

export default function CheckStatus() {
  document.title = 'BB | Merchandise | Check Status';

  const [searchParams, setSearchParams] = useSearchParams();

  const [skuData, setSkuData] = React.useState([]);
  const [skuDataWeb, setSkuDataWeb] = React.useState([]);

  const submitHandler = async (event) => {
    event.preventDefault();
    try {
      const jsData = await InvFetch.getOneSKUData(
        searchParams.get('SKUCode')
      );
      setSkuData(jsData);
      const webData = await WebsiteFetch.getOneSKUData(
        searchParams.get('SKUCode')
      );
      setSkuDataWeb(webData[0]);
    } catch (error) {
      console.log(error);
    }
  };

  console.log('skuData', skuData);
  console.log('skuDataWeb', skuDataWeb);

  return (
    <Common>
      <Box
        component='form'
        onSubmit={submitHandler}
        sx={{
          display: 'flex',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          width: '30%',
          margin: '0 auto',
        }}>
        <TextField
          id='standard-basic'
          label='SKU Code...'
          variant='standard'
          size='small'
          value={searchParams.get('SKUCode')}
          onChange={(event) => {
            setSearchParams({ SKUCode: event.target.value });
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton type='submit'>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <StoreData
        store={'Wholesale'}
        data={skuData.filter((item) => item.store_code == 'WS')[0]}
      />

      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'stretch',
        }}>
        <Box
          sx={{
            width: '75%',
          }}>
          <StoreData
            store={'Atlanta'}
            data={
              skuData.filter((item) => item.store_code == 'ATL')[0]
            }
          />
          <StoreData
            store={'Dallas'}
            data={
              skuData.filter((item) => item.store_code == 'DAL')[0]
            }
          />
          <StoreData
            store={'Tampa'}
            data={
              skuData.filter((item) => item.store_code == 'TPA')[0]
            }
          />
        </Box>
        <Box
          sx={{
            boxShadow: '3px 2px 10px #cbcbcb;',
            width: '23%',
            borderRadius: 5,
            // display: 'flex',
            // flexDirection: 'column',
            // justifyContent: 'space-evenly',
            // alignItems: 'center',
            padding: '1rem',
          }}>
          <Typography
            variant='h6'
            textAlign={'center'}
            sx={{
              width: '100%',
            }}>
            <Divider textAlign='center'>MalaniJewelers.com</Divider>
          </Typography>
          <TableContainer>
            <Table
              // Vendor	Minor	Style	Desc	Desc 2	Retail	Recvd Date	Qty	Picture	 	Thumb
              // sx={{ minWidth: 650 }}
              aria-label='simple table'>
              {skuDataWeb?.SKUCode && (
                <TableBody>
                  <TableRow>
                    <TableCell
                      align='center'
                      colSpan={2}>
                      <img
                        src={`https://www.malanijewelers.com/TransactionImages/Styles/Medium/${FormatImage(
                          skuDataWeb.SKUCode
                        )}.jpg`}
                        width={300}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align='left'>
                      <strong>Stock Qty</strong>
                    </TableCell>
                    <TableCell align='left'>
                      <strong>{skuDataWeb.StockQty}</strong>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align='left'>
                      <strong>Client Price</strong>
                    </TableCell>
                    <TableCell align='left'>
                      <strong>
                        $
                        {skuDataWeb.CustPrice.toLocaleString(
                          'en-US',
                          { minimumFractionDigits: 2 }
                        )}
                      </strong>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align='left'>
                      <strong>Per Gram Or Discount %</strong>
                    </TableCell>
                    <TableCell align='left'>
                      <strong>
                        {parseInt(skuDataWeb.ClassCode) > 299
                          ? `${Math.ceil(
                              100 -
                                (skuDataWeb.CustPrice /
                                  skuDataWeb.TagPrice) *
                                  100 *
                                  1
                            )}% Off Tag Price`
                          : skuDataWeb.PerGramOrDisc.toLocaleString(
                              'en-US',
                              { minimumFractionDigits: 2 }
                            )}
                      </strong>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell align='left'>
                      <strong>Purchasable</strong>
                    </TableCell>
                    <TableCell align='left'>
                      <strong>
                        {skuDataWeb.Purchasable ? 'Yes' : 'No'}
                      </strong>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align='left'>
                      <strong>Hidden</strong>
                    </TableCell>
                    <TableCell align='left'>
                      <strong>
                        {skuDataWeb.Hidden ? 'No' : 'Yes'}
                      </strong>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align='left'>
                      <strong>Style Upload Date</strong>
                    </TableCell>
                    <TableCell align='left'>
                      <strong>
                        {new Date(
                          skuDataWeb.StyleUploadDate
                        ).toLocaleDateString()}
                      </strong>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align='left'>
                      <strong>Auto Update Price</strong>
                    </TableCell>
                    <TableCell align='left'>
                      <strong>
                        {skuDataWeb.AutoUpdatePrice ? 'Yes' : 'No'}
                      </strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Common>
  );
}
