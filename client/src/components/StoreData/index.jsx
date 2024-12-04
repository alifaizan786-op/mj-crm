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
import FormatImage from '../../utils/FormatImage';
import USDollar from '../../utils/USDollar';

export default function StoreData(props) {
  return (
    <>
      <Box>
        <Box
          sx={{
            boxShadow: '3px 2px 10px #cbcbcb;',
            minHeight: '13rem',
            borderRadius: 5,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            padding: '1rem',
            marginY: '1rem',
          }}>
          <Typography
            variant='h6'
            textAlign={'center'}
            sx={{
              width: '100%',
            }}>
            <Divider textAlign="center">{props.store}</Divider>
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
                    {props.store == 'Wholesale' && (
                      <TableCell align='center'>Picture</TableCell>
                    )}
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
                    {props.store == 'Wholesale' && (
                      <TableCell align='center'>
                        <a
                          href={`https://mjplusweb.com/Images/JS/${FormatImage(
                            props.data.sku_no
                          )}.jpg`}
                          target='_blank'
                          rel='noopener noreferrer'>
                          <img
                            src={`https://mjplusweb.com/Images/JS/${FormatImage(
                              props.data.sku_no
                            )}.jpg`}
                            width={300}
                          />
                        </a>
                      </TableCell>
                    )}
                  </TableRow>
                </TableBody>
                {/* )} */}
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
    </>
  );
}
