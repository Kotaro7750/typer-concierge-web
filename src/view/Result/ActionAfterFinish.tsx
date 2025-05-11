import React from 'react';
import { Grid, Typography, IconButton, Stack } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReplayIcon from '@mui/icons-material/Replay';
import { TileCard } from './TileCard';

export const ActionAfterFinishPane: React.FC<{
  backToModeSelect: () => void;
  retry: () => void;
}> = ({ backToModeSelect, retry }) => {
  return (
    <TileCard>
      <Grid container justifyContent="space-around" alignItems="center">
        <Stack spacing={1} alignItems="center">
          <IconButton size="large" aria-label="最初に戻る" onClick={backToModeSelect} color='default'>
            <ArrowBackIcon fontSize='large' />
          </IconButton>
          <Typography variant="body1">最初に戻る</Typography>
          <Typography variant="caption">ESC</Typography>
        </Stack>

        <Stack spacing={1} alignItems="center">
          <IconButton size="large" aria-label="リトライする" onClick={retry} color='primary' >
            <ReplayIcon fontSize='large' />
          </IconButton>
          <Typography variant="body1">リトライする</Typography>
          <Typography variant="caption">Enter</Typography>
        </Stack>
      </Grid>
    </TileCard>
  );
};

