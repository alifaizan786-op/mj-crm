import { Box } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeGrid } from 'react-window';
import Image from '../../components/Image';
import Loader from '../../components/Loader';
import MultiFetch from '../../fetch/MultiFetch';
import Common from '../../layouts/common';

export default function MultiLookUp() {
  const [allMulti, setAllMulti] = React.useState({
    loading: true,
    data: [],
  });

  React.useEffect(() => {
    async function getData() {
      const data = await MultiFetch.getAllMulti();
      setAllMulti({
        loading: false,
        data: data,
      });
    }

    getData();
  }, []);

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
      {allMulti.loading ? (
        <Loader size={75} />
      ) : (
        <Box
          sx={{
            height: '92vh',
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
      )}
    </Common>
  );
}
