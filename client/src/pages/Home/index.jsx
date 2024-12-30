import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import React from 'react';
import AddBookmark from '../../components/AddBookmark';
import CustomAvatar from '../../components/CustomAvatar';
import HomeAuth from '../../components/HomeAuth';
import HomeHeader from '../../components/HomeHeader';
import '../../custom.css';
import UserFetch from '../../fetch/UserFetch';

export default function Home() {
  const [open, setOpen] = React.useState(false);
  const [edit, setEdit] = React.useState(false);
  const [defaultBookMark, setDefaultBookMarks] = React.useState(
    JSON.parse(localStorage.getItem('bookmarks'))
  );

  document.title = 'MJ | Home';

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  function userAuthenticated() {
    return (
      localStorage.getItem('region') &&
      localStorage.getItem('bookmarks')
    );
  }

  const deleteBookmark = async (tilte, link) => {
    const tempArr = JSON.parse(
      localStorage.getItem('bookmarks')
    ).filter((item) => item.title !== tilte && item.link !== link);

    setDefaultBookMarks(tempArr);

    localStorage.setItem('bookmarks', JSON.stringify(tempArr));

    let userId = localStorage.getItem('userId');

    const userUpdate = await UserFetch.UpdateUserById(userId, {
      bookmarks: tempArr.map((item) => ({
        link: item.link,
        title: item.title,
        sortOrder: item.sortOrder,
      })),
    });

    const newBookmarks = await UserFetch.getUserBookmarks(userId);

    localStorage.setItem(
      'bookmarks',
      JSON.stringify(newBookmarks.bookmarks)
    );

    setDefaultBookMarks(newBookmarks.bookmarks);
  };

  return (
    <>
      {userAuthenticated() ? (
        <>
          <AddBookmark
            open={open}
            handleClose={handleClose}
            defaultBookMark={defaultBookMark}
            setDefaultBookMarks={setDefaultBookMarks}
          />
          <HomeHeader
            edit={edit}
            setEdit={setEdit}
            showSetting={true}
            showHome={false}
            showClientInTake={true}
          />
          <Box
            sx={{
              height: '80vh',
              maxWidth: '100vw',
              display: 'flex',
            }}>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignContent: 'space-evenly',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                width: '100%',
                margin: '5% 5%',
              }}>
              {defaultBookMark?.length > 0 ? (
                defaultBookMark
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: '20%',
                        height: '25%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-evenly',
                        justifyItems: 'center',
                        alignItems: 'center',
                      }}>
                      <Box
                        sx={{
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'flex-end',
                          height: '20%',
                        }}>
                        {edit && (
                          <IconButton
                            onClick={() =>
                              deleteBookmark(item.title, item.link)
                            }>
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                      <a
                        className={edit && 'jiggle'}
                        href={item.link}
                        target='_blank'
                        rel='noopener noreferrer'
                        style={{
                          display: 'flex',
                          alignContent: 'center',
                          justifyContent: 'space-evenly',
                          alignItems: 'center',
                          flexDirection: 'column',
                        }}>
                        {/* {item.image === undefined ? (
                    <Avatar sx={{ width: 100, height: 100, fontSize: 40 }}>
                      MJ+
                    </Avatar>
                  ) : (
                    <img src={item.image} width={100} />
                  )} */}
                        <IconButton>
                          {typeof item.image === 'string' ? (
                            <Avatar
                              alt={item.title}
                              // {`${item.title.split(" ")[0][0]} ${
                              //   item.title.split(" ")[1][0]
                              // }`}
                              src={item.image}
                              sx={{ width: 100, height: 100 }}
                            />
                          ) : (
                            <CustomAvatar
                              name={item.title}
                              size={100}
                            />
                          )}
                        </IconButton>
                        <h4>{item.title}</h4>
                      </a>
                    </Box>
                  ))
              ) : (
                <p> no bookmarks found</p>
              )}
              <Box
                sx={{
                  width: '20%',
                  height: '25%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-evenly',
                  justifyItems: 'center',
                  alignItems: 'center',
                }}>
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    height: '20%',
                  }}>
                  <IconButton>{/* <DeleteIcon /> */}</IconButton>
                </Box>
                <IconButton onClick={handleOpen}>
                  {/* <Avatar sx={{ width: 100, height: 100 }}> */}
                  <AddCircleOutlineIcon
                    sx={{ width: 100, height: 100 }}
                  />
                  {/* </Avatar> */}
                </IconButton>
                <h4
                // style={{ margin: "15% 0% 0% 0%" }}
                >
                  {' '}
                  New Bookmark
                </h4>
              </Box>
            </Box>
          </Box>
          {edit && (
            <Box
              sx={{
                width: '100vw',
                height: '10vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Button
                variant='outlined'
                onClick={() => {
                  localStorage.removeItem('bookmarks');
                  localStorage.removeItem('region');
                  window.location.reload();
                }}>
                Reset To Default
              </Button>
            </Box>
          )}
        </>
      ) : (
        <HomeAuth />
      )}
    </>
  );
}
