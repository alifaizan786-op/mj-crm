import { Box, Divider, Grid, Typography } from '@mui/material';
import React from 'react';
import MultiFetch from '../../fetch/MultiFetch';

export default function MultiInfoSection({
  websiteData,
  multiData,
  sizingData,
  updateHandleEditClick,
  setHandleEditClick,
  handleEditClick,
}) {
  const [edit, setEdit] = React.useState(false);
  const [extendedMultiInfo, setExtendedMultiInfo] = React.useState(
    multiData || {}
  );

  const getMajorityValues = (data) => {
    const result = {};

    // Iterate through each key in the object
    for (const [key, values] of Object.entries(data)) {
      const frequency = {};

      // Count the occurrences of each value
      values.forEach((value) => {
        frequency[value] = (frequency[value] || 0) + 1;
      });

      // Find the value with the highest count (majority)
      const majorityValue = Object.keys(frequency).reduce((a, b) =>
        frequency[a] > frequency[b] ? a : b
      );

      result[key] = majorityValue;
    }

    return result;
  };

  const updateExtendedMultiInfo = async () => {
    const MultiMasterData = {};

    if (websiteData.data) {
      const keysToIgnore = [
        'StyleDesc',
        'StyleLongDesc',
        'CategoryHierarchy',
      ];
      for (let i = 0; i < websiteData.data.length; i++) {
        const element_I = websiteData.data[i];
        const keys = Object.keys(element_I);

        for (let j = 0; j < keys.length; j++) {
          const element_J = keys[j];
          if (
            keysToIgnore.includes(element_J) &&
            !['', ``, '', null, undefined].includes(
              element_I[element_J]
            )
          ) {
            // Initialize array only if key doesn't exist
            if (!MultiMasterData[element_J]) {
              MultiMasterData[element_J] = [];
            }
            MultiMasterData[element_J].push(element_I[element_J]);
          }
        }
      }
    }

    if (sizingData.data) {
      const keysToIgnore = [
        'Date',
        'SKUCode',
        'Initial',
        'StyleMultiCode',
        '__v',
        '_id',
      ];
      for (let i = 0; i < sizingData.data.length; i++) {
        const element_I = sizingData.data[i];
        const keys = Object.keys(element_I);

        for (let j = 0; j < keys.length; j++) {
          const element_J = keys[j];
          if (
            !keysToIgnore.includes(element_J) &&
            !['', ``, '', null, undefined].includes(
              element_I[element_J]
            )
          ) {
            // Convert key to camel case
            const keyCamelCase = element_J
              .split(' ')
              .map((word, index) =>
                index === 0
                  ? word.toLowerCase()
                  : word.charAt(0).toUpperCase() + word.slice(1)
              )
              .join('');

            // Initialize array only if key doesn't exist
            if (!MultiMasterData[keyCamelCase]) {
              MultiMasterData[keyCamelCase] = [];
            }
            MultiMasterData[keyCamelCase].push(element_I[element_J]);
          }
        }
      }
    }

    setExtendedMultiInfo(getMajorityValues(MultiMasterData));

    const updateMultCode = await MultiFetch.updateMulti(
      multiData.data.multiCode,
      getMajorityValues(MultiMasterData)
    );

    window.location.reload();

    setExtendedMultiInfo(updateMultCode);
  };

  React.useEffect(() => {
    if (handleEditClick == true) {
      updateExtendedMultiInfo();
    }
  }, [handleEditClick]);

  function calculateStyling() {
    let windowWidthTotal = window.innerWidth - 20;
    let NoOfColumns = Math.floor(windowWidthTotal / 275);
    let noOfDivider = NoOfColumns - 1;
    let remainderWidth =
      windowWidthTotal - (NoOfColumns * 275 + noOfDivider * 26);
    let finalBoxWidth =
      Math.floor((remainderWidth / NoOfColumns + 275) / 5) * 5;
    let finalContainerWidth =
      NoOfColumns * finalBoxWidth + noOfDivider * 26;

    return {
      containerWidth: `${finalContainerWidth}px`,
      boxWidth: finalBoxWidth,
      columns: NoOfColumns,
      dividerWidth: `${finalBoxWidth - 10}px`,
    };
  }

  // Call calculateStyling once and store the result
  const styling = calculateStyling();

  React.useEffect(() => {
    setExtendedMultiInfo(multiData);
  }, [multiData]);

  return (
    <Grid
      container
      sx={{
        width: styling.containerWidth,
        justifyContent: 'center',
        alignContent: 'space-around',
        margin: '0 auto',
      }}>
      {Object.keys(extendedMultiInfo.data).map((key, index) => (
        <GridCell
          key={index}
          styling={styling}
          objKey={key}
          value={extendedMultiInfo.data[key]}
        />
      ))}
    </Grid>
  );
}

function GridCell({ styling, objKey, key, value }) {
  return (
    <Grid
      key={key}
      item
      xs={12 / styling.columns} // Use pre-calculated columns
    >
      <Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
          }}>
          {/* Item Content Holder */}
          <Box
            sx={{
              minHeight: '100px',
              maxHeight: '100px',
              minWidth: `${styling.boxWidth}px`,
              maxWidth: `${styling.boxWidth}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              // backgroundColor: colorLight,
            }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                padding: '1rem',
                justifyContent: 'flex-start',
              }}>
              <Typography
                variant='overline'
                display='block'
                align='left'
                gutterBottom
                sx={{
                  margin: 0,
                }}>
                {objKey}
              </Typography>
              <Typography
                variant='h5'
                align='left'>
                {value}
              </Typography>
            </Box>
          </Box>
          <Divider
            orientation='horizontal'
            sx={{
              border: '1px solid',
              borderColor: 'primary.main',
              height: '90px',
              marginX: '10px',
              width: 0,
            }}
          />
        </Box>
        <Divider
          orientation='vertical'
          sx={{
            border: '1px solid',
            borderColor: 'primary.main',
            width: styling.dividerWidth,
            height: 0,
            marginY: '10px',
          }}
        />
      </Box>
    </Grid>
  );
}
