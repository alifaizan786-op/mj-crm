import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, IconButton } from '@mui/material';
import React from 'react';

import logoIcon from '../../assets/Icon_1.svg';
import Weather from '../../components/Weather';

export default function HomeHeader({ edit, setEdit }) {
  return (
    <>
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
                window.location.href = '/ClientData';
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
        <Weather />
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
    </>
  );
}
