import AddIcon from '@mui/icons-material/Add';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SaveIcon from '@mui/icons-material/Save';
import {
  Box,
  Checkbox,
  Fab,
  IconButton,
  Tooltip,
  Zoom,
} from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import { useSnackbar } from 'notistack';

import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import React from 'react';
import UserFetch from '../../fetch/UserFetch';
import UserRoutesFetch from '../../fetch/UserRoutesFetch';

export default function UserRightsForm({ userId, rights }) {
  const [allRights, setRights] = React.useState([]);

  React.useEffect(() => {
    async function fetchRoutes() {
      const AllRoutesFetch = await UserRoutesFetch.getAllUserRoutes();

      const AllRoutesArr = AllRoutesFetch.map((item) => ({
        page: item.path,
        hasAccess: true,
      }));
      let tempRightArr = [];
      for (let i = 0; i < AllRoutesArr.length; i++) {
        const element = AllRoutesArr[i];
        if (rights.includes(element.page)) {
          tempRightArr.push({
            page: element.page,
            hasAccess: true,
          });
        } else {
          tempRightArr.push({
            page: element.page,
            hasAccess: false,
          });
        }
      }
      setRights(tempRightArr);
    }

    fetchRoutes();
  }, []);
  const [open, setOpen] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [locked, setLocked] = React.useState(true);

  const handleChange = (index) => {
    setRights((prevRights) =>
      prevRights.map((right, i) =>
        i === index
          ? { ...right, hasAccess: !right.hasAccess }
          : right
      )
    );
  };

  const handleSave = async () => {
    const updatedUser = UserFetch.UpdateUserById(userId, {
      views: allRights
        .filter((item) => item.hasAccess == true)
        .map((item) => item.page),
    });
    enqueueSnackbar('User Rights Updated Successfully ', {
      variant: 'success',
    });
    setLocked(true);
    setOpen(false);
  };

  const toggleMenu = () => {
    setOpen(!open);
  };

  return (
    <>
      {open && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
            zIndex: 10, // Ensures it appears below the menu
            transition: 'opacity 0.3s ease',
          }}
          onClick={() => setOpen(false)} // Close menu on clicking overlay
        />
      )}
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 20, // Ensure it appears above the overlay
        }}>
        {/* Extended Menu */}
        <Zoom
          in={open}
          unmountOnExit>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              mb: 2,
              gap: 1,
            }}>
            <Tooltip
              title='Lock'
              placement='left'>
              <IconButton
                color='primary'
                onClick={() => {
                  setLocked(!locked);
                  setOpen(!open);
                }}
                sx={{
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  width: 56,
                  height: 56,
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                  '&:hover': { backgroundColor: '#f0f0f0' },
                }}>
                {locked ? (
                  <LockOutlinedIcon />
                ) : (
                  <LockOpenOutlinedIcon />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip
              title='Save'
              onClick={handleSave}
              placement='left'>
              <IconButton
                color='primary'
                sx={{
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  width: 56,
                  height: 56,
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                  '&:hover': { backgroundColor: '#f0f0f0' },
                }}>
                <SaveIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Zoom>

        {/* Main Floating Button */}
        <Fab
          color='primary'
          onClick={toggleMenu}
          sx={{
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
          }}>
          <AddIcon />
        </Fab>
      </Box>
      <TableContainer sx={{ maxHeight: { xs: 450, sm: 495 } }}>
        <Table
          stickyHeader
          size='small'>
          <TableHead>
            <TableRow>
              <TableCell align='center'>Page</TableCell>
              <TableCell align='center'>Has Access</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allRights.map((row, index) => (
              <TableRow
                key={row.page}
                size='small'>
                <TableCell
                  component='th'
                  scope='row'
                  size='small'>
                  {row.page}
                </TableCell>
                <TableCell
                  align='center'
                  size='small'>
                  <Checkbox
                    disabled={locked}
                    checked={row.hasAccess}
                    onChange={() => handleChange(index)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
