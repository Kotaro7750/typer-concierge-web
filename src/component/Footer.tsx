import _ from 'react';
import { AppBar, Box, Grid, IconButton, Toolbar, Typography } from '@mui/material';
import { GitHub } from '@mui/icons-material';

interface FooterProps {
  height: number;
}

export function Footer({ height }: FooterProps) {
  return (
    <AppBar position='fixed' color='primary' sx={{ bottom: 0, top: 'auto', width: '100%' }}>
      <Box sx={{ width: '100%', margin: 0 }}>
        <Toolbar variant='dense' sx={{ minHeight: `${height}px`, height: `${height}px`, justifyContent: 'end', width: '100%' }}>
          <Grid container justifyContent='space-between' alignItems='center' spacing={2}>
            <Grid container alignItems={'center'} >
              <IconButton href='https://github.com/Kotaro7750/typer-concierge-web' target='_blank'>
                <GitHub fontSize='medium' sx={{ color: 'white' }} />
              </IconButton>
            </Grid>
            <Grid>
              <Typography>
                Version {__APP_VERSION__}
              </Typography>
            </Grid>
          </Grid>
        </Toolbar>
      </Box>
    </ AppBar>
  );
}
