import React, { useContext } from 'react';
import { Box, Typography, IconButton, Stack } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import XIcon from '@mui/icons-material/X';
import { TileCard } from './TileCard';
import { NotificationContext } from '@/App';


export const ShareResultPane: React.FC = () => {
  const notifier = useContext(NotificationContext);

  const shareX = () => {
    notifier.get('warning')?.("未実装", "Xでのシェアは未実装です");
  };

  const shareFacebook = () => {
    notifier.get('warning')?.("未実装", "Facebookでのシェアは未実装です");
  };

  return (
    <TileCard>
      <Stack spacing={2} alignItems="center">
        <Stack alignItems="center" >
          <Typography variant="h6">結果をシェア</Typography>
        </Stack>
        <Box display="flex" gap={4} justifyContent="center">
          <IconButton onClick={shareX} aria-label="Xでシェア" sx={{ boxShadow: 4 }}>
            <XIcon sx={{ fontSize: 48, color: '#000000' }} />
          </IconButton>
          <IconButton onClick={shareFacebook} aria-label="Facebookでシェア" sx={{ boxShadow: 4 }}>
            <FacebookIcon sx={{ fontSize: 48, color: '#1877F2' }} />
          </IconButton>
        </Box>
      </Stack>
    </TileCard>
  );
};

