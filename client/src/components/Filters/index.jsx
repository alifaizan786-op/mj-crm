'use client';
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  TextField,
} from '@mui/material';
import React from 'react';
import DownloadExcel from '../DownloadExcel';

export default function Filters({
  state,
  setState,
  filters,
  handleSubmit,
  handleClear,
  initialState,
  submitDisabled,
  allowExport,
  data,
  handleNew,
  selection,
  modalOpen,
  modalName,
  orientation,
  hideSubmit,
}) {
  const handleChange = (event, stateId) => {
    console.log(stateId, event.target.value);
    // setState({ ...state, stateId: event.target.value });
  };
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexWrap: 'wrap',
        width: '100%',
        height: '100%',
        marginY: '10px',
        minHeight: '2rem',
        flexDirection: orientation || 'row',
      }}>
      {filters?.length > 0 &&
        filters.map((item, index) => (
          <FormControl key={index}>
            <Autocomplete
              size='small'
              disablePortal
              multiple={item.multiple}
              options={item.options}
              sx={{ width: 300, marginX: '1rem', marginY: '1rem' }}
              onChange={(event, value) => {
                setState({ ...state, [item.stateId]: value });
              }}
              getOptionLabel={(option) => String(option)}
              value={
                state[item.stateId] || (item.multiple ? [] : null)
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  size='small'
                  label={item.name}
                />
              )}
            />
          </FormControl>
        ))}

      {/* Submit */}
      {handleSubmit && (
        <FormControl>
          <Button
            size='medium'
            variant='outlined'
            onClick={handleSubmit}
            disabled={submitDisabled}>
            Submit
          </Button>
        </FormControl>
      )}
      {/* Clear */}
      {handleClear && (
        <FormControl>
          <Button
            size='medium'
            variant='outlined'
            onClick={handleClear}>
            Clear
          </Button>
        </FormControl>
      )}
      {modalName?.length > 0 && (
        <FormControl>
          <Button
            size='medium'
            variant='outlined'
            onClick={modalOpen}>
            {modalName}
          </Button>
        </FormControl>
      )}

      {data?.length > 0 && (
        <DownloadExcel
          data={data}
          name={`Export ${data.length}`}
        />
      )}
      {selection?.length > 0 && (
        <DownloadExcel
          data={selection}
          name={'Export Selection'}
        />
      )}
    </Box>
  );
}
