import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';
import logoIcon from '../../assets/Icon.svg';
import UserFetch from '../../fetch/UserFetch';
import Auth from '../../utils/auth';

export default function Login() {
  const [error, setError] = React.useState(false);
  const [formState, setFormState] = React.useState({
    employeeId: '',
    password: '',
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    let login = await UserFetch.loginHandler(formState);
    console.log(login);

    if (login.token) {
      Auth.login(login.token);
    } else {
      setError(true);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormState({
      ...formState,
      [name]: value,
    });
  };

  return (
    <>
      {/* Background */}
      {/*  */}
      <Box
        sx={{
          position: 'absolute',
          filter: 'blur(10px)',
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
      <Container
        component='main'
        sx={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <CssBaseline />
        <Box
          sx={{
            width: '25rem',
            height: '25rem',
            backgroundColor: 'white',
            padding: '5%',
            borderRadius: '45px',
            filter: 'drop-shadow(-2px -2px 2px #000000)',
          }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Avatar
              sx={{
                m: 1,
                bgcolor: error ? 'alert' : 'primary.light', // Change bgcolor to red if jiggle is true
                animation: error ? 'jiggle 0.5s' : 'none', // Apply jiggle animation if jiggle is true
              }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography
              component='h1'
              variant='h5'>
              Sign in
            </Typography>
            {/* <LoginForm
              error={error}
              setError={setError}
            /> */}
            <Box
              component='form'
              onSubmit={handleSubmit}
              noValidate>
              <TextField
                size='small'
                margin='normal'
                required
                fullWidth
                id='employeeId'
                label='employeeId'
                name='employeeId'
                autoComplete='email'
                autoFocus
                onChange={handleChange}
              />
              <TextField
                size='small'
                margin='normal'
                required
                fullWidth
                name='password'
                label='Password'
                type='password'
                id='password'
                autoComplete='current-password'
                onChange={handleChange}
              />

              <Button
                type='submit'
                fullWidth
                variant='contained'
                sx={{ mt: 3, mb: 2 }}>
                Sign In
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
}
