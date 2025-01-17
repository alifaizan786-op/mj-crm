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
import VirtualList from '../../components/VirtualList';
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

  const handleSubmit = () => {
    const filteredData = videoData.data.filter((item) => {
      if (
        filterOptions.Classcodes &&
        item.Classcode !== filterOptions.Classcodes
      ) {
        return false;
      }
      return true;
    });

    setVideoData({
      loading: false,
      data: filteredData,
    });
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

  const CellContent = ({ index, styles }) => {
    const item = videoData.data[index];

    if (!item) return null;

    return (
      <Box
        key={item._id}
        style={styles}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          alignItems: 'center',
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
            onClick={() => handleClick(item.SKUCode, 'html')}>
            <CodeOutlinedIcon />
          </IconButton>
          <IconButton
            onClick={() => handleClick(item.SKUCode, 'jpeg')}>
            <CameraAltOutlinedIcon />
          </IconButton>
          <IconButton
            onClick={() => handleClick(item.SKUCode, 'mp4')}>
            <VideoCameraBackOutlinedIcon />
          </IconButton>
        </Stack>
      </Box>
    );
  };

  return (
    <Common>
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
        ]}
      />
      {videoData.loading ? (
        <Loader />
      ) : (
        <VirtualList
          CellContent={CellContent} // Pass as a prop
          height={'80vh'}
          dataLength={videoData.data.length}
        />
      )}

      {/* Modal for displaying item details */}
      <Modal
        open={open}
        onClose={handleClose}>
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
              {sku.type === 'html' && 'Interactive Video'}
              {sku.type === 'jpeg' && 'Image'}
              {sku.type === 'mp4' && 'Video'}
            </Typography>
          </Box>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {sku.type === 'html' && (
              <iframe
                height={700}
                width={700}
                loading='lazy'
                src={
                  videoData.data.find(
                    (item) => item.SKUCode === sku.sku
                  )?.video.html
                }
                frameBorder='0'></iframe>
            )}
            {sku.type === 'jpeg' && (
              <img
                height={700}
                width={700}
                loading='lazy'
                src={
                  videoData.data.find(
                    (item) => item.SKUCode === sku.sku
                  )?.video.image
                }
              />
            )}
            {sku.type === 'mp4' && (
              <video
                height={700}
                width={700}
                autoPlay
                loop>
                <source
                  src={
                    videoData.data.find(
                      (item) => item.SKUCode === sku.sku
                    )?.video.video
                  }
                  type='video/mp4'
                />
                Your browser does not support the video tag.
              </video>
            )}
          </Box>
          <Tooltip title={copied ? 'Copied!' : 'Copy'}>
            <IconButton
              onClick={() => {
                navigator.clipboard
                  .writeText(
                    ` ${
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
      </Modal>
    </Common>
  );
}
