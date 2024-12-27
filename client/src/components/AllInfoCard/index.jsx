import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import React from 'react';
import Image from '../../components/Image';
import USDollar from '../../utils/USDollar';

export default function AllInfoCard({ index, setIndex, data }) {
  const handleKeyDown = (event) => {
    switch (event.code) {
      case 'ArrowUp':
      case 'ArrowRight':
      case 'ArrowRight':
        index < data.length - 1 ? setIndex(index + 1) : setIndex(0);
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowLeft':
        index === 0 ? setIndex(data.length - 1) : setIndex(index - 1);
        break;
      default:
        break;
    }
  };

  const handleWheel = (event) => {
    console.log(event.deltaY);
    if (event.deltaY > 0) {
      // Scroll down
      index === 0 ? setIndex(data.length - 1) : setIndex(index - 1);
    } else if (event.deltaY < 0) {
      // Scroll up
      index < data.length - 1 ? setIndex(index + 1) : setIndex(0);
    }
  };

  React.useEffect(() => {
    document.body.addEventListener('wheel', handleWheel);
    return () => {
      document.body.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);
  return (
    <Box
      sx={{
        width: '100%',
        marginY: '1rem',
        display: 'flex',
        justifyContent: 'space-evenly',
        minHeight: '50%',
      }}>
      <Box
        sx={{
          width: '100%',
          marginY: '1rem',
          display: 'flex',
          justifyContent: 'space-evenly',
          minHeight: '50%',
        }}>
        <Box
          sx={{
            width: '30%',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}>
          <Image
            sku={data[index].WEB.SKUCode}
            boxSize={450}
            initialState={'js'}
            showArrow={false}
          />
        </Box>
        <Box
          sx={{
            width: '30%',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}>
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell align='center'>
                    <strong>Shop Keeper</strong>{' '}
                  </TableCell>
                  <TableCell align='center'>
                    <strong>MalaniJewelers.com</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <strong>SKU</strong>
                  </TableCell>
                  <TableCell align='center'>
                    {data[index].VJS.sku_no}
                  </TableCell>
                  <TableCell align='center'>
                    {data[index].WEB.SKUCode}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Description</strong>
                  </TableCell>
                  <TableCell align='center'>
                    {data[index].VJS.desc}
                  </TableCell>
                  <TableCell align='center'>
                    {data[index].WEB.StyleDesc}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Total Weight</strong>
                  </TableCell>
                  <TableCell align='center'>
                    {data[index].VJS.weight}
                  </TableCell>
                  <TableCell align='center'>
                    {data[index].WEB.StyleGrossWt}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Vendor</strong>
                  </TableCell>
                  <TableCell align='center'>
                    {data[index].VJS.ven_code}
                  </TableCell>
                  <TableCell align='center'>
                    {data[index].WEB.Vendor}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Vendor Style</strong>
                  </TableCell>
                  <TableCell align='center'>
                    {data[index].VJS.vndr_style}
                  </TableCell>
                  <TableCell align='center'>
                    {data[index].WEB.VendStyleCode}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Tag Price</strong>
                  </TableCell>
                  <TableCell align='center'>
                    {USDollar.format(data[index].VJS.retail)}
                  </TableCell>
                  <TableCell align='center'>
                    {USDollar.format(data[index].WEB.TagPrice)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Classcode</strong>
                  </TableCell>
                  <TableCell align='center'>
                    {data[index].VJS.class_12}
                  </TableCell>
                  <TableCell align='center'>
                    {data[index].WEB.ClassCode}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Status</strong>
                  </TableCell>
                  <TableCell align='center'>
                    {data[index].VJS.status}
                  </TableCell>
                  <TableCell align='center'>
                    {data[index].WEB.Hidden == false &&
                    data[index].WEB.Purchasable == true &&
                    data[index].WEB.StockQty == 1
                      ? 'Live / On Show'
                      : 'Not Live / Not On Show'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Box
          sx={{
            width: '30%',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}>
          <Image
            sku={data[index].WEB.SKUCode}
            boxSize={400}
            initialState={'web'}
            showArrow={false}
          />
        </Box>
      </Box>
    </Box>
  );
}
