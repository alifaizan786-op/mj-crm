import {
  Autocomplete,
  Button,
  FormControl,
  TextField,
} from '@mui/material';
import Box from '@mui/material/Box';
import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from '@mui/x-data-grid';
import React from 'react';
import { Link } from 'react-router-dom';
import Loader from '../../components/Loader';
import CustomerFetch from '../../fetch/CustomerFetch';
import Common from '../../layouts/common';
import CalculateAge from '../../utils/CalculateAge';
import FormatPhone from '../../utils/FormatPhone';
import properCase from '../../utils/ProperCase';

export default function ClientLookUp() {
  const [formState, setFormState] = React.useState({
    first: '',
    last: '',
    home: '',
    work: '',
    mobile: '',
    city: '',
    state: '',
    zip: '',
    store_code: ['AI', 'ATL'],
  });
  
  const [clientData, setClientData] = React.useState({
    loading: true,
    data: [],
  });

  document.title = 'BB | Client | Look Up';

  function CustomToolbar() {
    return (
      <GridToolbarContainer
        sx={{ justifyContent: 'space-between', padding: '0% 5%' }}>
        <GridToolbarColumnsButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport
          csvOptions={{
            allColumns: true,
            fileName: 'ClientData.csv',
            utf8WithBom: true,
          }}
        />
      </GridToolbarContainer>
    );
  }

  const columns = [
    {
      field: 'uuid',
      headerName: 'ID',
      width: 100,
      valueGetter: (params) => {
        return `${params.row.store_code}-${params.row.customer}`;
      },
      renderCell: (params) => {
        return (
          <Link
            to={`/Client/${params.row.store_code}-${params.row.customer}`}>
            {params.row.store_code}-{params.row.customer}
          </Link>
        );
      },
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 250,
      valueGetter: (params) => {
        return `${properCase(params.row.last)}, ${properCase(
          params.row.first
        )}`;
      },
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      valueGetter: (params) => {
        const email = params.row.email;
        return email ? email.toLowerCase() : ''; // Return an empty string if email is null
      },
    },
    {
      field: 'home',
      headerName: 'Home Phone',
      width: 140,
      valueGetter: (params) => {
        return FormatPhone(params.row.home);
      },
    },
    {
      field: 'work',
      headerName: 'Work Phone',
      width: 140,
      valueGetter: (params) => {
        return FormatPhone(params.row.work);
      },
    },
    {
      field: 'mobile',
      headerName: 'Mobile Phone',
      width: 140,
      valueGetter: (params) => {
        return FormatPhone(params.row.mobile);
      },
    },
    {
      field: 'address',
      headerName: 'Address',
      width: 200,
      valueGetter: (params) => {
        const address = params.row.address || ''; // Default to an empty string if null
        const address2 = params.row.address2 || ''; // Default to an empty string if null
        return `${address
          .split(' ')
          .map((item) => properCase(item))
          .join(' ')} ${address2
          .split(' ')
          .map((item) => properCase(item))
          .join(' ')}`.trim();
      },
    },
    {
      field: 'city',
      headerName: 'City',
      width: 125,
      valueGetter: (params) => {
        const city = params.row.city;
        if (!city) return ''; // Return an empty string if city is null or undefined
        return city
          .split(' ')
          .map((item) => properCase(item))
          .join(' ');
      },
    },
    {
      field: 'state',
      headerName: 'State',
      width: 50,
    },
    {
      field: 'zip',
      headerName: 'Zip Code',
      width: 100,
    },
    {
      field: 'date_added',
      headerName: 'Client Since',
      width: 120,
      valueGetter: (params) => {
        if (!params.row.date_added) return ''; // Handle null/undefined date
        return CalculateAge(params.row.date_added).years;
      },
    },
    {
      field: 'last_purch',
      headerName: 'Last Purch',
      width: 120,
      valueGetter: (params) => {
        if (!params.row.last_purch) return ''; // Handle null/undefined date
        return CalculateAge(params.row.last_purch).years;
      },
    },
    {
      field: 'purchvisit',
      headerName: 'purchvisit',
      width: 120,
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        query: formState,
      });

      setClientData({
        loading: false,
        data: customerData,
      });
    } catch (error) {}
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const rows = [...clientData.data];

  let textFieldProps = {
    variant: 'outlined',
    size: 'small',
    margin: 'normal',
  };

  const inputsArr = [
    {
      inputType: 'text',
      selectitemsArr: [],
      label: 'First Name',
      name: 'first',
      labelId: 'first',
      value: formState.first,
      onChange: handleChange,
      ...textFieldProps,
    },
    {
      inputType: 'text',
      selectitemsArr: [],
      label: 'Last Name',
      name: 'last',
      labelId: 'last',
      value: formState.last,
      onChange: handleChange,
      ...textFieldProps,
    },
    {
      inputType: 'text',
      selectitemsArr: [],
      label: 'Contact Number',
      name: 'ContactNumber',
      labelId: 'Contact Number',
      value: formState.home || formState.work || formState.mobile,
      onChange: (e) => {
        const { name, value } = e.target;
        setFormState({
          ...formState,
          home: value,
          work: value,
          mobile: value,
        });
      },
      ...textFieldProps,
    },
    {
      inputType: 'text',
      selectitemsArr: [],
      label: 'City',
      name: 'city',
      labelId: 'city',
      value: formState.city,
      onChange: handleChange,
      ...textFieldProps,
    },
    {
      inputType: 'text',
      selectitemsArr: [],
      label: 'State',
      name: 'state',
      labelId: 'state',
      value: formState.state,
      onChange: handleChange,
      ...textFieldProps,
    },
    {
      inputType: 'text',
      selectitemsArr: [],
      label: 'Zip',
      name: 'zip',
      labelId: 'zip',
      value: formState.zip,
      onChange: handleChange,
      ...textFieldProps,
    },
    {
      inputType: 'select',
      selectitemsArr: ['ATL', 'AI'],
      label: 'Database',
      name: 'store_code',
      labelId: 'store_code',
      value: formState.store_code,
      onChange: handleChange,
      ...textFieldProps,
      disabled: true,
    },
  ];

  return (
    <Common>
      <Box
        component='form'
        onSubmit={handleSubmit}
        noValidate
        sx={{
          margin: '1rem auto',
          width: '95%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          alignItems: 'center',
        }}>
        {inputsArr.map((item, index) =>
          item.inputType === 'text' ? (
            <FormControl
              key={index}
              sx={{
                width: '200px',
                '& .MuiFormControl-root': {
                  margin: 0, // Ensure no margin for alignment
                },
              }}>
              <TextField
                name={item.name}
                label={item.label} // Label applied directly for TextField
                value={item.value}
                onChange={item.onChange}
                {...textFieldProps}
              />
            </FormControl>
          ) : (
            <FormControl
              key={index}
              sx={{
                width: '200px',
                '& .MuiFormControl-root': {
                  margin: 0, // Ensure no margin for alignment
                },
              }}>
              <Autocomplete
                options={item.selectitemsArr}
                clearOnEscape
                disabled={item.disabled}
                value={formState[item.name]}
                onChange={(event, newValue) =>
                  setFormState({
                    ...formState,
                    [item.name]: newValue,
                  })
                }
                disableClearable
                sx={{
                  '& .MuiOutlinedInput-root': {
                    padding: 0, // Align padding with TextField
                    height: '40px', // Match height explicitly (adjust if needed)
                  },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    disabled={item.disabled}
                    label={item.label}
                    variant={textFieldProps.variant}
                    margin={textFieldProps.margin}
                    size={textFieldProps.size} // Ensure size matches
                  />
                )}
              />
            </FormControl>
          )
        )}

        <Button
          sx={{
            width: '200px',
            height: '40px', // Match height with TextField and Autocomplete
            margin: 0,
          }}
          type='submit'
          variant='outlined'
          size='medium'
          margin='normal'>
          Submit
        </Button>
      </Box>
      <Box sx={{ height: 770, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={clientData.loading}
          components={{
            Toolbar: CustomToolbar,
            LoadingOverlay: () => <Loader size={'75'} />,
          }}
          autoPageSize
          getRowId={(row) => row._id}
          disableRowSelectionOnClick
        />
      </Box>
    </Common>
  );
}
