import _ from 'react';
import { AppBar, Box, Toolbar, Typography } from '@mui/material';

interface FooterProps {
  height: number;
}

export function Footer({ height }: FooterProps) {
  return (
    <AppBar position='fixed' color='primary' sx={{ bottom: 0, top: 'auto', width: '100%' }}>
      <Box sx={{ width: '100%', margin: 0 }}>
        <Toolbar variant='dense' sx={{ minHeight: `${height}px`, height: `${height}px`, justifyContent: 'end', width: '100%' }}>
          <Typography>
            Version {__APP_VERSION__}
          </Typography>
        </Toolbar>
      </Box>
    </ AppBar>
  );
}
