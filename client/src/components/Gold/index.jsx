import { Box, Typography } from '@mui/material';
import { helix } from 'ldrs';
import React from 'react';
import GoldFetch from '../../fetch/GoldFetch';
import USDollar from '../../utils/USDollar';

export default function Gold() {
  const [gold, setGold] = React.useState();
  helix.register();

  React.useEffect(() => {
    getGoldData();
  }, []);

  async function getGoldData() {
    let todayGoldData = await GoldFetch.getGold();
    console.log(todayGoldData);

    setGold([todayGoldData]);
  }


  return gold?.length > 0 ? (
    <Box
      sx={{
        width: '30%',
      }}>
      <Typography variant='h6'>Gold Price</Typography>
      <Typography variant='h4'>
        {USDollar.format(gold[0]?.prices.rates.XAU)}
      </Typography>
    </Box>
  ) : (
    <l-helix
      size='45'
      speed='2.5'
      color='black'></l-helix>
  );
}