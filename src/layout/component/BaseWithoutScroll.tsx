import React from 'react';
import { Box } from '@mui/material';

interface BaseWithoutScrollProps {
  children: React.ReactNode;
}

const BaseWithoutScroll: React.FC<BaseWithoutScrollProps> = ({ children }) => {
  return (
    <Box width="100vw" height="100vh">
      {children}
    </Box>
  );
};

export default BaseWithoutScroll;
