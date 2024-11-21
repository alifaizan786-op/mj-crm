import { Avatar, Box, Tab, Tabs, Typography } from '@mui/material';
import React from 'react';
import { useParams } from 'react-router-dom';
import UserRightsForm from '../../components/UserRightsForm';
import UserFetch from '../../fetch/UserFetch';
import CommonLayout from '../../layouts/common';
import ProperCase from '../../utils/ProperCase';

export default function UserProfile() {
  const [userData, setUserData] = React.useState({});
  document.title = `BB | ${ProperCase(
    userData.firstName
  )} ${ProperCase(userData.lastName)} | Profile`;
  const { id } = useParams();

  React.useEffect(() => {
    const getUserData = async () => {
      const tempUserData = await UserFetch.getUserById(id);
      setUserData(tempUserData);
    };

    getUserData();
  }, []);

  const [activeTab, setActiveTab] = React.useState(0);

  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const getContent = () => {
    switch (value) {
      case 0:
        return <Typography>Info</Typography>;
      case 1:
        return <Typography>Clients</Typography>;
      case 2:
        return <Typography>Review</Typography>;
      case 3:
        return (
          <UserRightsForm
            userId={userData._id}
            rights={userData.views}
          />
        );
      default:
        return null;
    }
  };

  const RandImageArr = [
    '/images/themes/classic/banner-group-private-default.png',
    '/images/themes/classic/banner-group-public-default.png',
    '/images/themes/classic/banner-group-unlisted-default.png',
    '/images/themes/classic/banner-user-default.png',
    '/images/themes/oneSalesforce/banner-group-private-default.png',
    '/images/themes/oneSalesforce/banner-group-public-default.png',
    '/images/themes/oneSalesforce/banner-group-unlisted-default.png',
    '/images/themes/oneSalesforce/banner-user-default.png',
  ];
  const RandAvatarArr = [
    '/images/avatar1.jpg',
    '/images/avatar2.jpg',
    '/images/avatar3.jpg',
  ];

  return (
    <CommonLayout>
      <Box
        sx={{
          position: 'relative',
          textAlign: { xs: 'center', sm: 'left' },
          mb: 2,
        }}>
        {/* Cover Pic */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '200px',
            overflow: 'hidden',
          }}>
          <Box
            component='img'
            src='https://picsum.photos/1050/300'
            alt='Brand Background'
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, #103783, #9BAFD9)`,
              opacity: 0.7,
              pointerEvents: 'none',
            }}
          />
        </Box>
        {/* Profile Pic */}
        <Avatar
          src='/images/avatar1.jpg'
          sx={{
            width: 120,
            height: 120,
            position: 'absolute',
            top: 130,
            left: '50%',
            transform: 'translateX(-50%)',
            border: '4px solid white',
          }}
        />
        <Box
          sx={{
            mt: { xs: 8, sm: 0 },
            mx: { xs: 0, sm: 2 },
          }}>
          <Typography
            variant='h5'
            sx={{ fontWeight: 'bold' }}>
            {ProperCase(userData.firstName)}{' '}
            {ProperCase(userData.lastName)}
          </Typography>
          <Typography
            variant='body2'
            color='textSecondary'>
            @{userData.employeeId}
          </Typography>
        </Box>
      </Box>
      <Box>
        <Tabs
          value={value}
          onChange={handleChange}
          centered
          sx={{ borderBottom: '1px solid #ccc' }}>
          <Tab label='Info' />
          <Tab label='Clients' />
          <Tab label='Review' />
          <Tab label='User Rights' />
        </Tabs>
      </Box>
      <Box sx={{ p: 2 }}>{getContent()}</Box>
    </CommonLayout>
  );
}

const ProfileTabs = ({ onTabChange }) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    onTabChange(newValue);
  };

  return (
    <Box>
      <Tabs
        value={value}
        onChange={handleChange}
        centered
        sx={{ borderBottom: '1px solid #ccc' }}>
        <Tab label='Posts' />
        <Tab label='About' />
        <Tab label='Friends' />
        <Tab label='Photos' />
      </Tabs>
    </Box>
  );
};

const ProfileContent = ({ activeTab }) => {
  const getContent = () => {
    switch (activeTab) {
      case 0:
        return <Typography>Posts Content</Typography>;
      case 1:
        return <Typography>About Content</Typography>;
      case 2:
        return <Typography>Friends List</Typography>;
      case 3:
        return <Typography>Photo Gallery</Typography>;
      default:
        return null;
    }
  };

  return <Box sx={{ p: 2 }}>{getContent()}</Box>;
};
