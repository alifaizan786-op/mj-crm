import React from 'react';

import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from '@mui/x-data-grid';

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';

import LinearProgress from '@mui/material/LinearProgress';

import AttributeFetch from '../../fetch/AttributeFetch';

export default function UploadingDataGrid({
  uploadingData,
  setUploadingData,
}) {
  const [attributes, setAttributes] = React.useState();

  React.useEffect(() => {
    async function getData() {
      const SubCategory = await AttributeFetch.getAttributeByTitle(
        'Sub Categories'
      );
      const Category = await AttributeFetch.getAttributeByTitle(
        'Categories'
      );
      setAttributes({
        SubCategory: SubCategory,
        Category: Category,
      });
    }

    getData();
  }, []);

  //create an array with month name abreaviations, in lower case
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  let columns = [
    {
      field: 'SrNo',
      headerName: 'SrNo',
      width: 55,
    },
    {
      field: 'Category',
      headerName: 'Category',
      renderCell: (params) => {
        return params.row.Category === '' ? (
          <FormControl
            variant='standard'
            sx={{ m: 1, minWidth: '250px' }}>
            <InputLabel id='demo-simple-select-label'>
              Category
            </InputLabel>
            <Select
              labelId='demo-simple-select-label'
              id='demo-simple-select-size-medium'
              label='Category'
              size='medium'
              sx={{ border: 'none' }}
              defaultValue={''}
              name='Category'
              onChange={(event) => {
                setUploadingData((prevData) => {
                  return prevData.map((data) => {
                    if (data.SKU === params.row.SKU) {
                      return {
                        ...data,
                        Category: event.target.value,
                      };
                    } else {
                      return data;
                    }
                  });
                });
              }}>
              {attributes.Category.options.map((cat, index) => {
                return (
                  <MenuItem
                    key={index}
                    value={cat}>
                    {cat}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        ) : (
          params.row.Category
        );
      },
      width: 85,
    },
    {
      field: 'SubCategory',
      headerName: 'SubCategory',
      renderCell: (params) => {
        return params.row.SubCategory === '' ? (
          <FormControl
            variant='standard'
            sx={{ m: 1, minWidth: '250px' }}>
            <InputLabel id='demo-simple-select-label'>
              SubCategory
            </InputLabel>
            <Select
              labelId='demo-simple-select-label'
              id='demo-simple-select-size-medium'
              label='SubCategory'
              size='medium'
              sx={{ border: 'none' }}
              defaultValue={''}
              name='SubCategory'
              onChange={(event) => {
                setUploadingData((prevData) => {
                  return prevData.map((data) => {
                    if (data.SKU === params.row.SKU) {
                      return {
                        ...data,
                        SubCategory: event.target.value,
                      };
                    } else {
                      return data;
                    }
                  });
                });
              }}
              // onChange={handleChange}
            >
              {attributes.SubCategory.options.map((cat, index) => {
                return (
                  <MenuItem
                    key={index}
                    value={cat}>
                    {cat}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        ) : (
          params.row.SubCategory
        );
      },
      width: 125,
    },
    {
      field: 'SKUCode',
      headerName: 'SKUCode',
      width: 85,
    },
    {
      field: 'Note',
      headerName: 'Note',
      width: 85,
    },
    {
      field: 'class_12',
      headerName: 'Classcode',
      width: 100,
    },
    {
      field: 'class_34',
      headerName: 'Minorcode',
      width: 100,
    },
    {
      field: 'TotCost',
      headerName: 'TotCost',
      width: 100,
      valueGetter: (params) => 0,
    },
    {
      field: 'retail',
      headerName: 'TagPrice',
      width: 100,
    },
    {
      field: 'loc_qty1',
      headerName: 'StockQty',
      width: 100,
    },
    {
      field: 'date',
      headerName: 'SKUEntryDate',
      width: 125,
      valueGetter: (params) => {
        return new Date(params.row.date).toLocaleDateString();
      },
    },
    {
      field: 'SKUUploadDate',
      headerName: 'SKUUploadDate',
      width: 125,
      valueGetter: (params) => {
        return new Date().toLocaleDateString();
      },
    },
    {
      field: 'ven_code',
      headerName: 'Vendor',
      width: 100,
    },
    {
      field: 'vndr_style',
      headerName: 'VendStyle',
      width: 100,
    },
    {
      field: 'STORE',
      headerName: 'Store',
      width: 100,
      valueGetter: (params) => {
        if (
          params.row.store_code === 'ATL' ||
          params.row.store_code === 'AI'
        ) {
          return 'Atlanta';
        } else if (
          params.row.store_code === 'DAL' ||
          params.row.store_code === 'DI'
        ) {
          return 'Dallas';
        } else if (
          params.row.store_code === 'TPA' ||
          params.row.store_code === 'TI'
        ) {
          return 'Tampa';
        } else {
          return params.row.store_code;
        }
      },
    },
    {
      field: 'weight',
      headerName: 'StyleGrossWt',
      width: 100,
    },
    {
      field: 'GoldWeight',
      headerName: 'GoldWeight',
      width: 100,
    },
    {
      field: 'desc',
      headerName: 'StyleDesc',
      width: 250,
    },
    {
      field: 'desc2',
      headerName: 'StyleDesc2',
      width: 100,
    },
    {
      field: 'GoldKT',
      headerName: 'GoldKT',
      width: 100,
    },
    {
      field: 'Color',
      headerName: 'Color',
      width: 100,
    },
    {
      field: 'ShowPriceFallFlag',
      headerName: 'ShowPriceFallFlag',
      width: 100,
      valueGetter: (params) =>
        params.row.SKUCode.length > 0 ? 'Yes' : 'No',
    },
    {
      field: 'IsCloseOut',
      headerName: 'IsCloseOut',
      width: 100,
      valueGetter: (params) =>
        params.row.SKUCode.length > 0 ? 'No' : 'Yes',
    },
    {
      field: 'IsNewArrived',
      headerName: 'IsNewArrived',
      width: 100,
      valueGetter: (params) =>
        params.row.SKUCode.length > 0 ? 'No' : 'Yes',
    },
    {
      field: 'IsHotSeller',
      headerName: 'IsHotSeller',
      width: 100,
      valueGetter: (params) =>
        params.row.SKUCode.length > 0 ? 'No' : 'Yes',
    },
    {
      field: 'Purchasable',
      headerName: 'Purchasable',
      width: 100,
      valueGetter: (params) =>
        params.row.SKUCode.length > 0 ? 'Yes' : 'No',
    },
    {
      field: 'Hidden',
      headerName: 'Hidden',
      width: 100,
      valueGetter: (params) =>
        params.row.SKUCode.length > 0 ? 'No' : 'Yes',
    },
    {
      field: 'AutoUpdatePrice',
      headerName: 'AutoUpdatePrice',
      width: 150,
      valueGetter: (params) =>
        [28, 77, 150, 500, 501, 98, 101, 102, 104, 108, 110].includes(
          parseInt(params.row.class_12)
        )
          ? 'No'
          : 'Yes',
    },
    {
      field: 'ShowRetailPrice',
      headerName: 'ShowRetailPrice',
      width: 100,
      valueGetter: (params) =>
        parseInt(params.row.majorCode) > 229 &&
        parseInt(params.row.majorCode) < 467
          ? 'Yes'
          : 'No',
    },
    {
      field: 'Jewelry For',
      headerName: 'Jewelry For',
      width: 100,
    },
    {
      field: 'Jewelry Type',
      headerName: 'Jewelry Type',
      width: 100,
    },
    {
      field: 'Finishing',
      headerName: 'Finishing',
      width: 100,
    },
    {
      field: 'Number of Pcs',
      headerName: 'Number of Pcs',
      width: 100,
    },
    {
      field: 'Diamond Type',
      headerName: 'Diamond Type',
      width: 100,
    },
    {
      field: 'Diamond Total Weight',
      headerName: 'Diamond Total Weight',
      width: 100,
    },
    {
      field: 'Diamond Clarity',
      headerName: 'Diamond Clarity',
      width: 100,
    },
    {
      field: 'Diamond Total Pcs',
      headerName: 'Diamond Total Pcs',
      width: 100,
    },
    {
      field: 'Diamond Color',
      headerName: 'Diamond Color',
      width: 100,
    },
    {
      field: 'Center Diamond Weight',
      headerName: 'Center Diamond Weight',
      width: 100,
    },
    {
      field: 'IsGIACertified',
      headerName: 'IsGIACertified',
      width: 100,
    },
    {
      field: 'Length',
      headerName: 'Length',
      width: 100,
    },
    {
      field: 'Width',
      headerName: 'Width',
      width: 100,
    },
    {
      field: 'Pendant Length',
      headerName: 'Pendant Length',
      width: 100,
    },
    {
      field: 'Pendant Width',
      headerName: 'Pendant Width',
      width: 100,
    },
    {
      field: 'Earrings Length',
      headerName: 'Earrings Length',
      width: 100,
    },
    {
      field: 'Earrings Width',
      headerName: 'Earrings Width',
      width: 100,
    },
    {
      field: 'Earring Post Type',
      headerName: 'Earring Post Type',
      width: 100,
    },
    {
      field: 'Ring Size',
      headerName: 'Ring Size',
      width: 100,
    },
    {
      field: 'Ring Design Height',
      headerName: 'Ring Design Height',
      width: 100,
    },
    {
      field: 'Ring Width',
      headerName: 'Ring Width',
      width: 100,
    },
    {
      field: 'Ring Type',
      headerName: 'Ring Type',
      width: 100,
    },
    {
      field: 'Bangle Size',
      headerName: 'Bangle Size',
      width: 100,
    },
    {
      field: 'Bangle/Bracelet Size Adjustable up-to',
      headerName: 'Bangle/Bracelet Size Adjustable up-to',
      width: 100,
    },
    {
      field: 'Bangle Inner Diameter',
      headerName: 'Bangle Inner Diameter',
      width: 100,
    },
    {
      field: 'Bangle Width',
      headerName: 'Bangle Width',
      width: 100,
    },
    {
      field: 'Bangle Design Height',
      headerName: 'Bangle Design Height',
      width: 100,
    },
    {
      field: 'Bangle/Bracelet Type',
      headerName: 'Bangle/Bracelet Type',
      width: 100,
    },
    {
      field: 'Chain included in the price',
      headerName: 'Chain included in the price',
      width: 100,
    },
    {
      field: 'Nose Pin Type',
      headerName: 'Nose Pin Type',
      width: 100,
    },
    {
      field: 'Watch Disclaimer',
      headerName: 'Watch Disclaimer',
      width: 100,
    },
    {
      field: 'Changeable Stones Included',
      headerName: 'Changeable Stones Included',
      width: 100,
    },
    {
      field: 'Gemstones Weight',
      headerName: 'Gemstones Weight',
      width: 100,
    },
    {
      field: 'Disclaimer',
      headerName: 'Disclaimer',
      width: 100,
    },
    {
      field: 'Gemstones Type',
      headerName: 'Gemstones Type',
      width: 100,
    },
    {
      field: 'MarginPrice',
      headerName: 'MarginPrice',
      width: 100,
    },
    {
      field: 'Classification',
      headerName: 'Classification',
      width: 100,
    },
    {
      field: 'CustPrice',
      headerName: 'CustPrice',
      width: 100,
      valueGetter: (params) =>
        [28, 77, 150, 500, 501, 98, 101, 102, 104, 108, 110].includes(
          parseInt(params.row.class_12)
        )
          ? params.row.retail
          : '',
    },
    {
      field: 'PerGramOrDisc',
      headerName: 'PerGramOrDisc',
      width: 100,
    },
    {
      field: 'Collection',
      headerName: 'Collection',
      width: 100,
    },
    {
      field: 'StyleName',
      headerName: 'StyleName',
      width: 100,
    },
    {
      field: 'Chain Length',
      headerName: 'Chain Length',
      width: 100,
    },
    {
      field: 'RelatedSKU',
      headerName: 'RelatedSKU',
      width: 100,
    },
    {
      field: 'Certificate#',
      headerName: 'Certificate#',
      width: 100,
    },
    {
      field: 'Certification',
      headerName: 'Certification',
      width: 100,
    },
    {
      field: 'DC',
      headerName: 'DC',
      width: 100,
      valueGetter: (params) => {
        if (params.row.DATE) {
          return (
            (new Date().getMonth() + 1).toString().padStart(2, '0') +
            params.row.MFG_CODE +
            (new Date(params.row.DATE).getYear() - 100)
          );
        }
      },
    },
    {
      field: 'SearchUploadDate',
      headerName: 'SearchUploadDate',
      width: 100,
      valueGetter: (params) => {
        return (
          new Date().getDate() +
          monthNames[new Date().getMonth()] +
          (new Date().getYear() - 100)
        );
      },
    },
    {
      field: 'MultiStyleCode',
      headerName: 'MultiStyleCode',
      width: 100,
      valueGetter: (params) => params.row.StyleMultiCode,
    },
  ];

  function CustomToolbar() {
    return (
      <GridToolbarContainer
        sx={{ justifyContent: 'space-between', padding: '0% 5%' }}>
        <GridToolbarColumnsButton />
        <GridToolbarDensitySelector />
        {/* <ExcelButton
          columns={columns.map((item) => item.headerName)}
        /> */}
        <GridToolbarExport
          // csvOptions={{
          //   allColumns: true,
          //   fileName: 'Uploading.csv',
          //   // delimiter: ';',
          //   utf8WithBom: true,
          // }}
          excelOptions={{
            allColumns: true,
            fileName: 'Uploading.csv',
          }}
        />
      </GridToolbarContainer>
    );
  }
  const rows = [...uploadingData];

  return (
    <>
      <DataGrid
        rows={rows}
        columns={columns}
        columnHeaderHeight={30}
        density='compact'
        components={{
          Toolbar: CustomToolbar,
          LoadingOverlay: LinearProgress,
        }}
        getRowId={(row) => row._id}
      />
    </>
  );
}
