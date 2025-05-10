import { TimerOutlined } from '@mui/icons-material';
import { Box, Grid, Typography } from '@mui/material';
import React from 'react';

export function TimerPane(props: { elapsedTimeMilli: number }): React.JSX.Element {
  const elapsedTimeS = props.elapsedTimeMilli / 1000;
  return (
    <Box height={'100%'} width={'100%'} >
      <Typography variant='h4'>
        <Grid container spacing={1} alignItems='center'>
          <Grid >
            <TimerOutlined fontSize='inherit' />
          </Grid>
          <Grid >
            {elapsedTimeS.toFixed(2)}
          </Grid>
        </Grid>
      </Typography>
    </ Box>
      );
}
