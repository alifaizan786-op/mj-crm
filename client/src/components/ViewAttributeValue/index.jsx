import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Box,
  Button,
  IconButton,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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

export default function ViewAttributeValue({
  open,
  setOpen,
  handleOpen,
  handleClose,
  title,
  options,
  _id,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [formState, setFormState] = React.useState({
    title: title,
    options: options,
  });
  const [confirmation, setConfirmation] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    try {
      const createNewAttributeValue =
        await AttributeFetch.updateAttributeById(_id, formState);
      enqueueSnackbar('Attribute Value Deleted Successfully  ', {
        variant: 'success',
      });
      handleClose();
    } catch (error) {
      enqueueSnackbar(error, {
        variant: 'error',
      });
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}>
        <Box sx={style}>
          <Modal
            open={confirmation}
            onClose={() => {
              setConfirmation(false);
            }}>
            <Box sx={style}>
              <Box
                sx={{
                  padding: '1rem',
                  margin: '1rem',
                }}>
                <Typography
                  variant='h6'
                  component='h5'
                  textAlign='center'
                  sx={{ p: 0.5, color: 'primary.main' }}>
                  Are you sure you want to make these changes to the
                  value for {title} ?
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-evenly',
                    margin: '1rem',
                    padding: '1rem',
                  }}>
                  <Button
                    variant='outlined'
                    onClick={handleSubmit}>
                    Yes
                  </Button>
                  <Button
                    variant='outlined'
                    onClick={() => {
                      setConfirmation(false);
                      setFormState({
                        title: title,
                        options: options,
                      });
                      handleClose();
                    }}>
                    No
                  </Button>
                </Box>
              </Box>
            </Box>
          </Modal>
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
          <TableContainer elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align='center'>
                    Attribute Value
                  </TableCell>
                  <TableCell align='center'>Delete</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formState.options.length > 0 &&
                  formState.options.map((item, index) => (
                    <TableRow key={item}>
                      <TableCell align='center'>{item}</TableCell>
                      <TableCell align='center'>
                        <IconButton
                          onClick={() => {
                            setFormState((prevState) => ({
                              ...prevState,
                              options: prevState.options.filter(
                                (_, i) => i !== index
                              ),
                            }));
                          }}>
                          <DeleteOutlineIcon color='error' />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              display: 'flex',
            }}>
            <Button
              fullWidth
              variant='standard'
              onClick={() => setConfirmation(true)}
              sx={{ mt: 1, mb: 1, color: 'primary.main' }}>
              Save
            </Button>
            <Button
              fullWidth
              variant='standard'
              sx={{ mt: 1, mb: 1, color: 'primary.main' }}
              onClick={handleClose}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
