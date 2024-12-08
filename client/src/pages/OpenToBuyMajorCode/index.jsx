import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Image from '../../components/Image';
import Loader from '../../components/Loader';
import InvFetch from '../../fetch/InvFetch';
import Common from '../../layouts/common';
import USDollar from '../../utils/USDollar';

export default function OpenToBuyMajorCode() {
  const { MajorCode } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const paginationModel = { page: 0, pageSize: 3 };

  document.title = `BB | Major Code | ${MajorCode}`;

  const [data, setData] = React.useState({
    WS: [],
    ATL: [],
    TPA: [],
    DAL: [],
  });

  const storeParam = searchParams.get('store');
  let parsedStores = [];
  try {
    parsedStores = storeParam ? JSON.parse(storeParam) : [];
  } catch (err) {
    console.error('Error parsing store query parameter:', err);
  }

  const [locations, setLocations] = React.useState([
    {
      store: 'Wholesale',
      storeAbrev: 'WS',
      showData: parsedStores.includes('WS'),
    },
    {
      store: 'Atlanta',
      storeAbrev: 'ATL',
      showData: parsedStores.includes('ATL'),
    },
    {
      store: 'Tampa',
      storeAbrev: 'TPA',
      showData: parsedStores.includes('TPA'),
    },
    {
      store: 'Dallas',
      storeAbrev: 'DAL',
      showData: parsedStores.includes('DAL'),
    },
  ]);

  const handleCheckboxClick = (index) => {
    setLocations((prevLocations) =>
      prevLocations.map((location, i) =>
        i === index
          ? { ...location, showData: !location.showData }
          : location
      )
    );
  };

  React.useEffect(() => {
    async function fetchData() {
      for (let i = 0; i < locations.length; i++) {
        const element = locations[i];
        if (element.showData) {
          const majorCodeDataStore =
            await InvFetch.getOpenToBuyByStoreAndClass(
              element.storeAbrev,
              MajorCode
            );
          setData((prevData) => ({
            ...prevData,
            [element.storeAbrev]: majorCodeDataStore,
          }));
        }
      }
    }

    fetchData();
  }, [locations, MajorCode]);

  console.log(data);

  const columns = [
    {
      field: 'Online Status',
      headerName: 'Online Status',
      width: 150,
      headerAlign: 'center',
      align: 'center',
      valueGetter: (params) =>
        params.row.isOnline !== 'SKU Is Not Online'
          ? params.row.isOnline.hidden == true
            ? 'Hidden'
            : params.row.isOnline.purchasable == false
            ? 'Not Purchasable'
            : 'Online'
          : 'Not Online',
    },
    {
      field: 'store_code',
      headerName: 'Location',
      width: 70,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'sku_no',
      headerName: 'SKU',
      width: 95,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'class_34',
      headerName: 'Minor',
      width: 70,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'vndr_style',
      headerName: 'Style',
      width: 150,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'desc',
      headerName: 'Desc',
      width: 200,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'desc2',
      headerName: 'Desc2',
      width: 200,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'retail',
      headerName: 'Retail',
      width: 95,
      valueGetter: (params) => USDollar.format(params.row.retail),
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'date',
      headerName: 'Date',
      width: 95,
      valueGetter: (params) =>
        new Date(params.row.date).toLocaleDateString(),
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'Image',
      headerName: 'Image',
      width: 500,
      renderCell: (params) => {
        return (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}>
            <Image sku={params.row.sku_no} />
          </Box>
        );
      },
    },
  ];

  const rows = [...data.WS, ...data.ATL, ...data.TPA, ...data.DAL];

  return (
    <Common>
      <FormGroup
        aria-label='position'
        row
        sx={{
          width: '100%',
          display: 'flex',
          alignContent: 'flex-start',
          justifyContent: 'space-evenly',
          alignItems: 'flex-start',
        }}>
        {locations.map((location, index) => (
          <FormControlLabel
            key={index}
            value={location.store}
            control={
              <Checkbox
                checked={location.showData}
                onClick={() => handleCheckboxClick(index)}
              />
            }
            label={location.store}
            labelPlacement='end'
          />
        ))}
      </FormGroup>

      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10, 25, 50]}
        sx={{ border: 0 }}
        getRowId={(row) => row._id}
        getRowHeight={() => 250} // Adjust this value as needed for your images
        components={{
          LoadingOverlay: () => (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}>
              <Loader />
            </Box>
          ),
        }}
      />
    </Common>
  );
}
