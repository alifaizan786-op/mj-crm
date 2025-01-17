import { Box } from '@mui/material';
import React from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeGrid } from 'react-window';

export default function VirtualList({
  CellContent, // Ensure CellContent is passed as a prop
  height,
  dataLength,
}) {
  function calculateStyling() {
    let windowWidthTotal = window.innerWidth;

    let NoOfColumns = Math.floor(windowWidthTotal / 400);

    return {
      windowWidthTotal,
      NoOfColumns,
    };
  }

  const gridStyling = calculateStyling();

  const COLUMN_COUNT = gridStyling.NoOfColumns; // Number of columns
  const ROW_GAP = 30; // Gap between rows in pixels
  const COLUMN_GAP = 45; // Gap between columns in pixels

  return (
    <Box
      sx={{
        height: height,
        width: '100%',
      }}>
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeGrid
            columnCount={COLUMN_COUNT}
            rowCount={Math.ceil(dataLength / COLUMN_COUNT)}
            columnWidth={width / COLUMN_COUNT - 40}
            rowHeight={400}
            height={height}
            width={width}
            overscanRowCount={2}>
            {({ columnIndex, rowIndex, style }) => {
              const index = rowIndex * COLUMN_COUNT + columnIndex;

              // Calculate custom styles
              const styles = {
                ...style,
                left:
                  columnIndex === 0
                    ? style.left + COLUMN_GAP
                    : Number(style.left) + columnIndex * COLUMN_GAP,
                top:
                  rowIndex === 0
                    ? style.top
                    : Number(style.top) + rowIndex * ROW_GAP,
              };

              return (
                <CellContent
                  index={index}
                  styles={styles} // Pass calculated styles
                />
              );
            }}
          </FixedSizeGrid>
        )}
      </AutoSizer>
    </Box>
  );
}
