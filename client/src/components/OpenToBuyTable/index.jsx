'use client';
import React from 'react';

import { Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import InvFetch from '../../fetch/InvFetch';
import WebsiteFetch from '../../fetch/WebsiteFetch';
import Loader from '../Loader';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

export default function OpenToBuyTable({
  store,
  storeAbrev,
  getData,
  showBase,
}) {
  const [openToBuyData, setOpenToBuyData] = React.useState([]);

  React.useEffect(() => {
    async function fetchData() {
      if (store == 'MalaniJewelers.com') {
        const data = await WebsiteFetch.getOpenToBuyData();
        setOpenToBuyData(data[0]);
      } else {
        const data = await InvFetch.getOpenToBuyByStore(storeAbrev);
        setOpenToBuyData(data[0]);
      }
    }
    fetchData(openToBuyData);
  }, []);

  return (
    <TableContainer
      sx={{
        width: '17%',
        borderRadius: 2,
      }}>
      {openToBuyData?.majorCodes?.length > 0 ? (
        <Table
          stickyHeader
          aria-label='simple table'>
          <TableHead>
            <TableRow>
              <TableCell
                align='center'
                colSpan={showBase ? 3 : 2}>
                {store} ({openToBuyData.totalQty})
              </TableCell>
            </TableRow>
          </TableHead>
          <TableHead>
            <TableRow>
              <TableCell align='center'>Major Code</TableCell>
              {showBase && <TableCell align='center'>Base</TableCell>}
              <TableCell align='center'>Quantity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {openToBuyData.majorCodes.map((row, index) => (
              <StyledTableRow
                key={index}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                }}>
                <Link
                  href={`/Merchandise/Reports/OpenToBuy/${row.majorCode}?store=["${storeAbrev}"]`}
                  target='_blank'
                  rel='noopener noreferrer'>
                  <StyledTableCell align='center'>
                    {row.majorCode}
                  </StyledTableCell>
                </Link>

                {showBase && (
                  <StyledTableCell align='center'>
                    {row.baseColumn}
                  </StyledTableCell>
                )}
                <StyledTableCell align='center'>
                  {row.totalQty.totalQty}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Loader size='75' />
      )}
    </TableContainer>
  );
}
