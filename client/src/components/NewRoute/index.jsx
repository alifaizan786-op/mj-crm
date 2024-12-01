import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import UserRoutesFetch from '../../fetch/UserRoutesFetch';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 1000,
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 5,
};

export default function NewRoute({
  open,
  setOpen,
  handleOpen,
  handleClose,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [formState, setFormState] = React.useState({
    name: '',
    path: '',
    element: '',
    menuItem: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    try {
      const createNewRoute = await UserRoutesFetch.createUserRoute(
        formState
      );
      enqueueSnackbar('Routes Created Successfully  ', {
        variant: 'success',
      });
      handleClose();
    } catch (error) {
      enqueueSnackbar(error, {
        variant: 'error',
      });
    }
  };

  let textFieldProps = {
    variant: 'standard',
    size: 'normal',
    margin: 'normal',
  };

  const inputsArr = [
    {
      inputType: 'text',
      selectitemsArr: [],
      label: 'Name',
      name: 'name',
      labelId: 'nameLabel',
      value: formState.name,
      onChange: handleChange,
      ...textFieldProps,
    },
    {
      inputType: 'text',
      selectitemsArr: [],
      label: 'Path',
      name: 'path',
      labelId: 'pathLabel',
      value: formState.path,
      onChange: handleChange,
      ...textFieldProps,
    },
    {
      inputType: 'text',
      selectitemsArr: [],
      label: 'Element',
      name: 'element',
      labelId: 'elementLabel',
      value: formState.element,
      onChange: handleChange,
      ...textFieldProps,
    },
    {
      inputType: 'select',
      selectitemsArr: ['true', 'false'],
      label: 'Menu Item',
      name: 'menuItem',
      labelId: 'menuItemLabel',
      value: formState.menuItem,
      onChange: handleChange,
      ...textFieldProps,
    },
  ];

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'>
        <Box sx={style}>
          <Box
            sx={{
              width: '100%',
              bgcolor: 'primary.light',
              borderRadius: 5,
            }}>
            <Typography
              variant='h5'
              component='h2'
              textAlign='center'
              sx={{ p: 0.5, color: 'primary.main' }}>
              New Route
            </Typography>
          </Box>
          <Box
            sx={{ p: 4 }}
            component='form'
            onSubmit={handleSubmit}
            noValidate>
            {inputsArr.map((item, index) =>
              item.inputType === 'text' ? (
                <FormControl
                  fullWidth
                  key={index}
                  sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    name={item.name}
                    label={item.label} // Label applied directly for TextField
                    value={item.value}
                    onChange={item.onChange}
                    {...textFieldProps}
                  />
                </FormControl>
              ) : (
                <FormControl
                  fullWidth
                  key={index}
                  sx={{ mb: 2 }}>
                  <Autocomplete
                    options={item.selectitemsArr} // Dropdown options
                    clearOnEscape
                    value={formState[item.name]} // Bind value to formState dynamically
                    onChange={(event, newValue) =>
                      setFormState({
                        ...formState,
                        [item.name]: newValue, // Update state with selected value
                      })
                    }
                    disableClearable // Optional: Prevent clearing the value
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={item.label} // Floating label
                        variant={textFieldProps.variant} // Use variant from textFieldProps
                        margin={textFieldProps.margin} // Use margin from textFieldProps
                        fullWidth
                      />
                    )}
                  />
                </FormControl>
              )
            )}

            <Button
              type='submit'
              fullWidth
              disabled={
                !formState.name ||
                !formState.path ||
                !formState.element ||
                !formState.menuItem
              }
              variant='standard'
              sx={{ mt: 1, mb: 1, color: 'primary.main' }}>
              Create
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
