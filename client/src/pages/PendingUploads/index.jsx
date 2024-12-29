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
  Typography,
} from '@mui/material';
import React from 'react';
import Loader from '../../components/Loader';
import SizingFetch from '../../fetch/SizingFetch';
import Common from '../../layouts/common';

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
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

export default function PendingUploads() {
  const [data, setData] = React.useState({
    loading: true,
    data: [],
  });

  React.useEffect(() => {
    async function getData() {
      const data = await SizingFetch.pendingUpload();

      setData({ loading: false, data: data });
    }

    getData();
  }, []);

  return (
    <Common>
      {data.loading == true && <Loader size={75} />}
      {data.loading == false && data.data.length > 0 && (
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
            <Typography variant='h5'>
              Number Of Folder To Upload :{' '}
              <strong>{data.data ? data.data.length : 0}</strong>
            </Typography>
            <Typography variant='h5'>
              Number Of SKU To Upload :{' '}
              <strong>
                {data.data
                  ? data.data.reduce(
                      (total, item) => total + item.SKUCodes.length,
                      0
                    )
                  : 0}
              </strong>
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              marginY: '0.4rem',
            }}>
            <TableContainer sx={{ maxHeight: 800 }}>
              <Table
                stickyHeader
                size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell align='center'>
                      <strong>Folder Date</strong>
                    </TableCell>
                    <TableCell align='center'>
                      <strong>SKU Counts</strong>
                    </TableCell>
                    <TableCell align='center'>
                      <strong>Create Sheet</strong>
                    </TableCell>
                  </TableRow>
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
                          {row.Date}
                        </StyledTableCell>
                        <StyledTableCell align='center'>
                          {row.SKUCodes.length}
                        </StyledTableCell>
                        <StyledTableCell align='center'>
                          <Button
                            size='small'
                            onClick={() => {
                              window.open(
                                `/Merchandise/Utils/UploadingSheet?SKUCode=${row.SKUCodes?.join(
                                  '_'
                                )}`,
                                '_blank'
                              );
                            }}>
                            Create Sheet
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
