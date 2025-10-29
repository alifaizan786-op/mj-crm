import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from '@mui/x-data-grid';
import React from 'react';
import Loader from '../../components/Loader';
import AttributeFetch from '../../fetch/AttributeFetch';
import PricingPolicyFetch from '../../fetch/PricingPolicyFetch';
import Common from '../../layouts/common';
import Auth from '../../utils/auth';

export default function ClasscodeRules() {
  const [pricingPolicy, setPricingPolicy] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filteredRows, setFilteredRows] = React.useState([]);
  const [vendorOptions, setVendorOptions] = React.useState([]);
  const [classcodeDesc, setClasscodeDesc] = React.useState([]);
  const user = Auth.getProfile();

  // Modal state
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState('create'); // "create" or "edit"
  const [formData, setFormData] = React.useState({
    Classcode: '',
    ClasscodeDesc: '',
    Type: '',
    Vendor: '',
    FromMonths: '',
    ToMonths: '',
    BaseMargin: '',
    DiscountOnMargin: '',
    UpdatedBy: user.data._id,
  });

  // Generate classcode options (1-700)
  const classcodeOptions = Array.from(
    { length: 700 },
    (_, i) => i + 1
  );

  // Type options
  const typeOptions = ['PerGram', 'Discount'];

  // Mock function to get classcode description
  // Replace this with actual API call or lookup logic
  const getClasscodeDescription = (classcode) => {
    // This is a placeholder - replace with actual logic
    return classcode
      ? classcodeDesc
          .filter(
            (classcodedesc) =>
              classcodedesc.split(' - ')[0] == classcode
          )[0]
          .split(' - ')[1]
      : '';
  };

  // Reset form data
  const resetFormData = () => {
    setFormData({
      Classcode: '',
      ClasscodeDesc: '',
      Type: '',
      Vendor: '',
      FromMonths: '',
      ToMonths: '',
      BaseMargin: '',
      DiscountOnMargin: '',
      UpdatedBy: user.data._id,
    });
  };

  // Handle opening create modal
  const handleCreateClick = () => {
    resetFormData();
    setModalMode('create');
    setModalOpen(true);
  };

  // Handle opening edit modal
  const handleEditClick = (row) => {
    setFormData({
      Classcode: row.Classcode ?? '',
      ClasscodeDesc: row.ClasscodeDesc ?? '',
      Type: row.Type ?? '',
      Vendor: row.Vendor ?? '',
      FromMonths: row.FromMonths ?? '',
      ToMonths: row.ToMonths ?? '',
      BaseMargin: row.BaseMargin ?? '',
      DiscountOnMargin: row.DiscountOnMargin ?? '',
      _id: row._id,
      UpdatedBy: user.data._id,
    });
    setModalMode('edit');
    setModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      // Auto-populate ClasscodeDesc when Classcode changes
      if (field === 'Classcode') {
        updated.ClasscodeDesc = getClasscodeDescription(value);
      }

      return updated;
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (modalMode === 'create') {
        // Call API to create new pricing policy
        const newPolicy =
          await PricingPolicyFetch.createPricingPolicy(formData);
        setPricingPolicy((prev) => [...prev, newPolicy]);
        fetchPricingPolicy();
      } else {
        // Call API to update existing pricing policy
        const updatedPolicy =
          await PricingPolicyFetch.updatePricingPolicy(
            formData._id,
            formData
          );
        setPricingPolicy((prev) =>
          prev.map((item) =>
            item._id === formData._id ? updatedPolicy : item
          )
        );
        fetchPricingPolicy();
      }
      setModalOpen(false);
      resetFormData();
    } catch (error) {
      console.error('Error saving pricing policy:', error);
      // You might want to show an error message to the user here
    }
  };

  function CustomToolbar() {
    return (
      <GridToolbarContainer
        sx={{ justifyContent: 'space-between', padding: '0% 5%' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<AddIcon />}
            variant='contained'
            onClick={handleCreateClick}
            sx={{ mb: 1 }}>
            Create Rule
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <GridToolbarColumnsButton />
          <GridToolbarDensitySelector />
          <GridToolbarExport
            csvOptions={{
              allColumns: true,
              fileName: 'ClientData.csv',
              utf8WithBom: true,
            }}
          />
        </Box>
      </GridToolbarContainer>
    );
  }

  const fetchPricingPolicy = async () => {
    try {
      const classCodeRulesData =
        await PricingPolicyFetch.getPricingPolicy();
      setPricingPolicy(classCodeRulesData);

      const vendorNames = await AttributeFetch.getAttributeByTitle(
        'Vendors'
      );

      const classCodeDescs = await AttributeFetch.getAttributeByTitle(
        'Classcode Description'
      );
      setVendorOptions(vendorNames.options);
      setClasscodeDesc(classCodeDescs.options);
    } catch (error) {
      console.error('Error fetching pricing policy:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPricingPolicy();
  }, []);

  const columns = [
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          onClick={() => handleEditClick(params.row)}
          size='small'
          color='primary'>
          <EditIcon />
        </IconButton>
      ),
    },
    {
      field: 'ClassCode',
      headerName: 'Class Code',
      width: 100,
      valueGetter: (params) => {
        return `${params.row.Classcode}`;
      },
    },
    {
      field: 'ClasscodeDesc',
      headerName: 'Class Code Description',
      width: 300,
    },
    {
      field: 'Type',
      headerName: 'Type',
      width: 100,
    },
    {
      field: 'Vendor',
      headerName: 'Vendor',
      width: 100,
    },
    {
      field: 'FromMonths',
      headerName: 'From Months',
      width: 100,
    },
    {
      field: 'ToMonths',
      headerName: 'To Months',
      width: 100,
    },
    {
      field: 'BaseMargin',
      headerName: 'Base Margin',
      width: 100,
    },
    {
      field: 'DiscountOnMargin',
      headerName: 'Discount On Margin',
      width: 150,
    },
    {
      field: 'Base22KtRate',
      headerName: 'Base 22Kt Rate',
      width: 100,
    },
    {
      field: 'Base21KtRate',
      headerName: 'Base 21Kt Rate',
      width: 100,
    },
    {
      field: 'Base18KtRate',
      headerName: 'Base 18Kt Rate',
      width: 100,
    },
  ];

  const rows = [...pricingPolicy];

  React.useEffect(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();

    if (trimmedQuery === '') {
      setFilteredRows(pricingPolicy);
      return;
    }

    const filtered = pricingPolicy.filter(
      (row) =>
        row.Classcode?.toString().toLowerCase() === trimmedQuery
    );

    setFilteredRows(filtered);
  }, [searchQuery, pricingPolicy]);

  return (
    <Common>
      {/* Search Field */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <TextField
          label='Search'
          variant='outlined'
          size='small'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>

      <Box sx={{ height: 800, width: '100%' }}>
        {/* DataGrid */}
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          components={{
            Toolbar: CustomToolbar,
            LoadingOverlay: () => <Loader size={'75'} />,
          }}
          autoPageSize
          getRowId={(row) => row._id}
          disableRowSelectionOnClick
        />
      </Box>

      {/* Modal for Create/Edit */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth='md'
        fullWidth>
        <DialogTitle>
          {modalMode === 'create' ? 'Create New Rule' : 'Edit Rule'}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 2,
              pt: 1,
            }}>
            {/* Classcode Dropdown */}
            <FormControl fullWidth>
              <InputLabel>Class Code</InputLabel>
              <Select
                value={formData.Classcode}
                onChange={(e) =>
                  handleInputChange('Classcode', e.target.value)
                }
                label='Class Code'>
                {classcodeOptions.map((code) => (
                  <MenuItem
                    key={code}
                    value={code}>
                    {code}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Class Code Description - Auto-populated and read-only */}
            <TextField
              label='Class Code Description'
              value={formData.ClasscodeDesc}
              fullWidth
              disabled
              variant='filled'
            />

            {/* Type Dropdown */}
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.Type}
                onChange={(e) =>
                  handleInputChange('Type', e.target.value)
                }
                label='Type'>
                {typeOptions.map((type) => (
                  <MenuItem
                    key={type}
                    value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Vendor Dropdown */}
            <FormControl fullWidth>
              <InputLabel>Vendor</InputLabel>
              <Select
                value={formData.Vendor}
                onChange={(e) =>
                  handleInputChange('Vendor', e.target.value)
                }
                label='Vendor'>
                {vendorOptions.map((vendor) => (
                  <MenuItem
                    key={vendor}
                    value={vendor}>
                    {vendor}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* From Months */}
            <TextField
              label='From Months'
              type='number'
              value={formData.FromMonths}
              onChange={(e) =>
                handleInputChange('FromMonths', e.target.value)
              }
              fullWidth
            />

            {/* To Months */}
            <TextField
              label='To Months'
              type='number'
              value={formData.ToMonths}
              onChange={(e) =>
                handleInputChange('ToMonths', e.target.value)
              }
              fullWidth
            />

            {/* Base Margin */}
            <TextField
              label='Base Margin'
              type='number'
              value={formData.BaseMargin}
              onChange={(e) =>
                handleInputChange('BaseMargin', e.target.value)
              }
              fullWidth
            />

            {/* Discount On Margin */}
            <TextField
              label='Discount On Margin'
              type='number'
              value={formData.DiscountOnMargin}
              onChange={(e) =>
                handleInputChange('DiscountOnMargin', e.target.value)
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant='contained'>
            {modalMode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Common>
  );
}
