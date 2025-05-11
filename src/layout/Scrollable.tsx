import React from 'react';
import { Box } from '@mui/material';
import Base from './component/Base';
import { Footer } from '@/component/Footer';

interface FixedFullScreenProps {
  children: React.ReactNode;
}

/** 
  * Scrollable layout with a fixed footer.
  */
export function ScrollableLayout({ children }: FixedFullScreenProps) {
  const footerHeight = 36;

  return (
    <Base>
      <Box width={'100%'} marginBottom={`${footerHeight}px`}>
        {children}
      </Box>
      <Footer height={footerHeight} />
    </Base>
  );
}
