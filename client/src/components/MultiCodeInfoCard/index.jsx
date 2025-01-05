'use client';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Modal from '@mui/material/Modal';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import React from 'react';
import MultiFetch from '../../fetch/MultiFetch';
import BulkImageRename from '../BulkImageRename';
// import { deleteMultiCode, updateMultiCode } from '../../utils/get';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 5,
  boxShadow: 24,
  p: 4,
};

export default function MultiCodeInfoCard({
  multiCode,
  totalSkus,
  hiddenSku,
  purchasableSku,
  updateHandleEditClick,
}) {
  const [open, setOpen] = React.useState({
    edit: false,
    delete: false,
    rename: false,
  });

  const [renameSku, setRenameSku] = React.useState([]);
  const [submit, setSubmit] = React.useState(false);

  const [multiCodeInfo, setMultiCodeInfo] = React.useState({
    multiCode: multiCode,
  });

  const handleStartProcessing = () => {
    setSubmit(true);
    setTimeout(() => setSubmit(false), 100); // Reset `submit` after triggering
  };

  const handleEditSubmit = async () => {
    const updatedMultiCode = await MultiFetch.updateMulti(
      multiCodeInfo.multiCode,
      { image: multiCodeInfo.image }
    );
    window.location.reload();
  };

  return (
    <>
      <TableContainer
        sx={{ width: '40%' }}
        component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell colSpan={2}>
                <Typography
                  variant='overline'
                  display='block'
                  gutterBottom>
                  Multi Code:
                </Typography>

                <Typography
                  variant='h3'
                  gutterBottom>
                  {multiCode}
                </Typography>
              </TableCell>
              <TableCell>
                <Stack
                  direction='column'
                  spacing={1}>
                  {totalSkus === 0 ? (
                    <Button
                      variant='outlined'
                      startIcon={<DeleteOutlineOutlinedIcon />}
                      size='medium'
                      color='error'
                      onClick={() => {
                        setOpen({
                          delete: true,
                          rename: false,
                          edit: false,
                        });
                      }}>
                      Delete
                    </Button>
                  ) : (
                    <Button
                      variant='outlined'
                      startIcon={<SystemUpdateAltIcon />}
                      size='medium'
                      onClick={() => {
                        updateHandleEditClick();
                      }}>
                      Update Info
                    </Button>
                  )}

                  <Button
                    variant='outlined'
                    startIcon={<EditOutlinedIcon />}
                    size='medium'
                    color='success'
                    onClick={() => {
                      setOpen({
                        delete: false,
                        rename: false,
                        edit: true,
                      });
                    }}>
                    Edit
                  </Button>
                  <Button
                    variant='outlined'
                    startIcon={<ContentCopyOutlinedIcon />}
                    size='medium'
                    onClick={() => {
                      setOpen({
                        delete: false,
                        rename: true,
                        edit: false,
                      });
                    }}>
                    Rename Images
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography
                  variant='h3'
                  gutterBottom>
                  {totalSkus}
                </Typography>
                <Typography
                  variant='overline'
                  display='block'
                  gutterBottom>
                  TTL No. Of SKU's
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant='h3'
                  gutterBottom>
                  {hiddenSku}
                </Typography>
                <Typography
                  variant='overline'
                  display='block'
                  gutterBottom>
                  No. Of Hidden SKU's
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant='h3'
                  gutterBottom>
                  {purchasableSku}
                </Typography>
                <Typography
                  variant='overline'
                  display='block'
                  gutterBottom>
                  No. Of Purchasable SKU's:
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
        </Table>
      </TableContainer>

      {/* Edit Modal */}
      <Modal
        open={open.edit}
        onClose={() => {
          setOpen({
            ...open,
            edit: false,
          });
        }}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: 5,
            boxShadow: 24,
            p: 4,
            minHeight: '20%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly',
          }}>
          <Typography
            variant='h6'
            component='h2'>
            Edit
          </Typography>
          <Divider />
          <TextField
            disabled
            size='small'
            label='Multi Code'
            variant='outlined'
            value={multiCodeInfo.multiCode}
          />
          <TextField
            size='small'
            label='Image Name'
            variant='outlined'
            onChange={(event) => {
              setMultiCodeInfo({
                ...multiCodeInfo,
                image: [event.target.value],
              });
            }}
          />
          <Button
            variant='outlined'
            size='small'
            onClick={handleEditSubmit}
            color='success'>
            Yes, I'm Sure
          </Button>
        </Box>
      </Modal>

      <Modal
        open={open.delete}
        onClose={() => {
          setOpen({
            ...open,
            delete: false,
          });
        }}>
        <Box sx={style}>
          <Typography
            variant='h6'
            component='h2'>
            Are You Sure You Want To Delete This Multi Code ?
          </Typography>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-evenly',
              alignContent: 'space-evenly',
              marginTop: '1rem',
            }}>
            <Button
              variant='outlined'
              size='medium'
              color='error'
              onClick={async () => {
                const deleteMulti = await MultiFetch.deleteMulti(
                  multiCode
                );
                if (deleteMulti.isDeleted) {
                  window.open('/Merchandise/Multi/Lookup/', '_self');
                } else {
                  window.alert(
                    'Error Deleting Please Contact Administrator'
                  );
                }
              }}>
              Yes, I'm Sure
            </Button>

            <Button
              onClick={() => {
                setOpen({
                  ...open,
                  delete: false,
                });
              }}
              variant='outlined'
              size='medium'
              color='success'>
              No, Don't Delete
            </Button>
          </Box>
        </Box>
      </Modal>
      <Modal
        open={open.rename}
        onClose={() => {
          setOpen({
            ...open,
            rename: false,
          });
        }}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 5,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
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
              New Multi Code
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignContent: 'center',
              justifyContent: 'space-evenly',
              alignitems: 'center',
              padding: '1rem',
            }}>
            <TextField
              size={'small'}
              label='SKU...'
              fullWidth
              multiline
              onChange={(event) => {
                setRenameSku(event.target.value.split('\n'));
              }}
            />
            <Button onClick={handleStartProcessing}>
              Rename & Download
            </Button>
            <BulkImageRename
              data={[
                {
                  multiCode: multiCode,
                  SKU: renameSku,
                },
              ]}
              submit={submit}
            />
          </Box>
        </Box>
      </Modal>
    </>
  );
}
