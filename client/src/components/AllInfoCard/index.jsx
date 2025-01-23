import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';
import Image from '../../components/Image';
import USDollar from '../../utils/USDollar';
import camelCaseToNormalCase from '../../utils/camelCaseToNormalCase';

const CustomTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5), // Reduce padding
}));

const CustomTableRow = styled(TableRow)(({ theme }) => ({
  height: '30px', // Set a fixed height
}));

function valueChecker(valueOne, valueTwo, type, customCondition) {
  // Handle traditional three-parameter checks
  if (type === 'contains') {
    if (valueTwo.includes(valueOne) || valueOne.includes(valueTwo)) {
      return {
        valueIsCorrect: <CheckIcon fontSize='10px' />,
        style: {
          backgroundColor: 'rgba(0, 255, 34, 0.1)',
        },
      };
    } else {
      return {
        valueIsCorrect: <CloseIcon fontSize='10px' />,
        style: {
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
        },
      };
    }
  } else if (type === 'exact') {
    if (valueOne === valueTwo) {
      return {
        valueIsCorrect: <CheckIcon fontSize='10px' />,
        style: {
          backgroundColor: 'rgba(0, 255, 34, 0.1)',
        },
      };
    } else {
      return {
        valueIsCorrect: <CloseIcon fontSize='10px' />,
        style: {
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
        },
      };
    }
  } else if ((valueOne == null, valueTwo == null, type == null)) {
    if (customCondition) {
      return {
        valueIsCorrect: <CheckIcon fontSize='10px' />,
        style: {
          backgroundColor: 'rgba(0, 255, 34, 0.1)',
        },
      };
    } else {
      return {
        valueIsCorrect: <CloseIcon fontSize='10px' />,
        style: {
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
        },
      };
    }
  }

  // Default return for invalid input
  return {
    valueIsCorrect: null,
    style: {},
  };
}

export default function AllInfoCard({ index, setIndex, data }) {
  const handleKeyDown = (event) => {
    switch (event.code) {
      case 'ArrowUp':
      case 'ArrowRight':
      case 'ArrowRight':
        index < data.length - 1 ? setIndex(index + 1) : setIndex(0);
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowLeft':
        index === 0 ? setIndex(data.length - 1) : setIndex(index - 1);
        break;
      default:
        break;
    }
  };

  const handleWheel = (event) => {
    if (event.deltaY > 0) {
      // Scroll down
      index === 0 ? setIndex(data.length - 1) : setIndex(index - 1);
    } else if (event.deltaY < 0) {
      // Scroll up
      index < data.length - 1 ? setIndex(index + 1) : setIndex(0);
    }
  };

  React.useEffect(() => {
    document.body.addEventListener('wheel', handleWheel);
    return () => {
      document.body.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  function webChecker(element) {
    if (data[index].WEB?.SKUCode) {
      return element;
    }
  }

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-evenly',
        flexDirection: 'column',
      }}>
      <Box
        sx={{
          width: '100%',
          marginTop: '0.5rem',
          display: 'flex',
          justifyContent: 'space-evenly',
          minHeight: '50%',
        }}>
        {/* JS Image */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}>
          <Image
            sku={data[index].WEB.SKUCode}
            boxSize={450}
            initialState={'js'}
            showArrow={false}
          />
        </Box>
        {/* Main Info */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}>
          <TableContainer>
            <Table
              size='small'
              sx={{ maxWidth: 850 }}>
              <TableHead>
                <CustomTableRow>
                  <CustomTableCell></CustomTableCell>
                  <CustomTableCell align='center'>
                    <strong>Shop Keeper</strong>{' '}
                  </CustomTableCell>
                  <CustomTableCell align='center'>
                    <strong>MalaniJewelers.com</strong>
                  </CustomTableCell>
                  <CustomTableCell></CustomTableCell>
                </CustomTableRow>
              </TableHead>
              <TableBody>
                <CustomTableRow
                  sx={{
                    height: 30,
                    ...valueChecker(
                      data[index].VJS.sku_no,
                      data[index].WEB.SKUCode,
                      'exact'
                    ).style,
                  }}>
                  <CustomTableCell sx={{ py: 0.25 }}>
                    <strong>SKU</strong>
                  </CustomTableCell>
                  <CustomTableCell align='center'>
                    {data[index].VJS.sku_no}
                  </CustomTableCell>
                  {webChecker(
                    <>
                      <CustomTableCell align='center'>
                        {data[index].WEB.SKUCode}
                      </CustomTableCell>
                      <CustomTableCell align='center'>
                        {
                          valueChecker(
                            data[index].VJS.sku_no,
                            data[index].WEB.SKUCode,
                            'exact'
                          ).valueIsCorrect
                        }
                      </CustomTableCell>
                    </>
                  )}
                </CustomTableRow>
                <CustomTableRow>
                  <CustomTableCell>
                    <strong>Description</strong>
                  </CustomTableCell>
                  <CustomTableCell align='center'>
                    {data[index].VJS.desc}
                    <br />
                    {data[index].VJS.desc2}
                  </CustomTableCell>
                  {webChecker(
                    <>
                      <CustomTableCell align='center'>
                        {data[index].WEB.StyleDesc}
                      </CustomTableCell>
                    </>
                  )}
                </CustomTableRow>
                <CustomTableRow
                  style={
                    valueChecker(
                      data[index].VJS.weight,
                      data[index].WEB.StyleGrossWt,
                      'exact'
                    ).style
                  }>
                  <CustomTableCell>
                    <strong>Total Weight</strong>
                  </CustomTableCell>
                  <CustomTableCell align='center'>
                    {data[index].VJS.weight}
                  </CustomTableCell>
                  {webChecker(
                    <>
                      <CustomTableCell align='center'>
                        {data[index].WEB.StyleGrossWt}
                      </CustomTableCell>
                      <CustomTableCell align='center'>
                        {
                          valueChecker(
                            data[index].VJS.weight,
                            data[index].WEB.StyleGrossWt,
                            'exact'
                          ).valueIsCorrect
                        }
                      </CustomTableCell>
                    </>
                  )}
                </CustomTableRow>
                <CustomTableRow
                  style={
                    valueChecker(
                      data[index].VJS.ven_code,
                      data[index].WEB.Vendor,
                      'exact'
                    ).style
                  }>
                  <CustomTableCell>
                    <strong>Vendor</strong>
                  </CustomTableCell>
                  <CustomTableCell align='center'>
                    {data[index].VJS.ven_code}
                  </CustomTableCell>
                  {webChecker(
                    <>
                      <CustomTableCell align='center'>
                        {data[index].WEB.Vendor}
                      </CustomTableCell>
                      <CustomTableCell align='center'>
                        {
                          valueChecker(
                            data[index].VJS.ven_code,
                            data[index].WEB.Vendor,
                            'exact'
                          ).valueIsCorrect
                        }
                      </CustomTableCell>
                    </>
                  )}
                </CustomTableRow>
                <CustomTableRow
                  style={
                    valueChecker(
                      data[index].VJS.vndr_style,
                      data[index].WEB.VendStyleCode,
                      'exact'
                    ).style
                  }>
                  <CustomTableCell>
                    <strong>Vendor Style</strong>
                  </CustomTableCell>
                  <CustomTableCell align='center'>
                    {data[index].VJS.vndr_style}
                  </CustomTableCell>
                  {webChecker(
                    <>
                      <CustomTableCell align='center'>
                        {data[index].WEB.VendStyleCode}
                      </CustomTableCell>
                      <CustomTableCell align='center'>
                        {
                          valueChecker(
                            data[index].VJS.vndr_style,
                            data[index].WEB.VendStyleCode,
                            'exact'
                          ).valueIsCorrect
                        }
                      </CustomTableCell>
                    </>
                  )}
                </CustomTableRow>
                <CustomTableRow
                  style={
                    valueChecker(
                      data[index].VJS.retail,
                      data[index].WEB.TagPrice,
                      'exact'
                    ).style
                  }>
                  <CustomTableCell>
                    <strong>Tag Price</strong>
                  </CustomTableCell>

                  <CustomTableCell align='center'>
                    {USDollar.format(data[index].VJS.retail)}
                  </CustomTableCell>
                  {webChecker(
                    <>
                      <CustomTableCell align='center'>
                        {USDollar.format(data[index].WEB.TagPrice)}
                      </CustomTableCell>
                      <CustomTableCell align='center'>
                        {
                          valueChecker(
                            data[index].VJS.retail,
                            data[index].WEB.TagPrice,
                            'exact'
                          ).valueIsCorrect
                        }
                      </CustomTableCell>
                    </>
                  )}
                </CustomTableRow>
                <CustomTableRow
                  style={
                    valueChecker(
                      parseInt(data[index].VJS.class_34),
                      parseInt(data[index].WEB.Minorcode),
                      'exact'
                    ).style
                  }>
                  <CustomTableCell>
                    <strong>Minor Code</strong>
                  </CustomTableCell>
                  <CustomTableCell align='center'>
                    {data[index].VJS.class_34}
                  </CustomTableCell>
                  {webChecker(
                    <>
                      <CustomTableCell align='center'>
                        {data[index].WEB.Minorcode}
                      </CustomTableCell>
                      <CustomTableCell align='center'>
                        {
                          valueChecker(
                            parseInt(data[index].VJS.class_34),
                            parseInt(data[index].WEB.Minorcode),
                            'exact'
                          ).valueIsCorrect
                        }
                      </CustomTableCell>
                    </>
                  )}
                </CustomTableRow>
                <CustomTableRow
                  style={
                    valueChecker(
                      data[index].VJS.class_12,
                      data[index].WEB.ClassCode,
                      'exact'
                    ).style
                  }>
                  <CustomTableCell>
                    <strong>Major Code</strong>
                  </CustomTableCell>
                  <CustomTableCell align='center'>
                    {data[index].VJS.class_12}
                  </CustomTableCell>
                  {webChecker(
                    <>
                      <CustomTableCell align='center'>
                        {data[index].WEB.ClassCode}
                      </CustomTableCell>
                      <CustomTableCell align='center'>
                        {
                          valueChecker(
                            data[index].VJS.class_12,
                            data[index].WEB.ClassCode,
                            'exact'
                          ).valueIsCorrect
                        }
                      </CustomTableCell>
                    </>
                  )}
                </CustomTableRow>
                <CustomTableRow
                  style={
                    valueChecker(
                      data[index].VJS.date
                        ? new Date(data[index].VJS.date)
                            .toISOString()
                            .split('T')[0]
                        : '',
                      data[index].WEB.StyleEntryDate
                        ? new Date(data[index].WEB.StyleEntryDate)
                            .toISOString()
                            .split('T')[0]
                        : '',
                      'exact'
                    ).style
                  }>
                  <CustomTableCell>
                    <strong>Date</strong>
                  </CustomTableCell>
                  <CustomTableCell align='center'>
                    {data[index].VJS.date
                      ? new Date(data[index].VJS.date)
                          .toISOString()
                          .split('T')[0]
                      : 'Invalid Date'}
                  </CustomTableCell>
                  {webChecker(
                    <>
                      <CustomTableCell align='center'>
                        {data[index].WEB.StyleEntryDate
                          ? new Date(data[index].WEB.StyleEntryDate)
                              .toISOString()
                              .split('T')[0]
                          : 'Invalid Date'}
                      </CustomTableCell>
                      <CustomTableCell align='center'>
                        {
                          valueChecker(
                            data[index].VJS.date
                              ? new Date(data[index].VJS.date)
                                  .toISOString()
                                  .split('T')[0]
                              : '',
                            data[index].WEB.StyleEntryDate
                              ? new Date(
                                  data[index].WEB.StyleEntryDate
                                )
                                  .toISOString()
                                  .split('T')[0]
                              : '',
                            'exact'
                          ).valueIsCorrect
                        }
                      </CustomTableCell>
                    </>
                  )}
                </CustomTableRow>

                <CustomTableRow
                  style={
                    valueChecker(
                      null,
                      null,
                      null,
                      (data[index].VJS.status == 'sold out' &&
                        data[index].WEB.Hidden == true &&
                        data[index].WEB.Purchasable == false &&
                        data[index].WEB.StockQty == 0) ||
                        ((data[index].VJS.status.startsWith(
                          'available'
                        ) ||
                          data[index].VJS.status.startsWith(
                            'in-transit'
                          )) &&
                          data[index].WEB.Hidden == false &&
                          data[index].WEB.Purchasable == true &&
                          data[index].WEB.StockQty == 1)
                    ).style
                  }>
                  <CustomTableCell>
                    <strong>Status</strong>
                  </CustomTableCell>
                  <CustomTableCell align='center'>
                    {data[index].VJS.status}
                  </CustomTableCell>
                  {webChecker(
                    <>
                      <CustomTableCell align='center'>
                        {data[index].WEB.Hidden == false &&
                        data[index].WEB.Purchasable == true &&
                        data[index].WEB.StockQty == 1
                          ? 'Live / On Show'
                          : 'Not Live / Not On Show'}
                      </CustomTableCell>
                      <CustomTableCell>
                        {
                          valueChecker(
                            null,
                            null,
                            null,
                            (data[index].VJS.status == 'sold out' &&
                              data[index].WEB.Hidden == true &&
                              data[index].WEB.Purchasable == false &&
                              data[index].WEB.StockQty == 0) ||
                              ((data[index].VJS.status.startsWith(
                                'available'
                              ) ||
                                data[index].VJS.status.startsWith(
                                  'in-transit'
                                )) &&
                                data[index].WEB.Hidden == false &&
                                data[index].WEB.Purchasable == true &&
                                data[index].WEB.StockQty == 1)
                          ).valueIsCorrect
                        }
                      </CustomTableCell>
                    </>
                  )}
                </CustomTableRow>
                <CustomTableRow>
                  <CustomTableCell colSpan={3}>
                    {data[index].WEB.StyleLongDesc}
                  </CustomTableCell>
                </CustomTableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        {/* WEB IMAGE */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}>
          <Image
            sku={data[index].WEB.SKUCode}
            boxSize={400}
            initialState={'web'}
            showArrow={false}
          />
        </Box>
      </Box>
      {data[index].WEB?.SKUCode && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-evenly',
          }}>
          {data[index].VJS.class_12 > 230 &&
            data[index].VJS.class_12 <
            (
              <DynamicTable
                tableTitle={'Diamond Info'}
                width={450}
                NoOfColumns={3}
                data={data[index]}
                rows={[
                  {
                    key: 'DiamondTotalWeight',
                    valueCheck: (value) => {
                      return valueChecker(
                        value,
                        `${data[index].VJS.desc || ''} ${
                          data[index].VJS.desc2 || ''
                        }`,
                        'contains'
                      );
                    },
                  },
                  {
                    key: 'DiamondTotalPcs',
                    valueCheck: (value) => {
                      return valueChecker(
                        value,
                        `${data[index].VJS.desc || ''} ${
                          data[index].VJS.desc2 || ''
                        }`,
                        'contains'
                      );
                    },
                  },
                  {
                    key: 'DiamondClarity',
                    valueCheck: (value) => {
                      return valueChecker(
                        value,
                        `${data[index].VJS.desc || ''} ${
                          data[index].VJS.desc2 || ''
                        }`,
                        'contains'
                      );
                    },
                  },
                  {
                    key: 'DiamondColor',
                    valueCheck: (value) => {
                      return valueChecker(
                        value.split('-').join(''),
                        `${data[index].VJS.desc || ''} ${
                          data[index].VJS.desc2 || ''
                        }`,
                        'contains'
                      );
                    },
                  },

                  {
                    key: 'DiamondType',
                  },
                  {
                    key: 'IsGIACertified',
                    valueCheck: (value) => {
                      return valueChecker(
                        value ? 'GIA' : '',
                        `${data[index].VJS.desc || ''} ${
                          data[index].VJS.desc2 || ''
                        }`,
                        'contains'
                      );
                    },
                  },
                  {
                    key: 'Cert',
                    valueCheck: (value) => {
                      return valueChecker(
                        value,
                        `${data[index].VJS.desc || ''} ${
                          data[index].VJS.desc2 || ''
                        }`,
                        'contains'
                      );
                    },
                  },
                  {
                    key: 'CertNo',
                    valueCheck: (value) => {
                      return valueChecker(
                        value,
                        `${data[index].VJS.desc || ''} ${
                          data[index].VJS.desc2 || ''
                        }`,
                        'contains'
                      );
                    },
                  },
                ]}
              />
            )}

          <DynamicTable
            tableTitle={'Basic Info'}
            width={450}
            NoOfColumns={3}
            data={data[index]}
            rows={[
              {
                key: 'Finish',
              },
              {
                key: 'Color',
              },
              {
                key: 'NumberOfPcs',
              },
              {
                key: 'Length',
                formatter: (value) => `${value}"`,
              },
              {
                key: 'Width',
                formatter: (value) => `${value}"`,
              },
              {
                key: 'ChainIncludedInPrice',
              },
              {
                key: 'ChainLength',
                formatter: (value) => `${value}"`,
              },
              {
                key: 'PendantLength',
                formatter: (value) => `${value}"`,
              },
              {
                key: 'PendantWidth',
                formatter: (value) => `${value}"`,
              },
              {
                key: 'EarringLength',
                formatter: (value) => `${value}"`,
              },
              {
                key: 'EarringWidth',
                formatter: (value) => `${value}"`,
              },
              {
                key: 'EarringPostType',
              },
              {
                key: 'RingSize',
              },
              {
                key: 'RingDesignHeight',
                formatter: (value) => `${value}"`,
              },
              {
                key: 'RingWidth',
                formatter: (value) => `${value}"`,
              },
              {
                key: 'RingType',
              },
              {
                key: 'BangleSize',
              },

              {
                key: 'BangleInnerDiameter',
                formatter: (value) => `${value}"`,
              },
              {
                key: 'BangleWidth',
                formatter: (value) => `${value}"`,
              },
              {
                key: 'BangleDesignHeight',
                formatter: (value) => `${value}"`,
              },
              {
                key: 'BangleBraceletType',
              },
              {
                key: 'BangleBraceletSizeAdjustableUpTo',
              },
              {
                key: 'NosePinType',
              },
            ]}
          />

          <DynamicTable
            tableTitle={'Flags'}
            width={450}
            NoOfColumns={3}
            data={data[index]}
            rows={[
              {
                key: 'IsCloseOut',
                formatter: (value) => (value ? 'True' : 'False'),
              },
              {
                key: 'IsNewArrived',
                formatter: (value) => (value ? 'True' : 'False'),
              },
              {
                key: 'IsHotSeller',
                formatter: (value) => (value ? 'True' : 'False'),
              },
              {
                key: 'ShowPriceFallFlag',
                formatter: (value) => (value ? 'True' : 'False'),
              },
              {
                key: 'Purchasable',
                formatter: (value) => (value ? 'True' : 'False'),
                valueCheck: (value) =>
                  valueChecker(
                    null,
                    null,
                    null,
                    data[index].VJS.status !== 'sold out' &&
                      value == true
                  ),
              },
              {
                key: 'Hidden',
                formatter: (value) => (value ? 'True' : 'False'),
                valueCheck: (value) =>
                  valueChecker(
                    null,
                    null,
                    null,
                    data[index].VJS.status !== 'sold out' &&
                      value == false
                  ),
              },
              {
                key: 'AutoUpdatePrice',
                formatter: (value) => (value ? 'True' : 'False'),
                valueCheck: (value) => {
                  return valueChecker(
                    null,
                    null,
                    null,
                    [
                      28, 77, 150, 500, 501, 98, 101, 102, 104, 108,
                      110,
                    ].includes(data[index].VJS.class_12) == !value
                  );
                },
              },
              {
                key: 'ShowRetailPrice',
                formatter: (value) => (value ? 'True' : 'False'),
                valueCheck: (value) => {
                  return valueChecker(
                    null,
                    null,
                    null,
                    (data[index].VJS.class_12 > 230 &&
                      data[index].VJS.class_12 < 499) == value
                  );
                },
              },
            ]}
          />

          <DynamicTable
            tableTitle={'Pricing & Category'}
            width={450}
            NoOfColumns={3}
            data={data[index]}
            rows={[
              {
                key: 'CategoryHierarchy',
              },
              {
                key: 'GoldKarat',
              },
              {
                key: 'JewelryFor',
              },
              {
                key: 'JewelryType',
                valueCheck: (value) => {
                  return valueChecker(
                    null,
                    null,
                    null,
                    (data[index].VJS.class_12 > 230 &&
                      data[index].VJS.class_12 < 499 &&
                      value == 'Diamonds') ||
                      (data[index].VJS.class_12 > 0 &&
                        data[index].VJS.class_12 < 229 &&
                        value == 'Gold') ||
                      (data[index].VJS.class_12 > 0 &&
                        data[index].VJS.class_12 < 229 &&
                        value == 'Gemstones') ||
                      (data[index].VJS.class_12 > 0 &&
                        data[index].VJS.class_12 < 229 &&
                        value == 'Antique')
                  );
                },
              },
              {
                key: 'StyleGrossWt',
                formatter: (value) => `${value} Grams`,
              },
              {
                key: 'TagPrice',
                formatter: (value) => USDollar.format(value),
              },
              {
                key: 'StockQty',
                formatter: (value) => value.toString(),
              },
              {
                key: 'CustPrice',
                formatter: (value) => USDollar.format(value),
              },
              {
                key: 'PerGramOrDisc',
              },
              {
                key: 'DC',
              },
              {
                key: 'SearchUploadDate',
              },
            ]}
          />
        </Box>
      )}
    </Box>
  );
}

const DynamicTable = ({
  tableTitle,
  width,
  NoOfColumns,
  data,
  rows,
}) => {
  return (
    <TableContainer
      sx={{
        border: '1px solid black',
        maxWidth: 450,
      }}>
      <Table
        size='small'
        sx={{ maxWidth: width }}>
        <TableHead>
          <CustomTableRow>
            <CustomTableCell
              align='center'
              colSpan={NoOfColumns}>
              <strong>{tableTitle}</strong>
            </CustomTableCell>
          </CustomTableRow>
        </TableHead>
        <TableBody>
          {rows.map((item, index) => {
            if (data.WEB[item.key] !== null) {
              return (
                <CustomTableRow
                  key={index}
                  style={
                    item.valueCheck
                      ? item.valueCheck(data.WEB[item.key]).style
                      : {}
                  }>
                  <CustomTableCell>
                    {camelCaseToNormalCase(item.key)}
                  </CustomTableCell>
                  <CustomTableCell>
                    {item.formatter
                      ? item.formatter(data.WEB[item.key] || '')
                      : data.WEB[item.key] || ''}
                  </CustomTableCell>
                  {item.valueCheck && (
                    <CustomTableCell>
                      {
                        item.valueCheck(data.WEB[item.key])
                          .valueIsCorrect
                      }
                    </CustomTableCell>
                  )}
                </CustomTableRow>
              );
            }
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
