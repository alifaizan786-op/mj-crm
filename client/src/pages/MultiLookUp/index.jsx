import { Box, Typography } from '@mui/material';
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Filters from '../../components/Filters';
import Image from '../../components/Image';
import Loader from '../../components/Loader';
import NewMultiModal from '../../components/NewMultiModal';
import VirtualList from '../../components/VirtualList';
import AttributeFetch from '../../fetch/AttributeFetch';
import MultiFetch from '../../fetch/MultiFetch';
import Common from '../../layouts/common';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50vw',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function MultiLookUp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allMulti, setAllMulti] = React.useState({
    loading: true,
    data: [],
  });
  const [attributes, setAttributes] = React.useState([]);
  const [filter, setFilter] = React.useState({
    vendorCode: '',
    majorCode: '',
    colorCode: '',
  });
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  async function getData() {
    const data = await MultiFetch.getAllMulti();
    setAllMulti({
      loading: false,
      data: data,
    });
  }

  React.useEffect(() => {
    getData();
  }, []);

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
    getData();
  };

  const handleSubmit = async (event) => {
    setAllMulti({
      loading: true,
      data: [],
    });
    if (event) event.preventDefault();

    let queryString = '?';
    const params = new URLSearchParams(searchParams);

    for (const [key, value] of params.entries()) {
      if (value) {
        queryString += `${
          queryString.length > 1 ? '&' : ''
        }${key}=${value}`;
      }
    }

    const filteredData = await MultiFetch.getMultiByQuery(
      queryString
    );
    setAllMulti({ loading: false, data: filteredData });
  };

  const getInitialFilters = () => {
    const filters = {};
    for (const [key, value] of searchParams.entries()) {
      filters[key] = value.split(',');
    }
    return filters;
  };

  const COLUMN_COUNT = 4; // Adjust based on your design

  // Render each item in the grid
  const CellContent = ({ index, styles }) => {
    const multi = allMulti.data[index];

    if (!multi) return null; // Guard for empty cells

    return (
      <Box
        style={styles}
        key={multi._id}>
        <Box
          sx={{
            width: '20vw',
            aspectRatio: '1/1',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            border: '0.01rem solid #ddd',
            borderRadius: '8px',
          }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              alignItems: 'center',
              width: '100%',
            }}>
            <Typography
              variant='body1'
              color='error'>
              <strong>{multi.AvailableSku}</strong>
            </Typography>

            <Typography
              variant='body1'
              color='green'>
              <strong> {multi.HiddenSku}</strong>
            </Typography>

            <Typography variant='body1'>
              <strong> {multi.totalSku}</strong>
            </Typography>
          </Box>
          <Image
            initialState={'web'}
            size={'small'}
            imageName={multi.image[0]}
          />
          <Link
            to={`/Merchandise/Multi/${multi.multiCode}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textDecoration: 'none',
              margin: '1rem',
            }}>
            <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              Multi Code: <strong>{multi.multiCode}</strong>
            </p>
          </Link>
        </Box>
      </Box>
    );
  };

  return (
    <Common>
      <>
        <NewMultiModal
          open={open}
          onClose={handleClose}
        />
        {attributes.length > 0 && (
          <Filters
            state={getInitialFilters()}
            setState={handleFilterChange}
            handleSubmit={handleSubmit}
            modalName={'newMulti'}
            modalOpen={handleClickOpen}
            handleClear={handleClear}
            filters={[
              {
                name: 'vendorCode',
                options: attributes.filter(
                  (item) => item.title === 'Vendors'
                )[0]?.options,
                label: 'vendorCode',
                stateId: 'vendorCode',
                type: 'autocomplete',
              },

              {
                name: 'majorCode',
                options: attributes.filter(
                  (item) => item.title === 'Classcodes'
                )[0]?.options,
                label: 'majorCode',
                stateId: 'majorCode',
                type: 'autocomplete',
              },
              {
                name: 'colorCode',
                options: attributes.filter(
                  (item) => item.title === 'JewelryColor'
                )[0]?.options,
                label: 'colorCode',
                stateId: 'colorCode',
                type: 'autocomplete',
              },
            ]}
          />
        )}
        {allMulti.loading ||
        !Array.isArray(allMulti.data) ||
        allMulti.data.length === 0 ? (
          <Loader size={75} />
        ) : (
          <>

            <VirtualList
              CellContent={CellContent}
              height={'78vh'}
              dataLength={allMulti.data.length}
            />
          </>
        )}
      </>
    </Common>
  );
}
