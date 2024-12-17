import CircleIcon from '@mui/icons-material/Circle';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Box, IconButton } from '@mui/material';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Filters from '../../components/Filters';
import Image from '../../components/Image';
import Loader from '../../components/Loader';
import ReportSelector from '../../components/ReportSelector';
import AttributeFetch from '../../fetch/AttributeFetch';
import InvFetch from '../../fetch/InvFetch';
import WebsiteFetch from '../../fetch/WebsiteFetch';
import Common from '../../layouts/common';
import USDollar from '../../utils/USDollar';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export default function CustomReport() {
  const [data, setData] = React.useState({
    loading: null,
    data: [],
  });
  const [attributes, setAttributes] = React.useState([]);
  const [selection, setSelection] = React.useState([]);
  const { type } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = React.useState(true);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  React.useEffect(() => {
    async function getAttributeData() {
      try {
        const allAttributeData =
          await AttributeFetch.getAllAttributes();
        setAttributes(allAttributeData);
      } catch (error) {
        console.log(error);
      }
    }

    getAttributeData();
  }, []);

  const handleSubmit = async () => {
    handleClose();
    setData({
      ...data,
      loading: true,
    });

    try {
      const filters = Object.fromEntries(searchParams.entries());
      Object.keys(filters).forEach((key) => {
        filters[key] = filters[key].split(',');
      });
      if (type == 'web') {
        const reportData = await WebsiteFetch.reportBuilder(filters);
        setData({
          data: reportData,
          loading: false,
        });
      } else {
        const reportData = await InvFetch.reportBuilder(filters);
        setData({
          data: reportData,
          loading: false,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleFilterChange = (newFilters) => {
    const updatedParams = {};
    Object.keys(newFilters).forEach((key) => {
      if (Array.isArray(newFilters[key])) {
        updatedParams[key] = newFilters[key].join(',');
      } else {
        updatedParams[key] = newFilters[key];
      }
    });
    setSearchParams(updatedParams);
  };

  const handleClear = () => {
    setSearchParams({});
  };

  const getInitialFilters = () => {
    const filters = {};
    for (const [key, value] of searchParams.entries()) {
      filters[key] = value.split(',');
    }
    return filters;
  };

  return (
    <Common>
      {type ? (
        <Box>
          {/* Checks if attribues have loaded, then renders the filters */}
          {attributes?.length > 0 && (
            <Modal
              open={open}
              onClose={handleClose}
              aria-labelledby='modal-modal-title'
              aria-describedby='modal-modal-description'>
              <Box sx={style}>
                <Typography
                  id='modal-modal-title'
                  variant='h6'
                  component='h2'>
                  Set Filters
                </Typography>

                {type == 'web' ? (
                  // Filters For Web
                  <Filters
                    state={getInitialFilters()}
                    setState={handleFilterChange}
                    handleSubmit={handleSubmit}
                    handleClear={handleClear}
                    data={data.data}
                    selection={selection}
                    filters={[
                      {
                        name: 'Vendors',
                        options: attributes.filter(
                          (item) => item.title === 'Vendors'
                        )[0]?.options,
                        label: 'vendors',
                        multiple: true,
                        stateId: 'Vendors.VendorName',
                      },
                      {
                        name: 'Jewelry Type',
                        options: attributes.filter(
                          (item) => item.title === 'Jewelry Type'
                        )[0]?.options,
                        label: 'Jewelry Type',
                        multiple: true,
                        stateId: 'Styles.AttribField115',
                      },
                      {
                        name: 'Classcodes',
                        options: attributes.filter(
                          (item) => item.title === 'Classcodes'
                        )[0]?.options,
                        label: 'classCode',
                        multiple: true,
                        stateId: 'ClassCodes.ClassCode',
                      },
                      {
                        name: 'Categories',
                        options: attributes.filter(
                          (item) => item.title === 'Categories'
                        )[0]?.options,
                        label: 'Categories',
                        multiple: true,
                        stateId: 'CategoryHierarchy',
                      },
                      {
                        name: 'Years',
                        options: attributes.filter(
                          (item) => item.title === 'Years'
                        )[0]?.options,
                        label: 'Years',
                        multiple: true,
                        stateId: 'Years',
                      },
                      {
                        name: 'Purchasable',
                        options: [0, 1],
                        label: 'Purchasable',
                        multiple: true,
                        stateId: 'Purchasable',
                      },
                      {
                        name: 'StockQty',
                        options: [0, 1],
                        label: 'StockQty',
                        multiple: true,
                        stateId: 'StockQty',
                      },
                      {
                        name: 'Hidden',
                        options: [0, 1],
                        label: 'Hidden',
                        multiple: true,
                        stateId: 'Hidden',
                      },
                      {
                        name: 'Sort',
                        options: attributes.filter(
                          (item) => item.title === 'Sort'
                        )[0]?.options,
                        label: 'Sort',
                        multiple: false,
                        stateId: 'sort',
                      },
                    ]}
                  />
                ) : (
                  // Filters For VJS
                  <Filters
                    state={getInitialFilters()}
                    setState={handleFilterChange}
                    handleSubmit={handleSubmit}
                    handleClear={handleClear}
                    data={data.data}
                    selection={selection}
                    filters={[
                      {
                        name: 'Vendors',
                        options: attributes.filter(
                          (item) => item.title === 'Vendors'
                        )[0]?.options,
                        label: 'vendors',
                        multiple: true,
                        stateId: 'ven_code',
                      },

                      {
                        name: 'Classcodes',
                        options: attributes.filter(
                          (item) => item.title === 'Classcodes'
                        )[0]?.options,
                        label: 'classCode',
                        multiple: true,
                        stateId: 'class_12',
                      },

                      {
                        name: 'Store',
                        options: attributes.filter(
                          (item) => item.title === 'store'
                        )[0]?.options,
                        label: 'Location',
                        multiple: true,
                        stateId: 'store_code',
                      },

                      {
                        name: 'Years',
                        options: attributes.filter(
                          (item) => item.title === 'Years'
                        )[0]?.options,
                        label: 'Years',
                        multiple: true,
                        stateId: 'date',
                      },

                      {
                        name: 'StockQty',
                        options: [0, 1],
                        label: 'StockQty',
                        multiple: true,
                        stateId: 'loc_qty1',
                      },

                      {
                        name: 'Sort',
                        options: attributes.filter(
                          (item) => item.title === 'Sort'
                        )[0]?.options,
                        label: 'Sort',
                        multiple: false,
                        stateId: 'sort',
                      },
                    ]}
                  />
                )}
              </Box>
            </Modal>
          )}
          {/* Shows loading bar when data is being fetched from backend */}
          {data.loading && <Loader size='75' />}
          {/* Displays Web Data In Tile Form, and alows user to edit the filters */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-evenly',
              alignItems: 'center',
              flexWrap: 'wrap',
              width: '100%',
            }}>
              {/* First Tile */}
            <Box
              sx={{
                boxShadow: '3px 2px 10px #cbcbcb',
                margin: '0.5rem',
                padding: '1rem',
                width: '350px',
                height: '350px',
                borderRadius: 5,
                display: 'flex',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                flexDirection: 'column',
              }}>
              {/* VJS Legend */}

              <Box
                sx={{
                  width: '70%',
                  display: 'flex',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                  margin: 1,
                }}>
                <CircleIcon
                  fontSize='small'
                  color={'success'}
                />{' '}
                {type == 'web'
                  ? 'Means SKU is Instock'
                  : 'Means SKU is Online'}
              </Box>
              {/* Web Legend */}
              <Box
                sx={{
                  width: '70%',
                  display: 'flex',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                  margin: 1,
                }}>
                <CircleIcon
                  fontSize='small'
                  color={'error'}
                />{' '}
                {type == 'web'
                  ? 'Means SKU is Not Instock'
                  : 'Means SKU is Not Online'}
              </Box>
              <Filters
                state={getInitialFilters()}
                setState={handleFilterChange}
                handleSubmit={handleSubmit}
                handleClear={handleClear}
                data={data.data}
                selection={selection}
                modalOpen={handleOpen}
                modalName={'Adjust Filters'}
                orientation={'column'}
              />
            </Box>

            {data.data?.length > 0 &&
              data.data.map((item) =>
                type == 'web' ? (
                  // Create Web Tiles
                  <Box
                    key={item.SKUCode}
                    sx={{
                      boxShadow: '1px 1px 0px #cbcbcb',
                      margin: '0.5rem',
                      padding: '1rem',
                      width: '350px',
                      height: '350px',
                      borderRadius: 5,
                      display: 'flex',
                      justifyContent: 'space-evenly',
                      alignItems: 'center',
                      flexDirection: 'column',
                    }}>
                    <Box
                      sx={{
                        display: 'flex',
                        width: '100%',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      <CircleIcon
                        fontSize='small'
                        color={
                          item.StockQty == 1 &&
                          item.Purchasable == 1 &&
                          item.Hidden == 0
                            ? 'success'
                            : 'error'
                        }
                      />
                      <IconButton
                        onClick={() => {
                          setSelection([...selection, item]);
                        }}>
                        <FavoriteIcon
                          color={
                            selection.filter(
                              (sku) => sku.SKUCode === item.SKUCode
                            ).length > 0
                              ? 'error'
                              : ''
                          }
                        />
                      </IconButton>
                    </Box>
                    <Image
                      sku={item.SKUCode}
                      size='small'
                      initialState={'web'}
                    />
                    <strong>{item.SKUCode}</strong>
                    <strong>
                      {USDollar.format(item.CustPrice)} |{' '}
                      {USDollar.format(item.TagPrice)}
                    </strong>
                    <strong>{item.StyleGrossWt} G</strong>
                  </Box>
                ) : (
                  // Create VJS Tile
                  <Box
                    key={item.sku_no}
                    sx={{
                      boxShadow: '1px 1px 0px #cbcbcb',
                      margin: '0.5rem',
                      padding: '1rem',
                      width: '350px',
                      height: '350px',
                      borderRadius: 5,
                      display: 'flex',
                      justifyContent: 'space-evenly',
                      alignItems: 'center',
                      flexDirection: 'column',
                    }}>
                    <Box
                      sx={{
                        display: 'flex',
                        width: '100%',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      <CircleIcon
                        fontSize='small'
                        color={
                          item.onlineStockQty == 1 &&
                          item.onlinePurchasable == 1 &&
                          item.onlineHidden == 0
                            ? 'success'
                            : 'error'
                        }
                      />
                      <IconButton
                        onClick={() => {
                          setSelection([...selection, item]);
                        }}>
                        <FavoriteIcon
                          color={
                            selection.filter(
                              (sku) => sku.sku_no === item.sku_no
                            ).length > 0
                              ? 'error'
                              : ''
                          }
                        />
                      </IconButton>
                    </Box>
                    <Image
                      sku={item.sku_no}
                      size='small'
                    />
                    <strong>
                      {item.sku_no} | {USDollar.format(item.retail)} |{' '}
                      {item.ven_code}
                    </strong>
                    <strong>{item.desc}</strong>
                    <strong>
                      {item.store_code} |{' '}
                      {new Date(item.date).toLocaleDateString()}
                    </strong>
                    {/* <strong>
                    {USDollar.format(item.CustPrice)} |{' '}
                    {USDollar.format(item.TagPrice)}
                  </strong>
                   */}
                  </Box>
                )
              )}
          </Box>
        </Box>
      ) : (
        <ReportSelector />
      )}
    </Common>
  );
}
