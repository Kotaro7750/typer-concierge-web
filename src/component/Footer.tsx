import _ from 'react';
import { AppBar, Container, Toolbar, Typography } from '@mui/material';

interface FooterProps {
  height: number;
}

export function Footer({ height }: FooterProps) {
  return (
    <AppBar position='fixed' color='primary' sx={{ bottom: 0, top: 'auto' }}>
      <Container>
        <Toolbar variant='dense' sx={{ minHeight: `${height}px`, height: `${height}px`, justifyContent: 'end' }}>
          <Typography>
            Version {__APP_VERSION__}
          </Typography>
        </Toolbar>
      </Container>
    </ AppBar>
  );
}
