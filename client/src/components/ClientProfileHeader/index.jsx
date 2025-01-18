import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Skeleton,
  Typography,
} from '@mui/material';
import React from 'react';
import CalculateAge from '../../utils/CalculateAge';
import FormatPhone from '../../utils/FormatPhone';
import ProperCase from '../../utils/ProperCase';
import StringToColor from '../../utils/StringToColor';
import USDollar from '../../utils/USDollar';

export default function ClientProfileHeader({ data }) {
  const buttonOptions = {
    size: 'small',
    variant: 'outlined',
    sx: {
      margin: '0 5px',
      bgcolor: 'white',
      width: '100px',
    },
  };

  return (
    <Box
      sx={{
        bgcolor: 'white',
        height: '25%',
      }}>
      <Box
        sx={{
          bgcolor: 'grey.200',
          height: '50%',
          display: 'flex',
          flexDirection: 'row',
          gap: 5,
          alignItems: 'center',
          padding: '0px 30px',
          justifyContent: 'space-between',
        }}>
        {/* Client Name */}
        <Box
          sx={{
            width: '30%',
            display: 'flex',
            flexDirection: 'row',
            gap: 3,
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}>
          {data.loading ? (
            <Skeleton
              variant='circular'
              width={60}
              height={60}
            />
          ) : (
            <Avatar
              sx={{
                bgcolor: StringToColor(
                  `${data.data.first?.[0] || ''}${
                    data.data.last?.[0] || ''
                  }`
                ),
                width: 60,
                height: 60,
                fontSize: 25,
              }}>
              {data.data.first?.[0] || ''}
              {data.data.last?.[0] || ''}
            </Avatar>
          )}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
            }}>
            <Typography
              variant='caption'
              align='left'>
              {data.loading ? <Skeleton width='50%' /> : 'Client'}
            </Typography>
            <Typography
              variant='h4'
              align='left'>
              {data.loading ? (
                <Skeleton width='80%' />
              ) : (
                `${ProperCase(data.data.first)} ${ProperCase(
                  data.data.last
                )}`
              )}
            </Typography>
          </Box>
        </Box>
        {/* Buttons */}
        <Box>
          {['Follow', 'Edit', 'Share'].map((text, index) => (
            <Button
              {...buttonOptions}
              startIcon={
                index === 0 ? (
                  <AddIcon fontSize='small' />
                ) : index === 1 ? (
                  <EditOutlinedIcon fontSize='small' />
                ) : (
                  <ShareOutlinedIcon fontSize='small' />
                )
              }
              key={text}
              disabled={data.loading}>
              {data.loading ? <Skeleton width='50%' /> : text}
            </Button>
          ))}
        </Box>
      </Box>
      <Box
        sx={{
          height: '50%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          padding: '0px 50px',
          justifyContent: 'space-evenly',
        }}>
        {[
          { value: data.data.email, heading: 'Email' },
          { value: FormatPhone(data.data.home), heading: 'Phone' },
          {
            value: `${ProperCase(data.data.city || '')}, ${
              data.data.state || ''
            }-${
              data.data.zip && typeof data.data.zip === 'string'
                ? data.data.zip.split('-')[0]
                : 'N/A'
            }`,
            heading: 'Address',
          },
          { value: data.data.bp_earned, heading: 'Reward Point' },
          {
            value: USDollar.format(data.data.py_purch),
            heading: 'Total Purchase Value',
          },
          {
            value:
              CalculateAge(data.data.date_added)?.years + ' Years',
            heading: 'Since',
          },
          { value: data.data.purchvisit, heading: 'Visits' },
          { value: data.data.clerk, heading: 'Clerk' },
          {
            value:
              CalculateAge(data.data.last_purch)?.years +
              ' Years Ago',
            heading: 'Last Visit',
          },
        ].map((item, index) => (
          <Cell
            key={index}
            heading={item.heading}
            content={
              data.loading ? (
                <Skeleton width={150} />
              ) : (
                item.value || 'N/A'
              )
            }
            divider={true}
          />
        ))}
      </Box>
    </Box>
  );
}

const Cell = ({ heading, content, divider }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 1,
      }}>
      {divider && (
        <Divider
          orientation='vertical'
          flexItem
          sx={{
            color: 'primary.main',
            borderColor: 'primary.main',
          }}
        />
      )}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}>
        <Typography
          variant='caption'
          align='left'>
          {heading}
        </Typography>
        <Typography
          variant='h6'
          align='left'>
          {content}
        </Typography>
      </Box>
    </Box>
  );
};
