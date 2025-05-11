import { Box, Grid, Typography } from '@mui/material';

export function StartSignal(props: { countdownTimer: number }): React.JSX.Element {
  const countdownTimerInt = Math.ceil(props.countdownTimer);

  return (
    <Box width={'100%'} height={'100%'}>
      <Grid container justifyContent={'center'} alignItems={'center'} height={'100%'}>
        <Typography variant='h1' color='primary'>{countdownTimerInt}</Typography>
      </Grid>
    </Box>
  );
}
