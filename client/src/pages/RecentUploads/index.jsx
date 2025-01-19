import {
  Box,
  Button,
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import React from 'react';
import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import WebsiteFetch from '../../fetch/WebsiteFetch';
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

export default function RecentUploads() {
  const [data, setData] = React.useState({
    loading: true,
    data: [],
  });

  React.useEffect(() => {
    async function getData() {
      const data = await WebsiteFetch.getUploadingReport();

      setData({ loading: false, data: data });
    }

    getData();
  }, []);

  return (
    <Common>
      {data.loading == true && <Loader size={75} />}
      {data.loading == false && data.data?.length > 0 && (
        <>
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-evenly',
              alignContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}>
            <Alert
              fetch={() => {
                return WebsiteFetch.getOutOfStockOnline();
              }}
              message={
                'Item are on the website that are not in Stock'
              }
            />
            <Alert
              fetch={() => {
                return WebsiteFetch.reportBuilder({
                  StockQty: [1],
                  Hidden: [1],
                });
              }}
              message={
                'Item are on the website that are not in Stock'
              }
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              marginY: '0.4rem',
            }}>
            <TableContainer sx={{ maxHeight: 833 }}>
              <Table
                stickyHeader
                size='small'>
                <TableHead>
                  <StyledTableRow>
                    <StyledTableCell align='center'>
                      <strong>Folder Date</strong>
                    </StyledTableCell>
                    <StyledTableCell align='center'>
                      <strong>SKU Live</strong>
                    </StyledTableCell>
                    <StyledTableCell align='center'>
                      <strong>SKU Hidden</strong>
                    </StyledTableCell>
                    <StyledTableCell align='center'>
                      <strong>Get All Info</strong>
                    </StyledTableCell>
                    <StyledTableCell align='center'>
                      <strong>MalaniJewelers.com</strong>
                    </StyledTableCell>
                  </StyledTableRow>
                </TableHead>
                <TableBody
                  sx={{
                    maxHeight: '90%',
                    overflow: 'auto',
                  }}>
                  {data.data?.length > 0 &&
                    data.data.map((row, index) => (
                      <StyledTableRow
                        key={index}
                        sx={{
                          '&:last-child td, &:last-child th': {
                            border: 0,
                          },
                        }}>
                        <StyledTableCell align='center'>
                          {row.SearchUploadDate}
                        </StyledTableCell>
                        <StyledTableCell align='center'>
                          {row.AvailableSKUCount}
                        </StyledTableCell>
                        <StyledTableCell align='center'>
                          {row.HiddenSKUCount}
                        </StyledTableCell>

                        <StyledTableCell align='center'>
                          <Button
                            size='small'
                            onClick={() => {
                              WebsiteFetch.getSkuBySearchUploadDate(
                                row.SearchUploadDate
                              ).then((data) => {
                                let dataArr = data.map(
                                  (item) => item.SKUCode
                                );
                                let link = `/Merchandise/Reports/GetAllInfo?sku=${dataArr?.join(
                                  '+'
                                )}`;

                                window.open(link, '_blank');
                              });
                            }}>
                            Proof Read
                          </Button>
                        </StyledTableCell>
                        <StyledTableCell align='center'>
                          <Button
                            size='small'
                            onClick={() => {
                              WebsiteFetch.getSkuBySearchUploadDate(
                                row.SearchUploadDate
                              ).then((data) => {
                                let dataArr = data.map(
                                  (item) => item.SKUCode
                                );
                                let link = `https://www.malanijewelers.com/Views/Product/ProductList?search=${row.SearchUploadDate}`;

                                window.open(link, '_blank');
                              });
                            }}>
                            MalaniJewelers.com
                          </Button>
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </>
      )}
    </Common>
  );
}
