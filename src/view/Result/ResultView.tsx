import React, { useEffect, useContext, useState } from 'react';
import { NotificationContext } from '@/App';
import { ResultSummaryPane } from './ResultSummaryPane';
import { GameResult, get_result } from 'pkg/typer_concierge_web';
import { Grid, Stack } from '@mui/material';
import { trackPageView } from '@/util/analyticsUtils';
import { ScrollableLayout } from '@/layout/Scrollable';
import { ActionAfterFinishPane } from './ActionAfterFinish';
import { ShareResultPane } from './ShareResult';
import { SingleKeyStrokeSkillPane } from './SingleKeyStrokeSkillPane';
import { BackToModeSelect, PrepareStartGame } from '@/hook/useGameControl';
import { SingleKeyStrokePlot as SingleKeyStrokeScatterPane } from './SingleKeyStrokeScatterPane';
import { StatisticsDataControlPane } from './StatisticsDataControlPane';
import { calculateAccuracy, calculateWPS } from './utility';

// | undefinedとしているのは初回には結果はないため
export function ResultView(props: { backToModeSelect: BackToModeSelect, retryGame: PrepareStartGame }): React.JSX.Element {
  const notificationRegisterer = useContext(NotificationContext);
  const [resultStatistics, setResultStatistics] = useState<GameResult>({
    thisResult: {
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
    },
    aggregatedResult: {
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
    }
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

      const typingResult = result.thisResult;
      /// Use aggregated result for skill statistics
      typingResult.singleKeyStrokeSkills = result.aggregatedResult.singleKeyStrokeSkills;

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
          <Stack spacing={2} justifyContent={'space-between'} height={'100%'} >
            <ActionAfterFinishPane backToModeSelect={props.backToModeSelect} retry={props.retryGame} />
            <ShareResultPane summary={resultStatistics.thisResult} />
          </Stack>
        </Grid>
        <Grid size={3} >
          <ResultSummaryPane summary={resultStatistics.thisResult} />
        </Grid>
        <Grid size={6} ></Grid>
        <Grid size={1} >
          <StatisticsDataControlPane />
        </Grid>
        <Grid size={5} >
          <SingleKeyStrokeSkillPane stat={resultStatistics.aggregatedResult.singleKeyStrokeSkills} />
        </Grid>
        <Grid size={6} >
          <SingleKeyStrokeScatterPane
            averageAccuracyPercent={calculateAccuracy(resultStatistics.aggregatedResult, true)}
            averageWPS={calculateWPS(resultStatistics.aggregatedResult, true)}
            stat={resultStatistics.aggregatedResult.singleKeyStrokeSkills}
          />
        </Grid>
      </Grid>
    </ScrollableLayout>
  );
}
