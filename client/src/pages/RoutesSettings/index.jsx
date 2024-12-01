import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { Box, Fab, IconButton, TableBody } from '@mui/material';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import NewRoute from '../../components/NewRoute';
import UserRoutesFetch from '../../fetch/UserRoutesFetch';
import CommonLayout from '../../layouts/common';

export default function RoutesSettings() {
  const [userRoutes, setUserRoutes] = React.useState([]);
  const [formState, setFormState] = React.useState({
    name: '',
    path: '',
    element: '',
    menuItem: '',
  });

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [edit, setEdit] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar();

  async function getRoutes() {
    const allUserRoutes = await UserRoutesFetch.getAllUserRoutes();
    const tempArr = [];
    for (let i = 0; i < allUserRoutes.length; i++) {
      const element = allUserRoutes[i];
      element.edit = false;
      tempArr.push(element);
    }
    setUserRoutes(allUserRoutes);
  }
  React.useEffect(() => {
    getRoutes();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    // Use `checked` for switches and `value` for text fields
    const newValue = type === 'checkbox' ? checked : value;

    // Update state
    setFormState((prevState) => ({
      ...prevState,
      [name]: newValue,
    }));
  };

  const handleEditButton = (_id) => {
    const updatedUserRoutes = userRoutes.map((route) => {
      if (route._id === _id) {
        setFormState(route);
        return { ...route, edit: true }; // Create a new object with the updated `edit` value
      }
      return route;
    });
    setEdit(true);
    setUserRoutes(updatedUserRoutes); // Update the state with the new array
  };

  const handleSaveButton = async () => {
    console.log('Form State:', formState);

    try {
      // Ensure the API call is awaited properly
      const newRoutes = await UserRoutesFetch.updateUserRoutesById(
        formState._id,
        {
          name: formState.name,
          path: formState.path,
          element: formState.element,
          menuItem: formState.menuItem,
        }
      );

      console.log('Updated Routes:', newRoutes);

      // Check if newRoutes is valid and all fields match

      enqueueSnackbar('Route Updated Successfully', {
        variant: 'success',
      });

      // Refresh the routes and reset the state
      await getRoutes();
      setFormState({
        name: '',
        path: '',
        element: '',
        menuItem: '',
      });
    } catch (error) {
      console.error('Error updating route:', error);
      enqueueSnackbar('An error occurred while updating the route', {
        variant: 'error',
      });
    }

    setEdit(false);
  };

  return (
    <CommonLayout>
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
        <Fab
          color='primary'
          onClick={handleOpen}
          // sx={{
          //   transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          //   transition: 'transform 0.3s ease',
          // }}
        >
          <AddIcon />
        </Fab>
      </Box>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ maxHeight: { xs: '92vh', sm: '92vh' } }}>
        <Table
          stickyHeader
          size='small'
          sx={{ minWidth: 700 }}
          aria-label='customized table'>
          <TableHead>
            <TableRow>
              <TableCell width={5}></TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Path</TableCell>
              <TableCell>Element</TableCell>
              <TableCell>Menu Item</TableCell>
              <TableCell width={5}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userRoutes?.length > 0 &&
              userRoutes.map((route, index) =>
                route.edit ? (
                  <TableRow key={route._id}>
                    <TableCell>
                      <IconButton onClick={handleSaveButton}>
                        <SaveOutlinedIcon size='small' />{' '}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <TextField
                        variant='standard'
                        name='name'
                        value={formState.name}
                        onChange={handleChange}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        variant='standard'
                        name='path'
                        value={formState.path}
                        onChange={handleChange}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        variant='standard'
                        name='element'
                        value={formState.element}
                        onChange={handleChange}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        name='menuItem'
                        checked={formState.menuItem}
                        onChange={handleChange}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton>
                        <DeleteOutlineIcon size='small' />{' '}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={route._id}>
                    <TableCell>
                      <IconButton
                        disabled={edit}
                        onClick={() => {
                          handleEditButton(route._id);
                        }}>
                        <ModeEditOutlineOutlinedIcon size='small' />{' '}
                      </IconButton>
                    </TableCell>
                    <TableCell>{route.name}</TableCell>
                    <TableCell>{route.path}</TableCell>
                    <TableCell>{route.element}</TableCell>
                    <TableCell>
                      <Switch
                        disabled
                        checked={route.menuItem}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton>
                        <DeleteOutlineIcon size='small' />{' '}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
              )}
          </TableBody>
        </Table>
      </TableContainer>
      <NewRoute
        open={open}
        setOpen={setOpen}
        handleOpen={handleOpen}
        handleClose={handleClose}
      />
    </CommonLayout>
  );
}
