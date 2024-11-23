import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React from 'react';
import logoIcon from '../../assets/Icon_1.svg';
import CustomAvatar from '../../components/CustomAvatar';
import '../../custom.css';
import getFavicon from '../../utils/GetFavicon';

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

export default function Home() {
  const [open, setOpen] = React.useState(false);
  const [edit, setEdit] = React.useState(false);
  const [weather, setWeather] = React.useState({});
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [modalFormState, setModalFormState] = React.useState({
    image: '',
    link: '',
    title: '',
  });

  document.title = 'Mj Homepage';

  const handleChange = async (event) => {
    const { name, value } = event.target;

    if (name === 'link') {
      const image = await getFavicon(value);
      setModalFormState({
        ...modalFormState,
        image: image,
        link: value,
      });
    } else {
      setModalFormState({
        ...modalFormState,
        title: value,
      });
    }
  };

  const [defaultBookMark, setDefaultBookMarks] = React.useState(
    JSON.parse(localStorage.getItem('bookmarks'))
      ? JSON.parse(localStorage.getItem('bookmarks'))
      : [
          {
            title: 'Daily Price Sheet',
            link: 'https://docs.google.com/spreadsheets/d/1xXXpql0yZZetnhJhgXsrhFDoX3BP-5Bn0JSB6jCc_eE/edit#gid=0',
            image:
              'https://ssl.gstatic.com/docs/spreadsheets/spreadsheets_2023q4.ico',
          },
          {
            title: 'Mj Plus Home',
            link: 'http://173.14.213.113:8081/mj/default.aspx',
          },
          {
            title: 'Malani Jewelers.com',
            link: 'https://malanijewelers.com/',
            image:
              'https://malanijewelers.com/images/apple-icon-114x114.png',
          },
          {
            title: 'Website Gateway',
            link: 'https://malanij.com/eadmin/index.html#/quickSearch',
            image:
              'https://malanij.com/eadmin/assets/images/logo.png',
          },
        ]
  );

  React.useEffect(() => {
    getWeather(weather, setWeather);

    // Regular expression to match a simple URL pattern
    var urlPattern =
      /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(\/?\w*\/?)*(\?\S*)?$/i;

    async function middle() {
      if (localStorage.getItem('bookmarks')) {
        let allBookmarks = JSON.parse(
          localStorage.getItem('bookmarks')
        );

        for (let i = 0; i < allBookmarks.length; i++) {
          const element = allBookmarks[i];
          // Test the string against the URL pattern
          if (urlPattern.test(element.image) === false) {
            element.image = await getFavicon(element.link);
          }
        }

        setDefaultBookMarks(allBookmarks);

        localStorage.setItem(
          'bookmarks',
          JSON.stringify(allBookmarks)
        );
      } else {
        async function doPromise() {
          const tempArr = await Promise.all(
            defaultBookMark.map(async (element) => {
              const image = await getFavicon(element.link);
              return { ...element, image };
            })
          );
          setDefaultBookMarks(tempArr);
          localStorage.setItem('bookmarks', JSON.stringify(tempArr));
        }

        doPromise();
      }
    }

    middle();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (modalFormState.title && modalFormState.link) {
      const tempArr = JSON.parse(localStorage.getItem('bookmarks'));

      tempArr.push(modalFormState);

      setDefaultBookMarks(tempArr);

      localStorage.setItem('bookmarks', JSON.stringify(tempArr));

      setModalFormState({
        image: '',
        link: '',
        title: '',
      });

      handleClose();
    }
  };

  const deleteBookmark = async (tilte, link) => {
    const tempArr = JSON.parse(
      localStorage.getItem('bookmarks')
    ).filter((item) => item.title !== tilte && item.link !== link);

    setDefaultBookMarks(tempArr);

    localStorage.setItem('bookmarks', JSON.stringify(tempArr));
  };

  function getWeather() {
    const apiKey = '7274ad2eb9ee1b856f3e2f4d323703e3';
    const coordinates = {
      georgia: {
        lat: '33.798350',
        long: '-84.279170',
      },
      texas: {
        lat: '32.947800',
        long: '-96.737630',
      },
      florida: {
        lat: '28.079280',
        long: '-82.507830',
      },
    };
    if (localStorage.getItem('location') == 'georgia') {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.georgia.lat}&lon=${coordinates.georgia.long}&appid=${apiKey}&units=imperial`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => setWeather(data));
    }

    if (localStorage.getItem('location') == 'texas') {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.texas.lat}&lon=${coordinates.texas.long}&appid=${apiKey}&units=imperial`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => setWeather(data));
    }

    if (localStorage.getItem('location') == 'florida') {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.florida.lat}&lon=${coordinates.florida.long}&appid=${apiKey}&units=imperial`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => setWeather(data));
    }
  }

  console.log(weather);

  function checkPassword() {
    if (
      localStorage.getItem('password') == '7811@Malani' ||
      localStorage.getItem('password') == '7811@Tampa' ||
      localStorage.getItem('password') == '7811@Dallas'
    ) {
      return true;
    } else {
      return false;
    }
  }

  function enterPassword() {
    const password = window.prompt('What is the password?');
    console.log(password);

    if (password === '7811@Malani') {
      localStorage.setItem('password', password);
      localStorage.setItem('location', 'georgia');
      window.location.reload();
    }

    if (password === '7811@Tampa') {
      localStorage.setItem('password', password);
      localStorage.setItem('location', 'florida');
      window.location.reload();
      // Add any additional logic or actions needed for '7811@Tampa'
    }

    if (password === '7811@Dallas') {
      localStorage.setItem('password', password);
      localStorage.setItem('location', 'texas');
      window.location.reload();
      // Add any additional logic or actions needed for '7811@Dallas'
    }
  }

  return (
    <>
      {checkPassword() === true ? (
        <>
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
          <Box
            sx={{
              position: 'absolute',
              filter: 'blur(20px)',
              zIndex: -1,
              bottom: 0,
            }}>
            <img
              src={logoIcon}
              alt='Mantis'
              width='800'
              style={{
                margin: '20% 5% 20% 0',
                opacity: 0.5,
              }}
            />
          </Box>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'Space-between',
            }}>
            <>
              <Box
                sx={{
                  width: '25%',
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}>
                <IconButton
                  aria-label='delete'
                  sx={{ margin: '10px' }}
                  onClick={async () => {
                    window.location.href = '/ClientInTake';
                  }}>
                  <PeopleAltIcon fontSize='large' />
                </IconButton>
                <IconButton
                  aria-label='delete'
                  sx={{ margin: '10px' }}
                  onClick={async () => {
                    window.location.href = '/login';
                  }}>
                  <LoginOutlinedIcon fontSize='large' />
                </IconButton>
              </Box>
            </>

            {weather?.weather && (
              <>
                <Box
                  sx={{
                    width: '30%',
                    display: 'flex',
                    justifyContent: 'start',
                    alignItems: 'center',
                  }}>
                  <Box sx={{ width: '30%' }}>
                    <Typography
                      variant='h6'
                      sx={{ margin: '0', textAlign: 'end' }}>
                      <strong>
                        {weather?.name == 'Scottdale' &&
                          'Decatur, GA'}
                      </strong>
                      <strong>
                        {weather?.name == 'Carrollwood Village' &&
                          'Tampa, FL'}
                      </strong>
                      <strong>
                        {weather?.name == 'Richardson' &&
                          'Dallas, TX'}
                      </strong>
                    </Typography>
                    {/* <br /> */}
                    <Typography
                      variant='p'
                      sx={{
                        margin: '0',
                        textAlign: 'end',
                        display: 'block',
                        width: '100%',
                      }}>
                      {weather?.weather[0].description}
                    </Typography>
                  </Box>
                  <img
                    src={`https://openweathermap.org/img/wn/${weather?.weather[0].icon}.png`}
                    width={85}
                  />
                  <Box sx={{ width: '50%' }}>
                    <Typography variant='h5'>
                      <strong>
                        {' '}
                        {weather?.main.temp_min}° |{' '}
                        {weather?.main.temp_max}°{' '}
                      </strong>
                    </Typography>
                  </Box>
                </Box>
              </>
            )}
            <Box
              sx={{
                width: '25%',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}>
              <IconButton
                aria-label='delete'
                sx={{ margin: '10px' }}
                onClick={() => setEdit(!edit)}>
                <SettingsIcon fontSize='large' />
              </IconButton>
            </Box>
          </Box>
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
                defaultBookMark.map((item, index) => (
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
                  localStorage.removeItem('password');
                  window.location.reload();
                }}>
                Reset To Default
              </Button>
            </Box>
          )}
        </>
      ) : (
        enterPassword()
      )}
    </>
  );
}
