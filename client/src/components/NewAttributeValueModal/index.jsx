import {
  Box,
  Button,
  FormControl,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import AttributeFetch from '../../fetch/AttributeFetch';

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

export default function NewAttributeValueModal({
  open,
  handleClose,
  title,
  options,
  _id,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [formState, setFormState] = React.useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormState(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    try {
      const createNewAttributeValue =
        await AttributeFetch.updateAttributeById(_id, {
          title: title,
          options: [...options, formState],
        });
      enqueueSnackbar('Attribute Value Created Successfully  ', {
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
              {title}
            </Typography>
          </Box>
          <Box
            sx={{ p: 4 }}
            component='form'
            onSubmit={handleSubmit}
            noValidate>
            <FormControl
              fullWidth
              sx={{ mb: 2 }}>
              <TextField
                fullWidth
                name='Value'
                label='Value' // Label applied directly for TextField
                onChange={handleChange}
                value={formState}
                {...textFieldProps}
              />
            </FormControl>

            <Button
              type='submit'
              fullWidth
              disabled={!formState}
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
