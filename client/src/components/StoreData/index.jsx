'use client';
import {
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import formatDate from '../../utils/FormatDate';
import USDollar from '../../utils/USDollar';

export default function StoreData(props) {
  return (
    <Box>
      <Typography
        variant='h6'
        textAlign={'center'}
        sx={{
          width: '100%',
        }}>
        <Divider textAlign='center'>{props.store}</Divider>
      </Typography>

      {props.data && (
        <TableContainer>
          <Table
            // Vendor	Minor	Style	Desc	Desc 2	Retail	Recvd Date	Qty	Picture	 	Thumb
            // sx={{ minWidth: 650 }}
            aria-label='simple table'>
            <TableHead>
              <TableRow>
                <TableCell align='left'>SKU Code</TableCell>
                <TableCell align='left'>Vendor</TableCell>
                <TableCell align='left'>Minor Code</TableCell>
                <TableCell align='left'>Vendor Style</TableCell>
                <TableCell align='left'>Desc</TableCell>
                <TableCell align='left'>Desc 2</TableCell>
                <TableCell align='left'>Tag Price</TableCell>
                <TableCell align='left'>Entry Date</TableCell>
                <TableCell align='left'>QTY</TableCell>
              </TableRow>
            </TableHead>
            {/* {goldPriceData.prices && ( */}

            <TableBody>
              <TableRow
                sx={{
                  '&:last-child td, &:last-child th': {
                    border: 0,
                  },
                }}>
                <TableCell align='left'>
                  <strong>{props.data.sku_no}</strong>
                </TableCell>
                <TableCell align='left'>
                  <strong>{props.data.ven_code}</strong>
                </TableCell>
                <TableCell align='left'>
                  <strong>{props.data.class_34}</strong>
                </TableCell>
                <TableCell align='left'>
                  <strong>{props.data.vndr_style}</strong>
                </TableCell>
                <TableCell align='left'>
                  <strong>{props.data.desc}</strong>
                </TableCell>
                <TableCell align='left'>
                  <strong>{props.data.desc2}</strong>
                </TableCell>
                <TableCell align='left'>
                  <strong>
                    {USDollar.format(parseInt(props.data.retail))}
                  </strong>
                </TableCell>
                <TableCell align='left'>
                  <strong>{formatDate(props.data.date)}</strong>
                </TableCell>
                <TableCell align='left'>
                  <strong>{props.data.loc_qty1}</strong>
                </TableCell>
              </TableRow>
            </TableBody>
            {/* )} */}
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
