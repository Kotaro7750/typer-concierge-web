import React, { useEffect, useContext, useState } from 'react';
import { NotificationContext } from '@/App';
import { ResultSummaryPane } from './ResultSummaryPane';
import { get_result, TypingResult } from 'pkg/typer_concierge_web';
import { Grid, Stack } from '@mui/material';
import { trackPageView } from '@/util/analyticsUtils';
import { ScrollableLayout } from '@/layout/Scrollable';
import { ActionAfterFinishPane } from './ActionAfterFinish';
import { ShareResultPane } from './ShareResult';
import { SingleKeyStrokeSkillPane } from './SingleKeyStrokeSkillPane';
import { BackToModeSelect, PrepareStartGame } from '@/hook/useGameControl';

// | undefinedとしているのは初回には結果はないため
export function ResultView(props: { backToModeSelect: BackToModeSelect, retryGame: PrepareStartGame }): React.JSX.Element {
  const notificationRegisterer = useContext(NotificationContext);
  const [resultStatistics, setResultStatistics] = useState<TypingResult>({
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
    totalTimeMs: 0,
    singleKeyStrokeSkills: [],
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key;

    if (key === 'Escape') {
      props.backToModeSelect();
      return;
    }

    if (key === 'Enter') {
      props.retryGame();
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
        <Grid size={3} >
          <Stack spacing={2}>
            <ActionAfterFinishPane backToModeSelect={props.backToModeSelect} retry={props.retryGame} />
            <ShareResultPane />
          </Stack>
        </Grid>
        <Grid size={3} >
          <ResultSummaryPane summary={resultStatistics} />
        </Grid>
        <Grid size={6} >
          <SingleKeyStrokeSkillPane stat={resultStatistics.singleKeyStrokeSkills} />
        </Grid>
      </Grid>
    </ScrollableLayout>
  );
}


