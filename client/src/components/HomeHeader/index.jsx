import HomeIcon from '@mui/icons-material/Home';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, IconButton } from '@mui/material';
import FormGroup from '@mui/material/FormGroup';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import React from 'react';
import logoIcon from '../../assets/Icon_1.svg';
import Weather from '../../components/Weather';

const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      width: 15,
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(9px)',
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: 2,
    '&.Mui-checked': {
      transform: 'translateX(12px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.primary.light, // Light color when ON
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(['width'], {
      duration: 200,
    }),
  },
  '& .MuiSwitch-track': {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: theme.palette.primary.main, // Dark color when OFF
    boxSizing: 'border-box',
  },
}));


export default function HomeHeader({
  edit,
  setEdit,
  showSetting,
  showHome,
  showClientInTake,
  showArchiveSwitch,
  setArchive,
  archive,
  handleArchiveChange,
}) {
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
            {showClientInTake && (
              <IconButton
                aria-label='delete'
                sx={{ margin: '10px' }}
                onClick={async () => {
                  window.location.href = '/ClientInTake';
                }}>
                <PeopleAltIcon fontSize='large' />
              </IconButton>
            )}
            {showHome && (
              <IconButton
                aria-label='delete'
                sx={{ margin: '10px' }}
                onClick={async () => {
                  window.location.href = '/';
                }}>
                <HomeIcon fontSize='large' />
              </IconButton>
            )}

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
            padding: '1rem',
          }}>
          {showSetting && (
            <IconButton
              aria-label='delete'
              sx={{ margin: '10px' }}
              onClick={() => setEdit(!edit)}>
              <SettingsIcon fontSize='large' />
            </IconButton>
          )}
          {showArchiveSwitch && (
            <FormGroup>
              <Stack
                direction='row'
                spacing={2}
                sx={{ alignItems: 'center' }}>
                <Typography>Today</Typography>
                <AntSwitch
                  checked={archive}
                  onChange={handleArchiveChange}
                />
                <Typography>Archived</Typography>
              </Stack>
            </FormGroup>
          )}
        </Box>
      </Box>
    </>
  );
}
