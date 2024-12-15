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
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    document.title = `BB | Major Code | ${MajorCode}`;
  }, [MajorCode]);

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
    setLocations((prevLocations) => {
      const newLocations = [...prevLocations];
      newLocations[index].showData = !newLocations[index].showData;
      return newLocations;
    });
  };

  React.useEffect(() => {
    const updatedStores = locations
      .filter((location) => location.showData)
      .map((location) => location.storeAbrev);

    setSearchParams({ store: JSON.stringify(updatedStores) });
  }, [locations, setSearchParams]);

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const fetchPromises = locations
        .filter((location) => location.showData)
        .map(async (location) => {
          try {
            const data = await InvFetch.getOpenToBuyByStoreAndClass(
              location.storeAbrev,
              MajorCode
            );
            return {
              store: location.storeAbrev,
              data: data === "No Sku's found" ? [] : data,
            };
          } catch (error) {
            console.error(
              `Error fetching data for ${location.storeAbrev}:`,
              error
            );
            return { store: location.storeAbrev, data: [] };
          }
        });

      const results = await Promise.all(fetchPromises);
      setData((prevData) =>
        results.reduce(
          (acc, { store, data }) => {
            acc[store] = data;
            return acc;
          },
          { ...prevData }
        )
      );
      setLoading(false);
    }

    fetchData();
  }, [locations, MajorCode]);

  const columns = [
    {
      field: 'Online Status',
      headerName: 'Online Status',
      width: 175,
      headerAlign: 'center',
      align: 'center',
      valueGetter: (params) =>
        params.row.isOnline !== 'SKU Is Not Online'
          ? params.row.isOnline.hidden === true
            ? 'Hidden'
            : params.row.isOnline.purchasable === false
            ? 'Not Purchasable'
            : 'Online'
          : 'Not Online',
    },
    {
      field: 'store_code',
      headerName: 'Location',
      width: 95,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'sku_no',
      headerName: 'SKU',
      width: 125,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'class_34',
      headerName: 'Minor',
      width: 95,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'vndr_style',
      headerName: 'Style',
      width: 175,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'desc',
      headerName: 'Desc',
      width: 275,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'desc2',
      headerName: 'Desc2',
      width: 250,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'retail',
      headerName: 'Retail',
      width: 125,
      valueGetter: (params) => USDollar.format(params.row.retail),
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'date',
      headerName: 'Date',
      width: 125,
      valueGetter: (params) =>
        new Date(params.row.date).toLocaleDateString(),
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'Image',
      headerName: 'Image',
      width: 450,
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
      headerAlign: 'center',
      align: 'center',
    },
  ];

  const rows = [
    ...(Array.isArray(data.WS) ? data.WS : []),
    ...(Array.isArray(data.ATL) ? data.ATL : []),
    ...(Array.isArray(data.TPA) ? data.TPA : []),
    ...(Array.isArray(data.DAL) ? data.DAL : []),
  ];

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

      <Box
        sx={{
          height: '800px', // Define a fixed height for the DataGrid container
          overflow: 'auto', // Enable scrolling within this container
        }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 25 },
            },
          }}
          style={{
            border: 'none', // This directly overrides the inline border style
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          sx={{
            '& .MuiDataGrid-root': {
              border: 'none !important', // Add !important to override inline styles
            },
            '& .MuiDataGrid-columnHeaders': {
              position: 'sticky',
              top: 0,
              zIndex: 2, // Ensure it appears above the rows
              backgroundColor: '#fff', // Provide a background color
            },
          }}
          getRowId={(row) => row._id}
          getRowHeight={() => 250}
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
      </Box>
    </Common>
  );
}
