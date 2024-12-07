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
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Image from '../../components/Image';
import StoreData from '../../components/StoreData';
import InvFetch from '../../fetch/InvFetch';
import WebsiteFetch from '../../fetch/WebsiteFetch';
import Common from '../../layouts/common';
import formatDate from '../../utils/FormatDate';
import USDollar from '../../utils/USDollar';

export default function CheckStatus() {
  document.title = 'BB | Merchandise | Check Status';

  const [searchParams, setSearchParams] = useSearchParams();
  const [imgsrc, setImgSrc] = React.useState('js');

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
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          alignItems: 'stretch',
        }}>
        {/* Whole Sale Data Card */}
        <Box
          sx={{
            boxShadow: '3px 2px 10px #cbcbcb;',
            borderRadius: 5,
            padding: '1rem',
            marginY: '1rem',
            width: '60%',
          }}>
          <StoreData
            store={'Wholesale'}
            data={
              skuData.filter((item) => item.store_code == 'WS')[0]
            }
          />
        </Box>
        {/* Image Card */}
        <Box
          sx={{
            boxShadow: '3px 2px 10px #cbcbcb;',
            borderRadius: 5,
            padding: '1rem',
            marginY: '1rem',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            width: '30%',
          }}>
          <Image sku={skuData[0]?.sku_no} />
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          alignItems: 'stretch',
        }}>
        {/* All Store Data Card */}
        <Box
          sx={{
            boxShadow: '3px 2px 10px #cbcbcb;',
            borderRadius: 5,
            padding: '1rem',
            marginY: '1rem',
            width: '60%',
          }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align='left'></TableCell>
                  <TableCell align='left'>SKU Code</TableCell>
                  <TableCell align='left'>Desc</TableCell>
                  <TableCell align='left'>Desc 2</TableCell>
                  <TableCell align='left'>Tag Price</TableCell>
                  <TableCell align='left'>Entry Date</TableCell>
                  <TableCell align='left'>QTY</TableCell>
                  <TableCell align='left'>Status</TableCell>
                </TableRow>
              </TableHead>
              {['ATL', 'TPA', 'DAL'].map(
                (store, index) =>
                  skuData.filter((item) => item.store_code == store)
                    .length > 0 && (
                    <TableBody key={index}>
                      <TableRow>
                        <TableCell align='left'>
                          <strong>{store}</strong>
                        </TableCell>
                        <TableCell align='left'>
                          <strong>
                            {
                              skuData.filter(
                                (item) => item.store_code == store
                              )[0].sku_no
                            }
                          </strong>
                        </TableCell>

                        <TableCell align='left'>
                          <strong>
                            {
                              skuData.filter(
                                (item) => item.store_code == store
                              )[0].desc
                            }
                          </strong>
                        </TableCell>
                        <TableCell align='left'>
                          <strong>
                            {
                              skuData.filter(
                                (item) => item.store_code == store
                              )[0].desc2
                            }
                          </strong>
                        </TableCell>
                        <TableCell align='left'>
                          <strong>
                            {USDollar.format(
                              parseInt(
                                skuData.filter(
                                  (item) => item.store_code == store
                                )[0].retail
                              )
                            )}
                          </strong>
                        </TableCell>
                        <TableCell align='left'>
                          <strong>
                            {formatDate(
                              skuData.filter(
                                (item) => item.store_code == store
                              )[0].date
                            )}
                          </strong>
                        </TableCell>
                        <TableCell align='left'>
                          <strong>
                            {
                              skuData.filter(
                                (item) => item.store_code == store
                              )[0].loc_qty1
                            }
                          </strong>
                        </TableCell>
                        <TableCell align='left'>
                          <strong>
                            {
                              skuData.filter(
                                (item) => item.store_code == store
                              )[0].status
                            }
                          </strong>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  )
              )}
            </Table>
          </TableContainer>
        </Box>
        {/* Web Data Card */}
        <Box
          sx={{
            width: '30%',
            boxShadow: '3px 2px 10px #cbcbcb',
            borderRadius: 5,
            padding: '1rem',
            marginY: '1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
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
