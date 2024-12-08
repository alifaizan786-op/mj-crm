import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import React from 'react';
import OpenToBuyTable from '../../components/OpenToBuyTable';
import Common from '../../layouts/common';

export default function OpenToBuy() {
  const [locations, setLocations] = React.useState([
    {
      store: 'MalaniJewelers.com',
      storeAbrev: 'WEB',
      showBase: true,
      displayTable: true,
    },
    {
      store: 'Wholesale',
      storeAbrev: 'WS',
      showBase: false,
      displayTable: true,
    },
    {
      store: 'Atlanta',
      storeAbrev: 'ATL',
      showBase: false,
      displayTable: true,
    },
    {
      store: 'Tampa',
      storeAbrev: 'TPA',
      showBase: false,
      displayTable: false,
    },
    {
      store: 'Dallas',
      storeAbrev: 'DAL',
      showBase: false,
      displayTable: false,
    },
  ]);

  const handleCheckboxClick = (index) => {
    setLocations((prevLocations) =>
      prevLocations.map((location, i) =>
        i === index
          ? { ...location, displayTable: !location.displayTable }
          : location
      )
    );
  };

  return (
    <Common>
      <FormGroup
        aria-label='position'
        row
        sx={{
          width: '100%',
          display: 'flex',
          alignContent: 'flex-start',
          justifyContent: 'space-evenly',
          alignItems: 'flex-start',
        }}>
        {locations.map((location, index) => (
          <FormControlLabel
            key={index}
            value={location.store}
            control={
              <Checkbox
                checked={location.displayTable}
                onClick={() => handleCheckboxClick(index)}
              />
            }
            label={location.store}
            labelPlacement='end'
          />
        ))}
      </FormGroup>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignContent: 'flex-start',
          justifyContent: 'space-evenly',
          alignItems: 'flex-start',
        }}>
        {locations.map(
          (table, index) =>
            table.displayTable && (
              <OpenToBuyTable
                key={index}
                store={table.store}
                storeAbrev={table.storeAbrev}
                showBase={table.showBase}
              />
            )
        )}
      </Box>
    </Common>
  );
}
