import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { helix } from 'ldrs';
import React from 'react';
import Common from '../../layouts/common';

export default function ClientLookUp() {
  helix.register();

  const [clientData, setClientData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  document.title = 'BB | Client | Look Up';

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
      field: 'firstName',
      headerName: 'First name',
      width: 150,
      editable: true,
    },
    {
      field: 'lastName',
      headerName: 'Last name',
      width: 150,
      editable: true,
    },
    {
      field: 'age',
      headerName: 'Age',
      type: 'number',
      width: 110,
      editable: true,
    },
    {
      field: 'fullName',
      headerName: 'Full name',
      description:
        'This column has a value getter and is not sortable.',
      sortable: false,
      width: 160,
      valueGetter: (value, row) =>
        `${row.firstName || ''} ${row.lastName || ''}`,
    },
  ];

  const rows = [...clientData];
  return (
    <Common>
      <Box sx={{ height: 840, width: '100%' }}>
        <DataGrid
          rows={clientData}
          columns={columns}
          loading={loading}
          components={{
            LoadingOverlay: () => (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}>
                <l-helix
                  size='100'
                  speed='1.5'
                  color='#103783'></l-helix>
              </Box>
            ),
          }}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Box>
    </Common>
  );
}
