import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import React from 'react';
import PricingPolicyFetch from '../../fetch/PricingPolicyFetch';
import WebInvFetch from '../../fetch/WebInvFetch';

import Common from '../../layouts/common';

export default function AutoPriceUpdate() {
  const [logsList, setLogsList] = React.useState([
    'priceRefresh_073125.txt',
    'priceRefresh_073025.txt',
    'priceRefresh_072925.txt',
    'priceRefresh_072825.txt',
    'priceRefresh_072725.txt',
    'priceRefresh_072625.txt',
    'priceRefresh_072525.txt',
    'priceRefresh_072425.txt',
    'priceRefresh_072325.txt',
    'priceRefresh_072225.txt',
    'priceRefresh_072125.txt',
    'priceRefresh_072025.txt',
    'priceRefresh_071925.txt',
    'priceRefresh_071825.txt',
    'priceRefresh_071725.txt',
    'priceRefresh_071625.txt',
    'priceRefresh_071525.txt',
    'priceRefresh_071425.txt',
    'priceRefresh_071325.txt',
    'priceRefresh_071225.txt',
    'priceRefresh_071125.txt',
    'priceRefresh_071025.txt',
    'priceRefresh_070925.txt',
    'priceRefresh_070825.txt',
    'priceRefresh_070725.txt',
    'priceRefresh_070625.txt',
    'priceRefresh_070525.txt',
    'priceRefresh_070425.txt',
    'priceRefresh_070325.txt',
    'priceRefresh_070225.txt',
    'priceRefresh_070125.txt',
  ]);
  const [message, setMessage] = React.useState('');

  const columns = 7;
  const rows = Math.ceil(logsList.length / columns);

  // Prepare a 2D array with vertical filling (column-wise first)
  const tableData = Array.from({ length: rows }, (_, rowIndex) =>
    Array.from({ length: columns }, (_, colIndex) => {
      const logIndex = colIndex * rows + rowIndex;
      return logsList[logIndex] || ''; // fill empty if no log
    })
  );

  React.useEffect(() => {
    getLogData();
  }, []);

  const getLogData = async () => {
    try {
      const data = await PricingPolicyFetch.getLogs();
      setLogsList(data.logs);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async () => {
    try {
      const data = await WebInvFetch.bulkAutoUpdatePricing();
      setMessage(data.message);
      getLogData();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Common>
      <Box
        sx={{
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-evenly',
        }}>
        <Box
          sx={{
            width: '100%',
            height: '40vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Button
            variant='outlined'
            size='large'
            onClick={handleSubmit}>
            Refresh Website Prices
          </Button>
          <p>{message}</p>
        </Box>
        <Box
          sx={{
            backgroundColor: '#f0f0f0',
            width: '100%',
            height: '44vh',
            overflow: 'auto',
          }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  colSpan={7}
                  align='center'>
                  Logs
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {row.map((log, colIndex) => (
                    <TableCell
                      key={colIndex}
                      align='center'>
                      <a
                        href={`/api/pricingpolicy/logs/${log}`}
                        target='_blank'
                        rel='noopener noreferrer'>
                        {log}
                      </a>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Common>
  );
}
