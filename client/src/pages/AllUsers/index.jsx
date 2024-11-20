import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import { Box, Button, Checkbox, Divider } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import * as React from 'react';
import UserFetch from '../../fetch/UserFetch';
import CommonLayout from '../../layouts/common';
import properCase from '../../utils/ProperCase';

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, 16.0, 24, 6.0),
  createData('Cupcake', 305, 3.7, 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9),
];

export default function AllUsers() {
  const [allUsers, setAllUsers] = React.useState([]);

  React.useEffect(() => {
    async function getAllUserHandler() {
      let tempAllUsers = await UserFetch.getAllUsers();
      setAllUsers(tempAllUsers);
    }

    getAllUserHandler();
  }, []);

  console.log(allUsers);

  return (
    <CommonLayout>
      <Box
        sx={{
          height: '3rem',
          width: '100vw',
          display: { xs: 'none', sm: 'flex' },
          flexDirection: 'column',
          flexWrap: 'wrap',
          alignContent: 'space-around',
          justifyContent: 'center',
        }}>
        <Button
          variant='outlined'
          size='small'
          startIcon={<AddCircleOutlineIcon />}>
          New User
        </Button>
        <Button
          variant='outlined'
          size='small'
          startIcon={<ArrowCircleDownIcon />}>
          Export All Users
        </Button>
      </Box>
      <Divider />
      <TableContainer
        component={Paper}
        elevation={0}>
        <Table
          sx={{ minWidth: 700 }}
          aria-label='customized table'>
          <TableHead>
            <TableRow>
              <TableCell align='left'></TableCell>
              <TableCell>Name</TableCell>
              <TableCell align='left'>Department</TableCell>
              <TableCell align='left'>Active</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allUsers.map((row) => (
              <TableRow key={row._id}>
                <TableCell align='center'>
                  <IconButton
                    onClick={() => {
                      window.location.assign(`/User/${row._id}`);
                    }}>
                    <ModeEditOutlineOutlinedIcon />
                  </IconButton>
                </TableCell>
                <TableCell align='left'>
                  {properCase(row.lastName)},{' '}
                  {properCase(row.firstName)}
                </TableCell>
                <TableCell align='left'>
                  {properCase(row.department)}
                </TableCell>
                <TableCell align='left'>
                  <Checkbox
                    disabled
                    checked={row.active}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </CommonLayout>
  );
}
