import _ from 'react';
import { Box, Typography, IconButton, Stack } from '@mui/material';
import XIcon from '@mui/icons-material/X';
import { TileCard } from './TileCard';
import { TypingResultStatistics } from '@/@types/type';
import { calculateAccuracy, calculateETypingScore, calculateWPM, calculateWPS } from './utility';


export function ShareResultPane(props: { summary: TypingResultStatistics }) {
  const { summary } = props;
  const wpm = calculateWPM(summary, true);
  const wps = calculateWPS(summary, true).toFixed(1);
  const accuracy = calculateAccuracy(summary, true);
  const eTypingScore = calculateETypingScore(summary, true);

  const sharedText = `あなたのスコアは${eTypingScore}でした！\n${wpm}キー/分・${wps}キー/秒・正確さ${accuracy}%`;

  const xUrl = `https://twitter.com/intent/tweet?text=${sharedText}&url=${import.meta.env.VITE_URL}&hashtags=TyperConcierge,タイピング,タイピングゲーム`;

  return (
    <TileCard>
      <Stack spacing={2} alignItems="center">
        <Stack alignItems="center" >
          <Typography variant="h6">結果をシェア</Typography>
        </Stack>
        <Box display="flex" gap={4} justifyContent="center">
          <IconButton href={encodeURI(xUrl)} target='_blank' aria-label="Xでシェア" sx={{ boxShadow: 4 }}>
            <XIcon sx={{ color: '#000000' }} fontSize='large' />
          </IconButton>
        </Box>
      </Stack>
    </TileCard>
  );
};

