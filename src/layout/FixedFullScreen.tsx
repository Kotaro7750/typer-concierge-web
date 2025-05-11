import React from 'react';
import { Box } from '@mui/material';
import BaseWithoutScroll from './component/BaseWithoutScroll'
import { Footer } from '../component/Footer';

interface FixedFullScreenProps {
  children: React.ReactNode;
}

/** 
  * FullScreen layout perfectly fit current screen with footer
  */
export function FixedFullScreenLayout({ children }: FixedFullScreenProps) {
  const footerHeight = 36;

  return (
    <BaseWithoutScroll>
      <Box height={`calc(100% - ${footerHeight}px)`} width={'100%'}>
        {children}
      </Box>
      <Footer height={footerHeight} />
    </BaseWithoutScroll>
  );
}
