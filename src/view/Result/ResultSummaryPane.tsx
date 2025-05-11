import React, { useState } from 'react';
import { TypingResultStatistics } from '@/@types/type';
import { Box, CardContent, Divider, Grid, Switch, Tooltip, Typography } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { TileCard } from './TileCard';

export function ResultSummaryPane(props: { summary: TypingResultStatistics }): React.JSX.Element {
  const [isStrokeCountIdeal, setIsStrokeCountIdeal] = useState<boolean>(false);

  const summary = props.summary;
  const effectiveKeyStroke = isStrokeCountIdeal ? summary.idealKeyStroke : summary.keyStroke;

  const strokeCount = effectiveKeyStroke.wholeCount;
  const accuracy = strokeCount == 0 ? 0 : effectiveKeyStroke.completelyCorrectCount * 1.0 / strokeCount * 100;

  // WPMは切り捨て
  const wpm = summary.totalTimeMs == 0 ? 0 : Math.floor(strokeCount * 60000 / summary.totalTimeMs);

  // WPM x ( 正確率 )^3 の小数点以下切り捨て
  // 実際のeタイピングはstrokeCountとしてidealじゃなくて実際の打ったローマ字数を使っている
  const eTypingScore = Math.floor(wpm * (accuracy / 100) ** 3);

  const STROKE_COUNT_IDEAL_HELP = (
    <Box>
      <ul>
        <li><Typography variant='caption'>オン:タイプ数が最も少なくなるようなローマ字系列のタイプ数で計算します</Typography></li>
        <li><Typography variant='caption'>オフ:実際にタイプしたローマ字系列のタイプ数で計算します</Typography></li>
      </ul>
      <Typography variant='caption'>
        例： 「きょう」を「kilyou」と打った場合にはオンにすると4タイプ（kyou）、オフにすると6タイプ打ったことになります。
        オンにすると実際にタイプしたタイプ数よりも少なくなるのでWPM・スコアは低くなります。
      </Typography>
    </Box>
  );

  const SCORE_TOOLTIP_TEXT = "WPMと正確率から計算したスコアです。WPMと正確率がバランスよく高いほどスコアが高くなります。";
  const WPM_TOOLTIP_TEXT = "1分間あたりの平均タイプ数です。";
  const ACCURACY_TOOLTIP_TEXT = "タイプ数に対して1つのミスもなくタイプできた割合です。";
  const WRONG_TYPE_COUNT_TOOLTIP_TEXT = "間違えたタイプ数です。同じ文字に対して何度もミスした場合はその分だけカウントされます。";

  return (
    <TileCard >
      <Grid container justifyContent={'space-between'} direction={'column'} width={'100%'} height={'100%'}>
        <Grid>
          <Box display="flex" alignItems="center" justifyContent="flex-start" mb={2}>
            <Switch
              checked={isStrokeCountIdeal}
              onChange={(_) => setIsStrokeCountIdeal(prev => !prev)}
              size="small"
            />
            <Typography variant="body1">タイプ数として最短を使う</Typography>
            <Tooltip title={STROKE_COUNT_IDEAL_HELP}>
              <InfoOutlined fontSize="small" sx={{ ml: 1 }} />
            </Tooltip>
          </Box>
        </Grid>

        <Grid>
          <CardContent sx={{ textAlign: 'center' }}>
            <Tooltip title={SCORE_TOOLTIP_TEXT}>
              <Box>
                <Typography variant="h6" color="text.secondary">
                  スコア
                </Typography>
                <Typography variant="h2" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {eTypingScore}
                </Typography>
              </Box>
            </Tooltip>
            <Typography variant="h5" sx={{ fontFamily: 'monospace', mt: 1 }}>
              {(summary.totalTimeMs / 1000).toFixed(3)}秒
            </Typography>
          </CardContent>
        </Grid>

        <Grid>
          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2} justifyContent="space-around">
            <Grid >
              <Tooltip title={WPM_TOOLTIP_TEXT}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" align="center">
                    WPM
                  </Typography>
                  <Typography variant="h6" align="center">{wpm.toString()}</Typography>
                </Box>
              </Tooltip>
            </Grid>
            <Grid >
              <Tooltip title={ACCURACY_TOOLTIP_TEXT}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" align="center">
                    正確性
                  </Typography>
                  <Typography variant="h6" align="center">{accuracy.toFixed(0)}%</Typography>
                </Box>
              </Tooltip>
            </Grid>
            <Grid >
              <Tooltip title={WRONG_TYPE_COUNT_TOOLTIP_TEXT}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" align="center">
                    ミスタイプ
                  </Typography>
                  <Typography variant="h6" align="center">{effectiveKeyStroke.missedCount}回</Typography>
                </Box>
              </Tooltip>
            </Grid>
            <Grid >
              <Typography variant="subtitle2" color="text.secondary" align="center">
                タイプ数
              </Typography>
              <Typography variant="h6" align="center">{strokeCount}字</Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </TileCard >
  );
}
