import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LockIcon from '@mui/icons-material/Lock';

import LockOpenIcon from '@mui/icons-material/LockOpen';
import {
  Autocomplete,
  Box,
  Divider,
  FormControl,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { indigo, teal } from '@mui/material/colors';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Loader from '../../components/Loader';
import AttributeFetch from '../../fetch/AttributeFetch';
import InvFetch from '../../fetch/InvFetch';
import MultiFetch from '../../fetch/MultiFetch';
import SizingFetch from '../../fetch/SizingFetch';
import Common from '../../layouts/common';
import USDollar from '../../utils/USDollar';

export default function ViewSKU() {
  const [edit, setEdit] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const [VJSData, setVJSData] = React.useState({
    loading: true,
    data: {},
  });
  const [searchParams, setSearchParams] = useSearchParams();

  const [sizingData, setSizingData] = React.useState({
    loading: true,
    data: {
      GoldKT: '',
      Color: '',
      'Jewelry For': '',
      'Jewelry Type': '',
      'Number of Pcs': '',
      Length: '',
      Width: '',
      'Chain included in the price': '',
      'Chain Length': '',
      'Pendant Length': '',
      'Pendant Width': '',
      'Earrings Length': '',
      'Earrings Width': '',
      'Earring Post Type': '',
      'Ring Size': '',
      'Ring Design Height': '',
      'Ring Width': '',
      'Ring Type': '',
      'Bangle Size': '',
      'Bangle/Bracelet Size Adjustable up-to': '',
      'Bangle Inner Diameter': '',
      'Bangle Width': '',
      'Bangle Design Height': '',
      'Bangle/Bracelet Type': '',
      'Diamond Type': '',
      'Diamond Total Weight': '',
      'Diamond Total Pcs': '',
      'Diamond Clarity': '',
      'Diamond Color': '',
      'Center Diamond Weight': '',
      IsGIACertified: '',
      'Certificate#': '',
      'Nose Pin Type': '',
      'Changeable Stones Included': '',
      'Gemstones Weight': '',
      'Chain Length(#28-40 and 360-365)': '',
      StyleMultiCode: '',
      Disclaimer: '',
    },
  });

  const [attributeData, setAttribute] = React.useState([]);

  const colorTeal = (power) => teal[power]; // VJS
  const colorIndigo = (power) => indigo[power]; // Sizing

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
    async function getData() {
      const SKU = searchParams.get('sku');
      if (!SKU) {
        console.error('SKU parameter is missing');
        return;
      }

      const SKUsArray = SKU.split(' ');

      try {
        const getAttributes = await AttributeFetch.getAllAttributes();
        if (getAttributes) {
          setAttribute(getAttributes);
        }
        const getVjsData = await InvFetch.reportBySku([
          SKUsArray[index],
        ]);
        if (getVjsData) {
          setVJSData({
            loading: false,
            data: getVjsData[0],
          });
        }
        const getSizingData = await SizingFetch.getUploadingData([
          SKUsArray[index],
        ]);
        setSizingData({
          loading: false,
          data: getSizingData[0]
            ? getSizingData[0]
            : {
                GoldKT: '',
                Color: '',
                'Jewelry For': '',
                'Jewelry Type': '',
                // ...rest of the default values
              },
        });
      } catch (error) {
        console.error(error);
      }
    }

    getData();
  }, [index]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (value) {
        params.set(name, value); // Update the parameter
      } else {
        params.delete(name); // Remove the parameter if value is empty
      }
      return params;
    });
  };

  function calculateAge(birthDateString) {
    const birthDate = new Date(birthDateString);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();

    // Adjust if the birth month hasn't occurred yet in the current year
    if (months < 0) {
      years--;
      months += 12;
    }

    return `${months} M, ${years} Y`;
  }

  const handleAutoFillSizing = async () => {
    if (
      sizingData.data.StyleMultiCode == null ||
      sizingData.data.StyleMultiCode == undefined
    ) {
      alert('Multi Code Is Missing');
    } else {
      const SKU = searchParams.get('sku');
      if (!SKU) {
        console.error('SKU parameter is missing');
        return;
      }

      const SKUsArray = SKU.split(' ');
      try {
        const multiDataFromMulti = await MultiFetch.getOneMulti(
          sizingData.data.StyleMultiCode
        );

        setSizingData({
          loading: false,
          data: {
            ...sizingData.data,
            ...multiDataFromMulti,
            Category: multiDataFromMulti.CategoryHierarchy?.split(
              '->'
            )[0]
              ? multiDataFromMulti.CategoryHierarchy.split('->')[0]
              : '',
            SubCategory:
              multiDataFromMulti.CategoryHierarchy?.trim() || '',
          },
        });

        const updateSizingData = await SizingFetch.updateSizing(
          SKUsArray[index],
          {
            ...sizingData.data,
            ...multiDataFromMulti,
            SKUCode: SKUsArray[index],
            Category: multiDataFromMulti.CategoryHierarchy?.split(
              '->'
            )[0]
              ? multiDataFromMulti.CategoryHierarchy.split('->')[0]
              : '',
            SubCategory:
              multiDataFromMulti.CategoryHierarchy?.trim() || '',
          }
        );

        console.log(updateSizingData);
      } catch (error) {
        console.log(error);
      }
    }
  };

  console.log(sizingData);

  return (
    <Common>
      <Grid
        container
        sx={{
          width: styling.containerWidth,
          justifyContent: 'center',
          alignContent: 'space-around',
          margin: '0 auto',
        }}>
        {/* SKU Form */}
        <Grid
          item
          xs={12 / styling.columns} // Use pre-calculated columns
        >
          <GridCell
            width={styling.boxWidth}
            dividerWidth={styling.dividerWidth}
            // Use consistent columns
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                justifyContent: 'space-evenly',
              }}>
              <TextField
                label='SKU...'
                name='sku'
                variant='outlined'
                size='small'
                onChange={handleChange} // Call handleChange on input change
                value={searchParams.get('sku') || ''} // Set the input value from searchParams
              />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  width: '100%',
                }}>
                <IconButton
                  disabled={edit}
                  onClick={() => {
                    setIndex(
                      index == 0
                        ? searchParams.get('sku').split(' ').length -
                            1
                        : index - 1
                    );
                  }}>
                  <ArrowBackIosIcon />
                </IconButton>
                <IconButton
                  disabled={edit}
                  onClick={() => {
                    setIndex(
                      index ==
                        searchParams.get('sku').split(' ').length - 1
                        ? 0
                        : index + 1
                    );
                  }}>
                  <ArrowForwardIosIcon />
                </IconButton>
                <IconButton onClick={() => setEdit(!edit)}>
                  {edit ? <LockOpenIcon /> : <LockIcon />}
                </IconButton>
                <IconButton onClick={handleAutoFillSizing}>
                  <AutoAwesomeIcon />
                </IconButton>
              </Box>
            </Box>
          </GridCell>
        </Grid>

        {[
          {
            value: VJSData.data.sku_no,
            label: `SKU Code ( ${VJSData.data.status} )`,
            color: colorTeal,
            edit: false,
          },
          {
            value: VJSData.data.desc,
            label: 'Description # 1',
            color: colorTeal,
            edit: false,
          },
          {
            value: VJSData.data.desc2,
            label: 'Description # 2',
            color: colorTeal,
            edit: false,
          },
          {
            value: VJSData.data.weight,
            label: 'Weight',
            color: colorTeal,
            edit: false,
          },
          {
            value: USDollar.format(VJSData.data.retail),
            label: `Tag Price`,
            color: colorTeal,
            edit: false,
          },
          {
            value: calculateAge(VJSData.data.date),
            label: `Age ( ${new Date(
              VJSData.data.date
            ).toLocaleDateString()} )`,
            color: colorTeal,
            edit: false,
          },
          {
            value: VJSData.data.ven_code,
            label: `Vendor`,
            color: colorTeal,
            edit: false,
          },
          {
            value: sizingData.data['StyleMultiCode'],
            label: 'StyleMultiCode',
            color: colorIndigo,
          },
          {
            value: sizingData.data['Category'],
            label: 'Category',
            color: colorIndigo,
            color: colorIndigo,
            options:
              attributeData.filter(
                (item) => item.title === 'Categories'
              )[0]?.options || [],
          },
          {
            value: sizingData.data['SubCategory'],
            label: 'Sub Category',
            color: colorIndigo,
            color: colorIndigo,
            options:
              attributeData.filter(
                (item) => item.title === 'Sub Categories'
              )[0]?.options || [],
          },
          {
            value: sizingData.data['GoldKT'],
            label: 'GoldKT',
            color: colorIndigo,
            options:
              attributeData.filter(
                (item) => item.title === 'GoldKt'
              )[0]?.options || [],
          },
          {
            value: sizingData.data['Color'],
            label: 'Color',
            color: colorIndigo,
            options:
              attributeData.filter(
                (item) => item.title === 'JewelryColor'
              )[0]?.options || [],
          },
          {
            value: sizingData.data['Jewelry For'],
            label: 'Jewelry For',
            color: colorIndigo,
            options:
              attributeData.filter(
                (item) => item.title === 'Jewelry For'
              )[0]?.options || [],
          },
          {
            value: sizingData.data['Jewelry Type'],
            label: 'Jewelry Type',
            color: colorIndigo,
            options:
              attributeData.filter(
                (item) => item.title === 'Jewelry Type'
              )[0]?.options || [],
          },
          {
            value: sizingData.data['Number of Pcs'],
            label: 'Number of Pcs',
            color: colorIndigo,
            options:
              attributeData.filter(
                (item) => item.title === 'Number of Pcs'
              )[0]?.options || [],
          },
          {
            value: sizingData.data['Length'],
            label: 'Length',
            color: colorIndigo,
          },
          {
            value: sizingData.data['Width'],
            label: 'Width',
            color: colorIndigo,
          },
          {
            value: sizingData.data['StyleDesc'],
            label: 'Style Desc',
            color: colorIndigo,
          },
          {
            value: sizingData.data['StyleLongDesc'],
            label: 'Style Long Desc',
            color: colorIndigo,
          },
          {
            value: sizingData.data['Chain included in the price'],
            label: 'Chain included in the price',
            color: colorIndigo,
            options:
              attributeData.filter(
                (item) => item.title === 'Chain Included'
              )[0]?.options || [],
          },
          {
            value: sizingData.data['Chain Length'],
            label: 'Chain Length',
            color: colorIndigo,
            options:
              attributeData.filter(
                (item) => item.title === 'Chain Length'
              )[0]?.options || [],
          },
          {
            value: sizingData.data['Pendant Length'],
            label: 'Pendant Length',
            color: colorIndigo,
          },
          {
            value: sizingData.data['Pendant Width'],
            label: 'Pendant Width',
            color: colorIndigo,
          },
          {
            value: sizingData.data['Earrings Length'],
            label: 'Earrings Length',
            color: colorIndigo,
          },
          {
            value: sizingData.data['Earrings Width'],
            label: 'Earrings Width',
            color: colorIndigo,
          },
          {
            value: sizingData.data['Earring Post Type'],
            label: 'Earring Post Type',
            color: colorIndigo,
            options:
              attributeData.filter(
                (item) => item.title === 'Earring Post Type'
              )[0]?.options || [],
          },
          {
            value: sizingData.data['Ring Size'],
            label: 'Ring Size',
            color: colorIndigo,
            options:
              attributeData.filter(
                (item) => item.title === 'Ring Size'
              )[0]?.options || [],
          },
          {
            value: sizingData.data['Ring Design Height'],
            label: 'Ring Design Height',
            color: colorIndigo,
          },
          {
            value: sizingData.data['Ring Width'],
            label: 'Ring Width',
            color: colorIndigo,
          },
          {
            value: sizingData.data['Ring Type'],
            label: 'Ring Type',
            color: colorIndigo,
            options:
              attributeData.filter(
                (item) => item.title === 'Ring Type'
              )[0]?.options || [],
          },
          {
            value: sizingData.data['Bangle Size'],
            label: 'Bangle Size',
            color: colorIndigo,
            options:
              attributeData.filter(
                (item) => item.title === 'Bangle Size'
              )[0]?.options || [],
          },
          {
            value:
              sizingData.data[
                'Bangle/Bracelet Size Adjustable up-to'
              ],
            label: 'Bangle/Bracelet Size Adjustable up-to',
            color: colorIndigo,
            options:
              attributeData.filter(
                (item) => item.title === 'Bangle Size'
              )[0]?.options || [],
          },
          {
            value: sizingData.data['Bangle Inner Diameter'],
            label: 'Bangle Inner Diameter',
            color: colorIndigo,
          },
          {
            value: sizingData.data['Bangle Width'],
            label: 'Bangle Width',
            color: colorIndigo,
          },
          {
            value: sizingData.data['Bangle Design Height'],
            label: 'Bangle Design Height',
            color: colorIndigo,
          },
          {
            value: sizingData.data['Bangle/Bracelet Type'],
            label: 'Bangle/Bracelet Type',
            color: colorIndigo,
            options:
              attributeData.filter(
                (item) => item.title === 'Bangle/Bracelet Type'
              )[0]?.options || [],
          },
          {
            value: sizingData.data['Diamond Type'],
            label: 'Diamond Type',
            color: colorIndigo,
            options:
              attributeData.filter(
                (item) => item.title === 'Diamond Type'
              )[0]?.options || [],
          },
          {
            value: sizingData.data['Diamond Total Weight'],
            label: 'Diamond Total Weight',
            color: colorIndigo,
          },
          {
            value: sizingData.data['Diamond Total Pcs'],
            label: 'Diamond Total Pcs',
            color: colorIndigo,
          },
          {
            value: sizingData.data['Diamond Clarity'],
            label: 'Diamond Clarity',
            color: colorIndigo,
            options:
              attributeData.filter(
                (item) => item.title === 'Diamond Clarity'
              )[0]?.options || [],
          },
          {
            value: sizingData.data['Diamond Color'],
            label: 'Diamond Color',
            color: colorIndigo,
            options:
              attributeData.filter(
                (item) => item.title === 'Diamond Color'
              )[0]?.options || [],
          },
          {
            value: sizingData.data['Center Diamond Weight'],
            label: 'Center Diamond Weight',
            color: colorIndigo,
          },
          {
            value: sizingData.data['IsGIACertified'],
            label: 'IsGIACertified',
            color: colorIndigo,
            options:
              attributeData.filter(
                (item) => item.title === 'IsGIACertified'
              )[0]?.options || [],
          },
          {
            value: sizingData.data['Certificate#'],
            label: 'Certificate#',
            color: colorIndigo,
          },
          {
            value: sizingData.data['Nose Pin Type'],
            label: 'Nose Pin Type',
            color: colorIndigo,
            options:
              attributeData.filter(
                (item) => item.title === 'Nose Pin Type'
              )[0]?.options || [],
          },
          {
            value: sizingData.data['Changeable Stones Included'],
            label: 'Changeable Stones Included',
            color: colorIndigo,
            options:
              attributeData.filter(
                (item) => item.title === 'Changeable Stones Included'
              )[0]?.options || [],
          },
          {
            value: sizingData.data['Gemstones Weight'],
            label: 'Gemstones Weight',
            color: colorIndigo,
          },
          {
            value:
              sizingData.data['Chain Length(#28-40 and 360-365)'],
            label: 'Chain Length(#28-40 and 360-365)',
            color: colorIndigo,
            options:
              attributeData.filter(
                (item) => item.title === 'Chain Length'
              )[0]?.options || [],
          },
          {
            value: sizingData.data['Disclaimer'],
            label: 'Disclaimer',
            color: colorIndigo,
            options:
              attributeData.filter(
                (item) => item.title === 'Disclaimer'
              )[0]?.options || [],
          },
        ].map((item, index) => (
          <Grid
            item
            xs={12 / styling.columns} // Use pre-calculated columns
            key={index}>
            <GridCell
              color={item.color}
              width={styling.boxWidth}
              dividerWidth={styling.dividerWidth}
              // isLastInRow={(index + 1) % styling.columns === 0} // Use consistent columns
            >
              {VJSData.loading == true ? (
                <Loader />
              ) : (
                <CellContent
                  setState={setSizingData}
                  state={sizingData}
                  edit={
                    item.edit !== undefined && item.edit !== null
                      ? item.edit
                      : edit
                  }
                  label={item.label}
                  value={item.value}
                  options={item.options}
                />
              )}
            </GridCell>
          </Grid>
        ))}
      </Grid>
    </Common>
  );
}

function GridCell({
  children,
  isLastInRow,
  width,
  dividerWidth,
  color = () => 'transparent', // Fallback to a no-op function
}) {
  const colorLight = color(50);
  const colorDark = color(500);

  return (
    <Box>
      {/* Item Child */}
      {isLastInRow ? (
        <Box
          sx={{
            minHeight: '100px',
            maxHeight: '100px',
            minWidth: `${width}px`,
            maxWidth: `${width}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colorLight,
          }}>
          {children}
        </Box>
      ) : (
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
              minWidth: `${width}px`,
              maxWidth: `${width}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colorLight,
            }}>
            {children}
          </Box>
          <Divider
            orientation='horizontal'
            sx={{
              border: '1px solid',
              borderColor:
                colorDark == 'transparent'
                  ? 'primary.main'
                  : colorDark,
              height: '90px',
              marginX: '10px',
              width: 0,
            }}
          />
        </Box>
      )}

      <Divider
        orientation='vertical'
        sx={{
          border: '1px solid',
          borderColor:
            colorDark == 'transparent' ? 'primary.main' : colorDark,
          width: dividerWidth,
          height: 0,
          marginY: '10px',
        }}
      />
    </Box>
  );
}

function CellContent({
  label,
  value,
  edit,
  setState,
  state,
  options,
}) {
  return edit ? (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        padding: '1rem',
        justifyContent: 'center',
      }}>
      {options ? (
        <FormControl>
          <Autocomplete
            size='small'
            disablePortal
            options={options}
            value={value || ''} // Fallback to an empty string
            onChange={(event, newValue) => {
              setState({
                loading: false,
                data: {
                  ...state.data,
                  [label.replace(/\s/g, '')]: newValue || '', // Replace spaces in label
                },
              });
            }}
            getOptionLabel={(option) => String(option || '')} // Handle undefined options
            isOptionEqualToValue={(option, value) => option === value} // Ensure equality check
            renderInput={(params) => (
              <TextField
                {...params}
                size='small'
                label={label}
              />
            )}
          />
        </FormControl>
      ) : (
        <FormControl>
          <TextField
            size='small'
            label={label}
            value={value || ''} // Ensure value is always a string
            onChange={(event) => {
              setState({
                loading: false,
                data: {
                  ...state.data,
                  [label.replace(/\s/g, '')]: event.target.value,
                },
              });
            }}
          />
        </FormControl>
      )}
    </Box>
  ) : (
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
        {label}
      </Typography>
      <Typography
        variant='h5'
        align='left'>
        {value}
      </Typography>
    </Box>
  );
}
