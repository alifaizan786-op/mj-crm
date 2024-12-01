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
import UserFetch from '../../fetch/UserFetch';

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

export default function NewUser({
  open,
  setOpen,
  handleOpen,
  handleClose,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [formState, setFormState] = React.useState({
    firstName: '',
    lastName: '',
    employeeId: '',
    department: '',
    password: '',
    active: '',
    region: '',
    title: '',
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
      const createNewUser = await UserFetch.createUser(formState);
      enqueueSnackbar('User Created Successfully  ', {
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
      label: 'First Name',
      name: 'firstName',
      labelId: 'firstNameLabel',
      value: formState.firstName,
      onChange: handleChange,
      ...textFieldProps,
    },
    {
      inputType: 'text',
      selectitemsArr: [],
      label: 'Last Name',
      name: 'lastName',
      labelId: 'lastNameLabel',
      value: formState.lastName,
      onChange: handleChange,
      ...textFieldProps,
    },
    {
      inputType: 'text',
      selectitemsArr: [],
      label: 'Employee Id',
      name: 'employeeId',
      labelId: 'employeeIdLabel',
      value: formState.employeeId,
      onChange: handleChange,
      ...textFieldProps,
    },
    {
      inputType: 'text',
      selectitemsArr: [],
      label: 'Title/Postion',
      name: 'title',
      labelId: 'titleLabel',
      value: formState.title,
      onChange: handleChange,
      ...textFieldProps,
    },
    {
      inputType: 'select',
      selectitemsArr: [
        'Tagging',
        'Sales',
        'Exec',
        'Finance',
        'Photography',
      ],
      label: 'Department',
      name: 'department',
      labelId: 'departmentLabel',
      value: formState.department,
      onChange: handleChange,
      ...textFieldProps,
    },
    {
      inputType: 'text',
      selectitemsArr: [],
      label: 'Password',
      name: 'password',
      labelId: 'passwordLabel',
      value: formState.password,
      onChange: handleChange,
      ...textFieldProps,
    },
    {
      inputType: 'select',
      selectitemsArr: ['Georgia', 'Texas', 'Florida'],
      label: 'Region',
      name: 'region',
      labelId: 'regionLabel',
      value: formState.department,
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
              New User
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
                !formState.firstName ||
                !formState.lastName ||
                !formState.password ||
                !formState.title ||
                !formState.department ||
                !formState.employeeId ||
                !formState.region
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
