import { Box, Divider, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';
import Gold from '../../components/Gold';
import Weather from '../../components/Weather';
import QuoteFetch from '../../fetch/QuoteFetch';
import CommonLayout from '../../layouts/common/index';
import auth from '../../utils/auth';
import ProperCase from '../../utils/ProperCase';

export default function Dashboard() {
  const [userData, setUserData] = React.useState(
    auth.getProfile().data
  );
  const [quotes, setQuotes] = React.useState();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const orientation = isSmallScreen ? 'horizontal' : 'vertical';
  const height = isSmallScreen ? 'auto' : '100%';

  React.useEffect(() => {
    getRandomQuotes();
  }, []);

  async function getRandomQuotes() {
    const randomQuotes = await QuoteFetch.getRandomQuotes(1);
    setQuotes(randomQuotes[0]);
  }


  return (
    <CommonLayout>
      <>
        <Box
          sx={{
            height: '90vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly',
            alignItems: 'center',
          }}>
          <Typography
            variant='h3'
            color={'primary.light'}
            textAlign={'center'}
            sx={{ fontFamily: 'Baskervville', marginBottom: '15px' }}>
            Welcome Back !
          </Typography>
          <Box>
            <Typography
              variant='h1'
              color={'primary.main'}
              textAlign={'center'}
              sx={{
                fontFamily: 'Baskervville',
                marginBottom: '15px',
              }}>
              {ProperCase(userData.firstName)}{' '}
              {ProperCase(userData.lastName)}
            </Typography>
            <Typography
              variant='subtitle'
              color={'primary.main'}
              textAlign={'center'}
              sx={{
                fontFamily: 'Baskervville',
                fontSize: 30,
              }}>
              -{userData.title}
            </Typography>
          </Box>
          <Typography
            variant='h4'
            color={'primary.light'}
            textAlign={'center'}
            sx={{ fontFamily: 'Baskervville', marginBottom: '15px' }}>
            Malani Jewelers Inc - {userData.region}
          </Typography>
          <Divider
            sx={{
              width: '50%',
              borderBottomWidth: 1,
            }}
          />
          <Box
            sx={{
              maxWidth: { xs: '100%', sm: '75%' },
            }}>
            {/* Quote Text */}
            <Typography
              variant='h5'
              sx={{
                fontStyle: 'italic',
                color: '#333',
                zIndex: 1,
              }}>
              "{quotes?.body && quotes.body}"
            </Typography>
            {/* Author */}
            <Typography
              variant='subtitle1'
              sx={{
                marginTop: 2,
                fontWeight: 'bold',
                color: '#555',
              }}>
              — "{quotes?.author && quotes.author}"
            </Typography>
          </Box>

          <Divider
            sx={{
              width: '50%',
              borderBottomWidth: 1,
            }}
          />
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-evenly',
              alignItems: 'center',
            }}>
            <Weather />
            <Divider
              orientation={orientation}
              sx={{
                height: height,
                borderRightWidth: orientation === 'vertical' ? 1 : 0, // Ensures proper styling
                alignSelf: 'center',
                width: orientation === 'horizontal' ? '80%' : 'auto', // Adjust width for horizontal
              }}
            />
            <Gold />
          </Box>
        </Box>
      </>
    </CommonLayout>
  );
}
