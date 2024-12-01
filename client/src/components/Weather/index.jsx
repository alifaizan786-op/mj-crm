import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import React from 'react';

export default function Weather() {
  const [weather, setWeather] = React.useState();

  React.useEffect(() => {
    getWeather();
  }, []);

  function getWeather() {
    let currentRegion =
      localStorage.getItem('region').toLowerCase() || 'georgia';

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

    const url =
      `https://api.openweathermap.org/data/2.5/weather?lat=` +
      coordinates[currentRegion].lat +
      `&lon=` +
      coordinates[currentRegion].long +
      `&appid=` +
      process.env.REACT_APP_WEATHER_API_KEY +
      `&units=imperial`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => setWeather(data));
  }

  return (
    weather?.weather && (
      <Box
        sx={{
          width: { xs: '80%', sm: '30%' },
          display: 'flex',
          justifyContent: 'start',
          alignItems: 'center',
        }}>
        <Box>
          <Typography
            variant='h6'
            sx={{ margin: '0', textAlign: 'end' }}>
            <strong>
              {weather?.name == 'Scottdale' && 'Decatur, GA'}
            </strong>
            <strong>
              {weather?.name == 'Carrollwood Village' && 'Tampa, FL'}
            </strong>
            <strong>
              {weather?.name == 'Richardson' && 'Dallas, TX'}
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
        <Box>
          <Typography variant='h5'>
            <strong>
              {' '}
              {weather?.main.temp_min}° | {weather?.main.temp_max}°{' '}
            </strong>
          </Typography>
        </Box>
      </Box>
    )
  );
}
