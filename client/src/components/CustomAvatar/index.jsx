import Avatar from '@mui/material/Avatar';
import React from 'react';

// Utility function to convert a string to a color
function stringToColor(string) {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

// Function to generate avatar props
function stringAvatar(name) {
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2);
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: initials,
  };
}

// Reusable CustomAvatar Component
const CustomAvatar = ({ name, size }) => {
  return (
    <Avatar
      {...stringAvatar(name)}
      // alt={alt}
      sx={{
        width: size,
        height: size,
        fontSize: size / 2.2, // Adjust font size relative to avatar size
        bgcolor: stringToColor(name),
      }}
    />
  );
};

export default CustomAvatar;
