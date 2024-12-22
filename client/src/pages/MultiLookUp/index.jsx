import { Box } from '@mui/material';
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeGrid } from 'react-window';
import Filters from '../../components/Filters';
import Image from '../../components/Image';
import Loader from '../../components/Loader';
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
  const Cell = ({ columnIndex, rowIndex, style }) => {
    const itemIndex = rowIndex * COLUMN_COUNT + columnIndex;
    const multi = allMulti.data[itemIndex];

    if (!multi) return null; // Guard for empty cells

    return (
      <Box
        style={style}
        key={itemIndex}>
        <Link
          to={`/WebTools/Multi?MulitCode=${multi.multiCode}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textDecoration: 'none',
            margin: '1rem',
          }}>
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
            <Image
              initialState={'web'}
              size={'small'}
              imageName={multi.image[0]}
            />
            <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              Multi Code: <strong>{multi.multiCode}</strong>
            </p>
          </Box>
        </Link>
      </Box>
    );
  };

  return (
    <Common>
      <>
        {attributes.length > 0 && (
          <Filters
            state={getInitialFilters()}
            setState={handleFilterChange}
            handleSubmit={handleSubmit}
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
            <Box
              sx={{
                height: '82vh',
              }}>
              <AutoSizer>
                {({ height, width }) => (
                  <div>
                    <FixedSizeGrid
                      columnCount={COLUMN_COUNT}
                      rowCount={Math.ceil(
                        allMulti.data.length / COLUMN_COUNT
                      )}
                      columnWidth={width / COLUMN_COUNT - 5} // Use numeric width
                      rowHeight={400} // Use numeric height
                      height={height - 20}
                      width={width}
                      overscanRowCount={50} // Render 2 extra rows outside the viewport
                    >
                      {Cell}
                    </FixedSizeGrid>
                  </div>
                )}
              </AutoSizer>
            </Box>
          </>
        )}
      </>
    </Common>
  );
}
