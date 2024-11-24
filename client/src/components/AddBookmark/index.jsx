import { Box, Modal, TextField, Typography } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import React from 'react';
import '../../custom.css';
import UserFetch from '../../fetch/UserFetch';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-evenly',
  // alignItems: "stretch",
  height: '45vh',
  borderRadius: '10px',
};

export default function AddBookmark({
  open,
  setOpen,
  handleOpen,
  handleClose,
  defaultBookMark,
  setDefaultBookMarks,
}) {
  const [modalFormState, setModalFormState] = React.useState({
    sortOrder: '',
    title: '',
    link: '',
    link: '',
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (modalFormState.title && modalFormState.link) {
      const tempArr = JSON.parse(localStorage.getItem('bookmarks'));

      tempArr.push(modalFormState);

      let userId = localStorage.getItem('userId');

      const userUpdate = await UserFetch.UpdateUserById(userId, {
        bookmarks: tempArr.map((item) => ({
          link: item.link,
          title: item.title,
          sortOrder: item.sortOrder,
        })),
      });

      const newBookmarks = await UserFetch.getUserBookmarks(userId);

      console.log(newBookmarks.bookmarks);

      localStorage.setItem(
        'bookmarks',
        JSON.stringify(newBookmarks.bookmarks)
      );

      setDefaultBookMarks(newBookmarks.bookmarks);

      setModalFormState({
        sortOrder: '',
        title: '',
        link: '',
        link: '',
      });

      handleClose();
    }
  };

  const handleChange = async (event) => {
    const { name, value } = event.target;

    setModalFormState({
      ...modalFormState,
      [name]: value,
    });
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'>
      <Box sx={style}>
        <Typography
          id='modal-modal-title'
          variant='h6'
          component='h2'>
          Add New Bookmark
        </Typography>
        {modalFormState.image && (
          <IconButton>
            <Avatar
              src={modalFormState.image}
              sx={{ width: 100, height: 100 }}
            />
          </IconButton>
        )}
        <TextField
          id='outlined-basic'
          label='Title'
          name='title'
          variant='outlined'
          onChange={(event) => handleChange(event)}
        />
        <TextField
          id='outlined-basic'
          label='Link'
          name='link'
          variant='outlined'
          onChange={(event) => handleChange(event)}
        />
        <TextField
          id='outlined-basic'
          label='Sort Order'
          name='sortOrder'
          variant='outlined'
          onChange={(event) => handleChange(event)}
        />
        <TextField
          id='outlined-basic'
          label='folder'
          name='folder'
          variant='outlined'
          onChange={(event) => handleChange(event)}
        />

        <Button
          variant='outlined'
          onClick={handleSubmit}
          disabled={
            modalFormState.link.length > 0 &&
            modalFormState.title.length > 0
              ? false
              : true
          }>
          Create
        </Button>
      </Box>
    </Modal>
  );
}
