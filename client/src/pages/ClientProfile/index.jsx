import { Box } from '@mui/material';
import React from 'react';
import { useParams } from 'react-router-dom';
import ClientProfileHeader from '../../components/ClientProfileHeader';
import CustomerFetch from '../../fetch/CustomerFetch';
import Common from '../../layouts/common';

export default function ClientProfile() {
  const { id } = useParams();
  const [data, setData] = React.useState({
    loading: true,
    data: {},
  });

  function CalculateStyling() {
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    return {
      windowHeight,
      windowWidth,
    };
  }

  const styling = CalculateStyling();

  const getData = async () => {
    setData({
      loading: true,
      data: {},
    });

    try {
      const customerData = await CustomerFetch.getCustomerById(id);

      setData({
        loading: false,
        data: customerData[0],
      });
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    getData();
  }, []);

  console.log(data);

  return (
    <Common>
      <Box
        sx={{
          width: `calc(${styling.windowWidth}px)`, // Removed additional subtraction
          height: `calc(${styling.windowHeight - 64}px)`, // Adjusted to avoid excess space
          bgcolor: 'primary.light',
          padding: '5px',
          boxSizing: 'border-box', // Ensure padding doesn't overflow
          overflow: 'hidden', // Prevent accidental scrollbars
        }}>
        <ClientProfileHeader data={data} />
      </Box>
    </Common>
  );
}
