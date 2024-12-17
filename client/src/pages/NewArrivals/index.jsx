import {
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
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';
import InvFetch from '../../fetch/InvFetch';
import Common from '../../layouts/common';

export default function NewArrivals() {
  const navigate = useNavigate();
  const [days, setDays] = React.useState('30 Days');
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
        let newArrivalsData = await InvFetch.getNewArrivalsByDays(
          days.split(' ')[0]
        );

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
  }, [days]);

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
      </FormGroup>
      {data.loading && <Loader size='75' />}
      {data.data?.length > 0 && (
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell align='center'>Entry Date</TableCell>
                <TableCell align='center'>Available</TableCell>
                <TableCell align='center'>In Transit</TableCell>
                <TableCell align='center'>Sold Out</TableCell>
                <TableCell align='center'>Total Entries</TableCell>
                <TableCell align='center'>View Entries</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data.data.map((item) => (
                <TableRow key={item._id}>
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
                        navigate(
                          `/Merchandise/Reports/NewArrivals/${item._id}`
                        );
                      }}
                      variant='standard'
                      size='small'>
                      View Entries
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Common>
  );
}
