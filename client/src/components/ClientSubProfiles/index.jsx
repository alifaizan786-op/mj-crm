import { Box } from '@mui/material';
import React from 'react';
import CustomerFetch from '../../fetch/CustomerFetch';

const buttonOptions = {
  size: 'small',
  variant: 'outlined',
  sx: {
    margin: '0 5px',
    bgcolor: 'white',
    width: '100px',
  },
};

export default function ClientSubProfiles({ data }) {
  const [clientData, setClientData] = React.useState({
    loading: true,
    data: [],
  });

  const [webClientData, setWebClientData] = React.useState({
    loading: true,
    data: [],
  });

  const getData = async (e) => {
    setClientData({
      loading: true,
      data: [],
    });

    try {
      const customerData = await CustomerFetch.customerSearch({
        fields: [
          'store_code',
          'customer',
          'first',
          'last',
          'home',
          'work',
          'mobile',
          'address',
          'address2',
          'city',
          'state',
          'zip',
          'purchvisit',
          'email',
          'date_added',
          'notes',
          'purchases',
          'clerk',
          'last_purch',
          'cust_type',
          'ytd_purch',
          'py_purch',
          'comments',
        ],
        query: {
          first: data.data.first,
          last: data.data.last,
          home: data.data.home,
          work: data.data.work,
          mobile: data.data.mobile,
          store_code: [
            'AI',
            'ATL',
            'AS',
            'DAL',
            'DI',
            'DS',
            'TPA',
            'TI',
            'TS',
          ],
        },
      });

      const filteredArr = customerData.filter(
        (item) =>
          `${item.store_code}-${item.customer}` !==
          `${data.data.store_code}-${data.data.customer}`
      );

      setClientData({
        loading: false,
        data: filteredArr,
      });
    } catch (error) {}
  };

  React.useEffect(() => {
    getData();
  }, [data.data]);

  console.log(clientData);

  return (
    <Box
      sx={{
        bgcolor: 'white',
        width: '24.9%',
        marginTop: '10px',
      }}>
      Client Sub Profiles
    </Box>
  );
}
