import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VideoCameraBackOutlinedIcon from '@mui/icons-material/VideoCameraBackOutlined';
import {
  Box,
  Divider,
  IconButton,
  Modal,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import React from 'react';
import Filters from '../../components/Filters';
import Loader from '../../components/Loader';
import AttributeFetch from '../../fetch/AttributeFetch';
import SizingFetch from '../../fetch/SizingFetch';
import Common from '../../layouts/common';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 1000,
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 5,
};

export default function Video() {
  const [videoData, setVideoData] = React.useState({
    loading: true,
    data: [],
  });
  const [attributes, setAttribute] = React.useState({
    loading: true,
    Classcodes: [],
  });
  const [filterOptions, setFilterOptions] = React.useState({});
  const [open, setOpen] = React.useState(false);
  const [sku, setSku] = React.useState({
    sku: '',
    type: '',
  });
  const [copied, setCopied] = React.useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const getData = async () => {
    try {
      const getVideoData = await SizingFetch.getVideoData();
      setVideoData({
        loading: false,
        data: getVideoData,
      });

      const getClasscodeData =
        await AttributeFetch.getAttributeByTitle('Classcodes');

      setAttribute({
        loading: false,
        Classcodes: getClasscodeData.options,
      });
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    getData();
  }, []);

  const handleSubmit = () => {
    // Preserve the current data before clearing the state
    const originalData = [...videoData.data];

    // Reset the state to show the loader and clear the current data
    setVideoData({
      loading: true,
      data: [], // Temporarily clear the data
    });

    // Clone the preserved data for processing
    let filteredData = [...originalData];

    // Filter by Classcodes
    if (filterOptions.Classcodes) {
      filteredData = filteredData.filter(
        (item) => item.Classcode == filterOptions.Classcodes
      );
    }

    // Sort based on the selected option
    // Sort based on the selected option
    if (filterOptions.Sort) {
      switch (filterOptions.Sort) {
        case 'Date : Old To New':
          filteredData.sort(
            (a, b) => new Date(a.Date) - new Date(b.Date)
          );
          break;
        case 'Date : New To Old':
          filteredData.sort(
            (a, b) => new Date(b.Date) - new Date(a.Date)
          );
          break;
        case 'Class : High To Low':
          filteredData.sort((a, b) => b.Classcode - a.Classcode);
          break;
        case 'Class : Low To High':
          filteredData.sort((a, b) => a.Classcode - b.Classcode);
          break;
        default:
          break;
      }
    }

    // Simulate a delay for the loader (optional) and update state
    setTimeout(() => {
      setVideoData({
        loading: false,
        data: filteredData,
      });
    }, 500); // Optional delay to enhance the loading effect
  };

  const handleClear = () => {
    setFilterOptions({});
    getData();
  };

  const handleClick = (sku, type) => {
    setSku({
      sku: sku,
      type: type,
    });
    setOpen(true);
  };

  console.log(sku);
  console.log();

  return (
    <Common>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-evenly',
        }}>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby='modal-modal-title'
          aria-describedby='modal-modal-description'>
          <Box sx={style}>
            <Box
              sx={{
                width: '100%',
                bgcolor: 'primary.light',
                borderRadius: 5,
              }}>
              <Typography
                variant='h5'
                component='h2'
                textAlign='center'
                sx={{ p: 0.5, color: 'primary.main' }}>
                {sku.type == 'html' && 'Interactive Video'}
                {sku.type == 'jpeg' && 'Image'}
                {sku.type == 'mp4' && 'Video'}
              </Typography>
            </Box>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {sku.type == 'html' && (
                <iframe
                  height={700}
                  width={700}
                  loading='lazy'
                  src={
                    videoData.data.filter(
                      (item) => item.SKUCode == sku.sku
                    )[0].video.html
                  }
                  frameborder='0'></iframe>
              )}
              {sku.type == 'jpeg' && (
                <img
                  height={700}
                  width={700}
                  loading='lazy'
                  src={
                    videoData.data.filter(
                      (item) => item.SKUCode == sku.sku
                    )[0].video.image
                  }
                />
              )}

              {sku.type == 'mp4' && (
                <video
                  height={700}
                  width={700}
                  autoPlay
                  loop>
                  <source
                    src={
                      videoData.data.filter(
                        (item) => item.SKUCode == sku.sku
                      )[0].video.video
                    }
                    type='video/mp4'
                  />
                  Your browser does not support the video tag.
                </video>
              )}

              <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                <IconButton
                  onClick={() => {
                    navigator.clipboard
                      .writeText(
                        `${
                          sku.type == 'html'
                            ? videoData.data.filter(
                                (item) => item.SKUCode == sku.sku
                              )[0].video.html
                            : ''
                        }${
                          sku.type == 'jpeg'
                            ? videoData.data.filter(
                                (item) => item.SKUCode == sku.sku
                              )[0].video.image
                            : ''
                        }${
                          sku.type == 'mp4'
                            ? videoData.data.filter(
                                (item) => item.SKUCode == sku.sku
                              )[0].video.video
                            : ''
                        }`
                      )
                      .then(() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
                      });
                  }}>
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Modal>
        <Filters
          state={filterOptions}
          setState={setFilterOptions}
          handleSubmit={handleSubmit}
          handleClear={handleClear}
          filters={[
            {
              name: 'Classcodes',
              options: attributes.Classcodes,
              label: 'Classcodes',
              multiple: false,
              stateId: 'Classcodes',
              type: 'autocomplete',
            },
            {
              name: 'Sort',
              options: [
                'Date : Old To New',
                'Date : New To Old',
                'Class : High To Low',
                'Class : Low To High',
              ],
              label: 'Sort',
              multiple: false,
              stateId: 'Sort',
              type: 'autocomplete',
            },
          ]}
        />
        {videoData.loading && <Loader />}
        {videoData.loading != true &&
          videoData.data.length > 0 &&
          videoData.data.map((item) => (
            <Box
              key={item._id}
              sx={{
                width: '350px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                margin: '1rem',
              }}>
              <img
                width={300}
                src={item.video.image}
                alt=''
                loading='lazy'
              />
              <p>{item.SKUCode}</p>
              <Stack
                direction='row'
                spacing={2}
                divider={<Divider orientation='vertical' />}>
                <IconButton
                  onClick={() => {
                    handleClick(item.SKUCode, 'html');
                  }}>
                  <CodeOutlinedIcon />
                </IconButton>
                <IconButton
                  onClick={() => {
                    handleClick(item.SKUCode, 'jpeg');
                  }}>
                  <CameraAltOutlinedIcon />
                </IconButton>
                <IconButton
                  onClick={() => {
                    handleClick(item.SKUCode, 'mp4');
                  }}>
                  <VideoCameraBackOutlinedIcon />
                </IconButton>
              </Stack>
            </Box>
          ))}
      </Box>
    </Common>
  );
}
