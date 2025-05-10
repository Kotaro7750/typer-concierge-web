import React, { useEffect, useContext, useState } from 'react';
import { TypingResultStatistics } from './@types/type';

import { GameStateContext } from './App';
import { NotificationContext } from './App';
import { ResultSummaryPane } from './ResultSummaryPane';
import { get_result } from '../pkg/typer_concierge_web';
import { Box } from '@mui/material';

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

  const handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key;

    if (key === 'Escape') {
      gameStateContext.setGameState('ModeSelect');
      return;
    }
  }

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
    <Box width={'100%'} height={'100%'}>
      <ResultSummaryPane summary={resultStatistics} />
    </Box>
  );
}
