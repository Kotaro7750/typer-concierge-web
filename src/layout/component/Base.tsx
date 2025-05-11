import React from 'react';
import { Box } from '@mui/material';

interface BaseProps {
  children: React.ReactNode;
}

const Base: React.FC<BaseProps> = ({ children }) => {
  return (
    <Box width="100vw">
      {children}
    </Box>
  );
};

export default Base;
