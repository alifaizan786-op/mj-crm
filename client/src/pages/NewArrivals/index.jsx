import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import * as React from 'react';
import Loader from '../../components/Loader';
import InvFetch from '../../fetch/InvFetch';
import Common from '../../layouts/common';

export default function NewArrivals() {
  const [days, setDays] = React.useState('10 Days');
  const [reportBy, setReportBy] = React.useState('By Date');
  const [data, setData] = React.useState({
    loading: true,
    data: [],
  });
  document.title = 'BB | New Arrivals';

  React.useEffect(() => {
    async function fetchData() {
      setData({
        loading: true,
        data: [],
      });
      try {
        let newArrivalsData;

        if (reportBy == 'By Date') {
          newArrivalsData = await InvFetch.getNewArrivalsByDays(
            days.split(' ')[0]
          );
        }

        if (reportBy == 'By Vendor') {
          newArrivalsData = await InvFetch.getNewArrivalsByVendor(
            days.split(' ')[0]
          );
        }

        setData({
          loading: false,
          data: newArrivalsData.sort(
            (a, b) => new Date(b._id) - new Date(a._id)
          ),
        });
      } catch (error) {
        console.log(error);
      }
    }

    fetchData();
  }, [days, reportBy]);

  console.log(data);

  return (
    <Common>
      <FormGroup
        aria-label='position'
        row
        sx={{
          width: '100%',
          display: 'flex',
          alignContent: 'flex-start',
          justifyContent: 'space-evenly',
          alignItems: 'flex-start',
        }}>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignContent: 'flex-start',
            justifyContent: 'space-evenly',
            alignItems: 'flex-start',
          }}>
          {['By Date', 'By Vendor'].map((value) => (
            <FormControlLabel
              key={value}
              value={value.toString()}
              control={
                <Checkbox
                  checked={reportBy === value.toString()}
                  onClick={() => setReportBy(value.toString())}
                />
              }
              label={value.toString()}
              labelPlacement='end'
            />
          ))}
        </Box>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignContent: 'flex-start',
            justifyContent: 'space-evenly',
            alignItems: 'flex-start',
          }}>
          {[
            '10 Days',
            '15 Days',
            '30 Days',
            '45 Days',
            '60 Days',
            '75 Days',
            '90 Days',
          ].map((value) => (
            <FormControlLabel
              key={value}
              value={value.toString()}
              control={
                <Checkbox
                  checked={days === value.toString()}
                  onClick={() => setDays(value.toString())}
                />
              }
              label={value.toString()}
              labelPlacement='end'
            />
          ))}
        </Box>
      </FormGroup>
      {data.loading && <Loader size='75' />}
      {data.data?.length > 0 && (
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              {reportBy == 'By Date' && (
                <TableRow>
                  <TableCell align='center'>Entry Date</TableCell>
                  <TableCell align='center'>Available</TableCell>
                  <TableCell align='center'>In Transit</TableCell>
                  <TableCell align='center'>Sold Out</TableCell>
                  <TableCell align='center'>Total Entries</TableCell>
                  <TableCell align='center'>View Entries</TableCell>
                </TableRow>
              )}
              {reportBy == 'By Vendor' && (
                <TableRow>
                  <TableCell align='center'>Entry Date</TableCell>
                  <TableCell align='center'>Total Entries</TableCell>
                  <TableCell align='center'>View Entries</TableCell>
                </TableRow>
              )}
            </TableHead>

            <TableBody>
              {data.data.map((item) => (
                <TableRow key={item._id || item.ven_code}>
                  {reportBy == 'By Date' && (
                    <>
                      <TableCell align='center'>
                        {new Date(item._id).toLocaleDateString()}
                      </TableCell>

                      <TableCell align='center'>
                        {
                          item.skus.filter((item) =>
                            item.status.startsWith('available')
                          ).length
                        }
                      </TableCell>
                      <TableCell align='center'>
                        {
                          item.skus.filter((item) =>
                            item.status.startsWith('in-')
                          ).length
                        }
                      </TableCell>
                      <TableCell align='center'>
                        {
                          item.skus.filter((item) =>
                            item.status.startsWith('sold')
                          ).length
                        }
                      </TableCell>
                      <TableCell align='center'>
                        {item.totalSKUs}
                      </TableCell>
                      <TableCell align='center'>
                        <Button
                          onClick={() => {
                            window.open(
                              `/Merchandise/Reports/NewArrivals/date?date=${item._id}`,
                              '_blank'
                            );
                          }}
                          variant='standard'
                          size='small'>
                          View Entries
                        </Button>
                      </TableCell>
                    </>
                  )}
                  {reportBy == 'By Vendor' && (
                    <>
                      <TableCell align='center'>
                        {item.ven_code}
                      </TableCell>
                      <TableCell align='center'>
                        {item.sku_count}
                      </TableCell>
                      <TableCell align='center'>
                        <Button
                          onClick={() => {
                            window.open(
                              `/Merchandise/Reports/NewArrivals/vendor?vendor=${item.ven_code}`,
                              '_blank'
                            );
                          }}
                          variant='standard'
                          size='small'>
                          View Entries
                        </Button>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Common>
  );
}
