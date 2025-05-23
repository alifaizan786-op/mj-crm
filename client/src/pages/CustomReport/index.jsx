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
import VirtualList from '../../components/VirtualList';
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
        // Extract and assign PriceMin and PriceMax to custPrice
        const custPrice = {
          min:
            Array.isArray(filters.PriceMin) && filters.PriceMin[0] > 0
              ? filters.PriceMin[0]
              : 0,
          max:
            Array.isArray(filters.PriceMax) && filters.PriceMax[0] > 0
              ? filters.PriceMax[0]
              : 999999,
        };

        // Remove PriceMin and PriceMax from filters
        delete filters.PriceMin;
        delete filters.PriceMax;
        const reportData = await WebsiteFetch.reportBuilder({
          ...filters,
          custPrice,
        });
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

  const VjsCellContent = ({ index, styles }) => {
    const item = data.data[index];

    if (!item) return null; // Guard for empty cells

    return (
      <Box
        key={item.sku_no}
        style={styles}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            flexDirection: 'column',
            width: '85%',
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
        </Box>
      </Box>
    );
  };

  const WebCellContent = ({ index, styles }) => {
    const item = data.data[index];

    if (!item) return null; // Guard for empty cells

    return (
      <Box
        key={item.SKUCode}
        style={styles}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          border: '1px solid black',
        }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            flexDirection: 'column',
            width: '85%',
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
      </Box>
    );
  };

  // Function to load more items when the 50th (or subsequent trigger items) is visible

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
                        type: 'autocomplete',
                      },
                      {
                        name: 'Jewelry Type',
                        options: attributes.filter(
                          (item) => item.title === 'Jewelry Type'
                        )[0]?.options,
                        label: 'Jewelry Type',
                        multiple: true,
                        stateId: 'Styles.AttribField115',
                        type: 'autocomplete',
                      },
                      {
                        name: 'Classcodes',
                        options: attributes.filter(
                          (item) => item.title === 'Classcodes'
                        )[0]?.options,
                        label: 'classCode',
                        multiple: true,
                        stateId: 'ClassCodes.ClassCode',
                        type: 'autocomplete',
                      },
                      {
                        name: 'Categories',
                        options: attributes.filter(
                          (item) => item.title === 'Categories'
                        )[0]?.options,
                        label: 'Categories',
                        multiple: true,
                        stateId: 'CategoryHierarchy',
                        type: 'autocomplete',
                      },
                      {
                        name: 'Years',
                        options: attributes.filter(
                          (item) => item.title === 'Years'
                        )[0]?.options,
                        label: 'Years',
                        multiple: true,
                        stateId: 'Years',
                        type: 'autocomplete',
                      },
                      {
                        name: 'Purchasable',
                        options: [0, 1],
                        label: 'Purchasable',
                        multiple: true,
                        stateId: 'Purchasable',
                        type: 'autocomplete',
                      },
                      {
                        name: 'StockQty',
                        options: [0, 1],
                        label: 'StockQty',
                        multiple: true,
                        stateId: 'StockQty',
                        type: 'autocomplete',
                      },
                      {
                        name: 'Hidden',
                        options: [0, 1],
                        label: 'Hidden',
                        multiple: true,
                        stateId: 'Hidden',
                        type: 'autocomplete',
                      },
                      {
                        name: 'PriceMin',
                        label: 'PriceMin',
                        multiple: false,
                        stateId: 'PriceMin',
                        type: 'text',
                      },
                      {
                        name: 'PriceMax',
                        label: 'PriceMax',
                        multiple: false,
                        stateId: 'PriceMax',
                        type: 'text',
                      },
                      {
                        name: 'Sort',
                        options: attributes.filter(
                          (item) => item.title === 'Sort'
                        )[0]?.options,
                        label: 'Sort',
                        multiple: false,
                        stateId: 'sort',
                        type: 'autocomplete',
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
                        type: 'autocomplete',
                      },

                      {
                        name: 'Classcodes',
                        options: attributes.filter(
                          (item) => item.title === 'Classcodes'
                        )[0]?.options,
                        label: 'classCode',
                        multiple: true,
                        stateId: 'class_12',
                        type: 'autocomplete',
                      },

                      {
                        name: 'Store',
                        options: attributes.filter(
                          (item) => item.title === 'store'
                        )[0]?.options,
                        label: 'Location',
                        multiple: true,
                        stateId: 'store_code',
                        type: 'autocomplete',
                      },

                      {
                        name: 'Years',
                        options: attributes.filter(
                          (item) => item.title === 'Years'
                        )[0]?.options,
                        label: 'Years',
                        multiple: true,
                        stateId: 'date',
                        type: 'autocomplete',
                      },

                      {
                        name: 'StockQty',
                        options: [0, 1],
                        label: 'StockQty',
                        multiple: true,
                        stateId: 'loc_qty1',
                        type: 'autocomplete',
                      },

                      {
                        name: 'Sort',
                        options: attributes.filter(
                          (item) => item.title === 'Sort'
                        )[0]?.options,
                        label: 'Sort',
                        multiple: false,
                        stateId: 'sort',
                        type: 'autocomplete',
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
          <Box>
            {/* Legend */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                margin: 1,
                flexDirection: 'row',
              }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                  margin: 1,
                  flexDirection: 'row',
                  width: '15%',
                }}>
                <CircleIcon
                  fontSize='small'
                  color={'success'}
                />{' '}
                {type == 'web'
                  ? 'Means SKU is Instock'
                  : 'Means SKU is Online'}
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                  margin: 1,
                  flexDirection: 'row',
                  width: '15%',
                }}>
                <CircleIcon
                  fontSize='small'
                  color={'error'}
                />{' '}
                {type == 'web'
                  ? 'Means SKU is Not Instock'
                  : 'Means SKU is Not Online'}
              </Box>
            </Box>
            {/* Options */}
            <Filters
              state={getInitialFilters()}
              setState={handleFilterChange}
              // handleSubmit={handleSubmit}
              handleClear={handleClear}
              data={data.data}
              selection={selection}
              modalOpen={handleOpen}
              modalName={'Adjust Filters'}
              orientation={'row'}
            />
          </Box>
          {/* Vitual List */}
          {data.data?.length > 0 && type == 'web' ? (
            // Create Web Tiles
            <VirtualList
              CellContent={WebCellContent}
              height={'81.5vh'}
              dataLength={data.data.length}
            />
          ) : (
            // Create VJS Tile
            <VirtualList
              CellContent={VjsCellContent}
              height={'81.5vh'}
              dataLength={data.data.length}
            />
          )}
        </Box>
      ) : (
        <ReportSelector />
      )}
    </Common>
  );
}
