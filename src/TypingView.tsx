import _, { useEffect, useContext, useRef } from 'react';
import { TimerPane } from './TimerPane';
import { ViewPane } from './ViewPane';
import { KeyStrokePane } from './KeyStrokePane';

import { GameStateContext } from './App';
import { NotificationContext } from './App';

import { useMilliSecondTimer } from './useMilliSecondTimer';
import { useTypingEngine } from './useTypingEngine';
import { Grid, LinearProgress, Stack, styled, Typography } from '@mui/material';
import { linearProgressClasses } from '@mui/material/LinearProgress';
import { trackEvent, trackPageView } from './analyticsUtils';

export function TypingView() {
  const [elapsedTime, startTimer, stopTimer, cancelTimer] = useMilliSecondTimer();
  const [displayInfo, startGame, handleInput] = useTypingEngine(() => { stopTimer(); gameStateContext.setGameState('Finished'); });
  const isStarted = useRef(false);

  const gameStateContext = useContext(GameStateContext);
  const notificationRegisterer = useContext(NotificationContext);

  useEffect(() => {
    trackPageView('/typing', 'TypingView');
  }, []);

  const cancelTyping = () => {
    // これもuseEffect内でやる必要があるかもしれない
    gameStateContext.setGameState('ModeSelect');
    cancelTimer();
    trackEvent('cancel_game', {});
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key;

    if (key === 'Escape') {
      cancelTyping();
      return;
    }

    // ShiftとかAltとかの特殊文字を防ぐために長さでバリデーションをかける
    // 本当はもっといいやり方があるはず
    if (key.length == 1 && ' '.charCodeAt(0) <= key.charCodeAt(0) && key.charCodeAt(0) <= '~'.charCodeAt(0)) {
      try {
        handleInput(key, elapsedTime);
      } catch (e) {
        notificationRegisterer.get('error')?.('キー入力処理エラー', e instanceof Error ? e.message : String(e));
        gameStateContext.setGameState('ModeSelect');
      }
    }
  }

  // 初回レンダリング終了時にタイマーをスタートさせる
  useEffect(() => {
    if (isStarted.current === false) {
      try {
        startGame();
      } catch (e) {
        notificationRegisterer.get('error')?.('ゲーム開始エラー', e instanceof Error ? e.message : String(e));
        gameStateContext.setGameState('ModeSelect');
      }
      startTimer();

      isStarted.current = true;
    }
  }, []);

  useEffect(() => {
    addEventListener('keydown', handleKeyDown);

    return () => { removeEventListener('keydown', handleKeyDown) }
  });

  if (displayInfo === null) {
    return (<></>);
  }

  const viewDisplayInfo = displayInfo.view;
  const keyStrokeDisplayInfo = displayInfo.keyStroke;

  const progressPercentage = keyStrokeDisplayInfo.progress * 100;

  return (
    <Grid container justifyContent={'center'} width={'100%'} height={'100%'} >
      <Grid width={'95%'} height={'100%'}>
        <Stack width={'100%'} height={'100%'} spacing={2}>
          <Grid container justifyContent={'space-between'} alignItems={'center'} sx={{ flex: 1 }}>
            <Grid size={6}>
              <Grid container alignItems={'center'} width={'100%'} justifyContent={'space-around'} spacing={2}>
                <Grid size={'grow'} >
                  <Grid container width={'100%'} alignItems={'center'} justifyContent={'center'}>
                    <Grid width={'100%'} height={20}>
                      <BorderLinearProgress variant={'determinate'} value={progressPercentage} />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid size={2}>
                  <Typography variant='h5'>{progressPercentage.toFixed(1)}%</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid>
              <Grid container alignItems={'center'}>
                <TimerPane elapsedTimeMilli={elapsedTime} />
              </Grid>
            </Grid>
          </Grid>

          <Grid sx={{ flex: 4.5, }}>
            <ViewPane viewDisplayInfo={viewDisplayInfo} />
          </Grid>

          <Grid sx={{ flex: 4.5, paddingBottom:  2 }}>
            <KeyStrokePane keyStrokeDisplayInfo={keyStrokeDisplayInfo} />
          </Grid>
        </Stack>
      </Grid>
    </Grid>
  );
}

const BorderLinearProgress = styled(LinearProgress)((_) => ({
  height: '100%',
  borderRadius: 5,
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
  },
}));
