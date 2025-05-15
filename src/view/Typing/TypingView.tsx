import _, { useEffect, useRef } from 'react';
import { TimerPane } from './TimerPane';
import { ViewPane } from './ViewPane';
import { KeyStrokePane } from './KeyStrokePane';
import { useMilliSecondTimer } from '@/hook/useMilliSecondTimer';
import { Grid, LinearProgress, Stack, styled, Typography } from '@mui/material';
import { linearProgressClasses } from '@mui/material/LinearProgress';
import { trackPageView } from '@/util/analyticsUtils';
import { FixedFullScreenLayout } from '@/layout/FixedFullScreen';
import { CancelGame, MayFinishPromise, OnInput } from '@/hook/useGameControl';
import { DisplayInfo } from '@/@types/type';

export function TypingView(props: { displayInfo: DisplayInfo, onInput: OnInput, cancelGame: CancelGame, mayFinishPromise: MayFinishPromise }) {
  const [elapsedTime, startTimer, stopTimer, cancelTimer] = useMilliSecondTimer();
  const isStarted = useRef(false);

  props.mayFinishPromise.then(() => {
    stopTimer();
  });

  useEffect(() => {
    trackPageView('/typing', 'TypingView');
  }, []);

  const cancelTyping = () => {
    // これもuseEffect内でやる必要があるかもしれない
    props.cancelGame();
    cancelTimer();

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
      props.onInput(key, elapsedTime);
    }
  }

  // 初回レンダリング終了時にタイマーをスタートさせる
  useEffect(() => {
    if (isStarted.current === false) {
      startTimer();

      isStarted.current = true;
    }
  }, []);

  useEffect(() => {
    addEventListener('keydown', handleKeyDown);

    return () => { removeEventListener('keydown', handleKeyDown) }
  });

  if (props.displayInfo === null) {
    return (<></>);
  }

  const viewDisplayInfo = props.displayInfo.view;
  const keyStrokeDisplayInfo = props.displayInfo.keyStroke;

  const progressPercentage = keyStrokeDisplayInfo.progress * 100;

  return (
    <FixedFullScreenLayout>
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

            <Grid sx={{ flex: 4.5, paddingBottom: 2 }}>
              <Grid container justifyContent={'start'} width={'100%'} height={'100%'} spacing={2}>
                <Grid size={9} height={'100%'}>
                  <KeyStrokePane keyStrokeDisplayInfo={keyStrokeDisplayInfo} />
                </Grid>
              </Grid>
            </Grid>
          </Stack>
        </Grid>
      </Grid>
    </FixedFullScreenLayout>
  );
}

const BorderLinearProgress = styled(LinearProgress)((_) => ({
  height: '100%',
  borderRadius: 5,
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
  },
}));
