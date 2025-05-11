import React, { useEffect, useContext, useState } from 'react';
import { TypingResultStatistics } from '@/@types/type';

import { GameStateContext } from '@/App';
import { NotificationContext } from '@/App';
import { ResultSummaryPane } from './ResultSummaryPane';
import { get_result } from 'pkg/typer_concierge_web';
import { Grid, Stack } from '@mui/material';
import { trackEvent, trackPageView } from '@/util/analyticsUtils';
import { ScrollableLayout } from '@/layout/Scrollable';
import { ActionAfterFinishPane } from './GameActionPane';
import { ShareResultPane } from './ShareResult';

// | undefinedとしているのは初回には結果はないため
export function ResultView(): React.JSX.Element {
  const gameStateContext = useContext(GameStateContext);
  const notificationRegisterer = useContext(NotificationContext);
  const [resultStatistics, setResultStatistics] = useState<TypingResultStatistics>({
    keyStroke: {
      wholeCount: 0,
      completelyCorrectCount: 0,
      missedCount: 0,
    },
    idealKeyStroke: {
      wholeCount: 0,
      completelyCorrectCount: 0,
      missedCount: 0,
    },
    totalTimeMs: 0
  });


  const backToModeSelect = () => {
    gameStateContext.setGameState('ModeSelect');
    trackEvent('return_mode_select', {});
  };

  const retry = () => {
    notificationRegisterer.get('warning')?.("未実装", "リトライ機能は未実装です");
  };


  const handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key;

    if (key === 'Escape') {
      backToModeSelect();
      return;
    }

    if (key === 'Enter') {
      retry();
      return;
    }
  }

  useEffect(() => {
    trackPageView('/result', 'ResultView');
  }, []);

  useEffect(() => {
    try {
      const result = get_result();
      setResultStatistics(result);
    } catch (e) {
      notificationRegisterer.get('error')?.('結果生成エラー', e instanceof Error ? e.message : String(e));
    }

  }, []);

  useEffect(() => {
    addEventListener('keydown', handleKeyDown);

    return () => { removeEventListener('keydown', handleKeyDown) }
  });

  return (
    <ScrollableLayout>
      <Grid container width={'100%'} spacing={2} padding={2} >
        <Grid size={2} >
          <Stack spacing={2}>
            <ActionAfterFinishPane backToModeSelect={backToModeSelect} retry={retry} />
            <ShareResultPane />
          </Stack>
        </Grid>
        <Grid size={3} >
          <ResultSummaryPane summary={resultStatistics} />
        </Grid>
      </Grid>
    </ScrollableLayout>
  );
}


