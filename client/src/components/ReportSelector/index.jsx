import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function ReportSelector() {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        height: '30vh',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
      }}>
      <Typography
        variant='h5'
        gutterBottom>
        What would you like to be the source of your reports ?
      </Typography>

      <Box
        sx={{
          width: '80%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
        }}>
        <Button
          variant='outlined'
          onClick={() => {
            navigate('/Merchandise/Reports/CustomReport/web');
          }}>
          MalaniJewelers.com
        </Button>
        <Button
          variant='outlined'
          onClick={() => {
            navigate('/Merchandise/Reports/CustomReport/vjs');
          }}>
          Shopkeeper (VJS)
        </Button>
      </Box>
    </Box>
  );
}
