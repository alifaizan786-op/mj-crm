import React from 'react';
import { useParams } from 'react-router-dom';
import Image from '../../components/Image';
import Loader from '../../components/Loader';
import MultiCodeInfoCard from '../../components/MultiCodeInfoCard';
import MultiInfoSection from '../../components/MultiInfoSection';
import MultiSkuSection from '../../components/MultiSkuSection';
import MultiFetch from '../../fetch/MultiFetch';
import SizingFetch from '../../fetch/SizingFetch';
import WebsiteFetch from '../../fetch/WebsiteFetch';

import {
  Box,
  FormGroup,
  Stack,
  styled,
  Switch,
  Typography,
} from '@mui/material';
import Common from '../../layouts/common';

const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      width: 15,
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(9px)',
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: 2,
    '&.Mui-checked': {
      transform: 'translateX(12px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.primary.light, // Light color when ON
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(['width'], {
      duration: 200,
    }),
  },
  '& .MuiSwitch-track': {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: theme.palette.primary.main, // Dark color when OFF
    boxSizing: 'border-box',
  },
}));

export default function MultiInfo() {
  const { MultiCode } = useParams();
  const [multiData, setMultiData] = React.useState({
    loading: true,
    data: [],
  });
  const [websiteData, setWebsiteData] = React.useState({
    loading: true,
    data: [],
  });
  const [sizingData, setSizingData] = React.useState({
    loading: true,
    data: [],
  });
  const [section, setSection] = React.useState('MultiData');

  const [handleEditClick, setHandleEditClick] = React.useState(false);

  function updateHandleEditClick() {
    setHandleEditClick(true);
    setTimeout(() => {
      setHandleEditClick(false);
    }, 0); // Delay can be adjusted or removed if unnecessary
  }

  React.useEffect(() => {
    async function getData() {
      const getWebsiteData = await WebsiteFetch.getSkuByMulti(
        MultiCode
      );
      setWebsiteData({
        loading: false,
        data: getWebsiteData,
      });

      const getMultiData = await MultiFetch.getOneMulti(MultiCode);
      setMultiData({
        loading: false,
        data: {
          ...getMultiData,
          totalSku: websiteData.data.length,
          HiddenSku: websiteData.data.filter(
            (item) => item.Hidden === true
          ).length,
          AvailableSku: websiteData.data.filter(
            (item) => item.Purchasable === true
          ).length,
        },
      });

      const getSizingData = await SizingFetch.getSkuByMultiCode(
        MultiCode
      );
      setSizingData({
        loading: false,
        data: getSizingData,
      });
    }

    getData();
  }, []);

  React.useEffect(() => {
    async function updateMultiStats() {
      try {
        const updateMultiCode = await MultiFetch.updateMulti(
          MultiCode,
          {
            totalSku: websiteData.data.length,
            HiddenSku: websiteData.data.filter(
              (item) => item.Hidden === true
            ).length,
            AvailableSku: websiteData.data.filter(
              (item) => item.Purchasable === true
            ).length,
          }
        );
      } catch (error) {
        console.log(error);
      }
    }

    updateMultiStats();
  }, [websiteData.data]);

  return (
    <Common>
      {multiData.loading && <Loader size={75} />}
      {websiteData.loading == false && multiData.loading == false && (
        <Box
          sx={{
            marginTop: '1rem',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-evenly',
            alignContent: 'space-evenly',
            alignItems: 'center',
          }}>
          <Image
            imageName={multiData.data.image[0]}
            initialState='web'
            size='medium'
            boxSize={300}
          />

          <MultiCodeInfoCard
            updateHandleEditClick={updateHandleEditClick}
            setHandleEditClick={setHandleEditClick}
            handleEditClick={handleEditClick}
            multiCode={multiData.data.multiCode}
            totalSkus={websiteData.data.length}
            hiddenSku={
              websiteData.data.filter((item) => item.Hidden === true)
                .length
            }
            purchasableSku={
              websiteData.data.filter(
                (item) => item.Purchasable === true
              ).length
            }
          />
        </Box>
      )}
      <FormGroup
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '0.75rem 0',
        }}>
        <Stack
          direction='row'
          spacing={2}
          sx={{ alignItems: 'center' }}>
          <Typography
            sx={{
              opacity: section == 'MultiData' ? 1 : 0.5,
            }}>
            Multi Info
          </Typography>
          <AntSwitch
            checked={section == 'WebsiteData' ? true : false}
            onChange={() => {
              section == 'WebsiteData'
                ? setSection('MultiData')
                : setSection('WebsiteData');
            }}
          />
          <Typography
            sx={{
              opacity: section == 'WebsiteData' ? 1 : 0.5,
            }}>
            Website SKU Data
          </Typography>
        </Stack>
      </FormGroup>

      {websiteData.loading && <Loader size={75} />}

      {websiteData.loading == false &&
        multiData.loading == false &&
        section == 'WebsiteData' && (
          <MultiSkuSection websiteData={websiteData} />
        )}

      {websiteData.loading == false &&
        multiData.loading == false &&
        section == 'MultiData' && (
          <MultiInfoSection
            websiteData={websiteData}
            multiData={multiData}
            sizingData={sizingData}
            updateHandleEditClick={updateHandleEditClick}
            setHandleEditClick={setHandleEditClick}
            handleEditClick={handleEditClick}
          />
        )}
    </Common>
  );
}
