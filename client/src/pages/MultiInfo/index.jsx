import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Image from '../../components/Image';
import Loader from '../../components/Loader';
import MultiCodeInfoCard from '../../components/MultiCodeInfoCard';
import MultiFetch from '../../fetch/MultiFetch';
import WebsiteFetch from '../../fetch/WebsiteFetch';

import {
  Box,
  Button,
  FormControlLabel,
  FormGroup,
  styled,
  Switch,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import Common from '../../layouts/common';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

export default function MultiInfo() {
  const { MultiCode } = useParams();
  const [multiData, setMultiData] = React.useState({
    loading: true,
    data: [],
  });
  const [websiteData, setWebsiteData] = React.useState({
    loading: true,
    data: [],
  });
  const [open, setOpen] = React.useState(false);
  const [expand, setExpand] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  React.useEffect(() => {
    async function getData() {
      const getWebsiteData = await WebsiteFetch.getSkuByMulti(
        MultiCode
      );
      setWebsiteData({
        loading: false,
        data: getWebsiteData,
      });

      const getMultiData = await MultiFetch.getOneMulti(MultiCode);
      setMultiData({
        loading: false,
        data: {
          ...getMultiData,
          totalSku: websiteData.data.length,
          HiddenSku: websiteData.data.filter(
            (item) => item.Hidden === true
          ).length,
          AvailableSku: websiteData.data.filter(
            (item) => item.Purchasable === true
          ).length,
        },
      });
    }

    getData();
  }, []);

  React.useEffect(() => {
    async function updateMultiStats() {
      try {
        const updateMultiCode = await MultiFetch.updateMulti(
          MultiCode,
          {
            totalSku: websiteData.data.length,
            HiddenSku: websiteData.data.filter(
              (item) => item.Hidden === true
            ).length,
            AvailableSku: websiteData.data.filter(
              (item) => item.Purchasable === true
            ).length,
          }
        );
      } catch (error) {
        console.log(error);
      }
    }

    updateMultiStats();
  }, [websiteData.data]);

  function copyToClipboard(event) {
    navigator.clipboard.writeText(event.target.innerText);
  }

  return (
    <Common>
      {multiData.loading && <Loader size={75} />}
      {websiteData.loading == false && multiData.loading == false && (
        <Box
          sx={{
            marginTop: '1rem',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-evenly',
            alignContent: 'space-evenly',
            alignItems: 'center',
          }}>
          <Image
            imageName={multiData.data.image[0]}
            initialState='web'
            size='medium'
            boxSize={300}
          />

          <MultiCodeInfoCard
            multiCode={multiData.data.multiCode}
            totalSkus={websiteData.data.length}
            hiddenSku={
              websiteData.data.filter((item) => item.Hidden === true)
                .length
            }
            purchasableSku={
              websiteData.data.filter(
                (item) => item.Purchasable === true
              ).length
            }
          />
        </Box>
      )}
      {websiteData.loading && <Loader size={75} />}
      {websiteData.loading == false && multiData.loading == false && (
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'flex-start',
            flexDirection: 'column',
          }}>
          <FormGroup
            sx={{
              marginX: '5.5rem',
            }}>
            <FormControlLabel
              control={
                <Switch
                  checked={expand}
                  onChange={(event) =>
                    setExpand(event.target.checked)
                  }
                />
              }
              label='Expand'
            />
          </FormGroup>

          {expand === true ? (
            <Box
              sx={{
                display: 'flex',
                width: '100%',
                justifyContent: 'flex-start',
                alignItems: 'center',
                flexDirection: 'column',
                gap: '0.25rem',
                maxHeight: '30rem',
                overflowY: 'auto', // Enable vertical scrolling only
                overflowX: 'hidden', // Prevent horizontal scrolling
              }}>
              {websiteData.data.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    border: '1px solid black',
                    width: '90%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                    padding: '0.25rem',
                    opacity:
                      item.Hidden === true ||
                      item.Purchasable === false ||
                      item.StockQty === 0
                        ? '0.75'
                        : '1',
                  }}>
                  <Box
                    sx={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-evenly',
                      alignItems: 'center',
                      opacity:
                        item.Hidden === true ||
                        item.Purchasable === false ||
                        item.StockQty === 0
                          ? '0.5'
                          : '1',
                    }}>
                    <Box>
                      <Image
                        sku={item.SKUCode}
                        initialState='web'
                        size='medium'
                      />
                    </Box>
                    <Box>
                      <p>
                        SKU:{' '}
                        <strong onClick={copyToClipboard}>
                          {item.SKUCode}
                        </strong>
                      </p>
                      <p>
                        AutoUpdatePrice:{' '}
                        <strong>
                          {item.AutoUpdatePrice ? 'True' : 'False'}
                        </strong>
                      </p>
                      <p>
                        Hidden:{' '}
                        <strong>
                          {item.Hidden ? 'True' : 'False'}
                        </strong>
                      </p>
                      <p>
                        IsCloseOut:{' '}
                        <strong>
                          {item.IsCloseOut ? 'True' : 'False'}
                        </strong>
                      </p>
                      <p>
                        Purchasable:{' '}
                        <strong>
                          {item.Purchasable ? 'True' : 'False'}
                        </strong>
                      </p>
                    </Box>

                    <Box>
                      <p>
                        StockQty: <strong>{item.StockQty}</strong>
                      </p>
                      <p>
                        TagPrice: <strong>{item.TagPrice}</strong>
                      </p>
                      <p>
                        JewelryFor: <strong>{item.JewelryFor}</strong>
                      </p>
                      <p>
                        JewelryType:{' '}
                        <strong>{item.JewelryType}</strong>
                      </p>
                      <p>
                        DC: <strong>{item.DC}</strong>
                      </p>
                    </Box>
                    <Box>
                      <p>
                        RingSize: <strong>{item.RingSize}</strong>
                      </p>
                      <p>
                        BangleSize: <strong>{item.BangleSize}</strong>
                      </p>
                      <p>
                        Length: <strong>{item.Length}</strong>
                      </p>
                      <p>
                        StyleGrossWt:{' '}
                        <strong>{item.StyleGrossWt}</strong>
                      </p>
                      <p>
                        StyleDesc: <strong>{item.StyleDesc}</strong>
                      </p>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-evenly',
                      alignItems: 'center',
                      width: '100%',
                    }}>
                    <Link
                      to={`https://malanijewelers.com/Views/Product/ProductInfo?value=${item.SKUCode}`}
                      target='_blank'
                      rel='noopener noreferrer'>
                      <Button
                        size='small'
                        variant='standard'
                        sx={{
                          color: 'primary.main',
                        }}>
                        malanijewelers.com
                      </Button>
                    </Link>
                    <Link
                      to={`/Merchandise/Reports/GetAllInfo?sku=${item.SKUCode}`}
                      target='_blank'
                      rel='noopener noreferrer'>
                      <Button
                        size='small'
                        variant='standard'
                        sx={{
                          color: 'primary.main',
                        }}>
                        get all info
                      </Button>
                    </Link>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                width: '100%',
                justifyContent: 'flex-start',
                alignItems: 'center',
                flexDirection: 'column',
                gap: '0.25rem',
                overflowY: 'auto', // Enable vertical scrolling only
                overflowX: 'hidden', // Prevent horizontal scrolling
              }}>
              <TableContainer
                sx={{
                  maxHeight: '30rem',
                }}>
                <Table
                  stickyHeader
                  size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell align='center'>SKU</TableCell>
                      <TableCell align='center'>
                        AutoUpdatePrice
                      </TableCell>
                      <TableCell align='center'>Hidden</TableCell>
                      <TableCell align='center'>IsCloseOut</TableCell>
                      <TableCell align='center'>
                        Purchasable
                      </TableCell>
                      <TableCell align='center'>StockQty</TableCell>
                      <TableCell align='center'>
                        StyleGrossWt
                      </TableCell>
                      <TableCell align='center'>TagPrice</TableCell>
                      <TableCell align='center'>DC</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {websiteData.data.map((item, index) => (
                      <StyledTableRow
                        key={index}
                        sx={{
                          '&:last-child td, &:last-child th': {
                            border: 0,
                          },
                          opacity:
                            item.Hidden === true ||
                            item.Purchasable === false ||
                            item.StockQty === 0
                              ? '0.75'
                              : '1',
                        }}>
                        <StyledTableCell align='center'>
                          {item.SKUCode}
                        </StyledTableCell>
                        <StyledTableCell align='center'>
                          {item.AutoUpdatePrice ? 'True' : 'False'}
                        </StyledTableCell>
                        <StyledTableCell align='center'>
                          {item.Hidden ? 'True' : 'False'}
                        </StyledTableCell>
                        <StyledTableCell align='center'>
                          {item.IsCloseOut ? 'True' : 'False'}
                        </StyledTableCell>
                        <StyledTableCell align='center'>
                          {item.Purchasable ? 'True' : 'False'}
                        </StyledTableCell>
                        <StyledTableCell align='center'>
                          {item.StockQty}
                        </StyledTableCell>
                        <StyledTableCell align='center'>
                          {item.StyleGrossWt}
                        </StyledTableCell>
                        <StyledTableCell align='center'>
                          {item.TagPrice}
                        </StyledTableCell>
                        <StyledTableCell align='center'>
                          {item.DC}
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      )}
    </Common>
  );
}
