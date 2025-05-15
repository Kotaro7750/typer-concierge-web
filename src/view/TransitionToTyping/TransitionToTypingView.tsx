import _, { useEffect, useRef } from 'react';
import { StartSignal } from './StartSignal';
import { useCountdownTimer } from '@/hook/useCountdownTimer';
import { Grid } from '@mui/material';
import { FixedFullScreenLayout } from '@/layout/FixedFullScreen';
import { CancelGame, StartGame } from '@/hook/useGameControl';

export function TransitionToTypingView(props: { startGame: StartGame, cancelGame: CancelGame }) {
  // カウントダウン終了のコールバックで直接タイピング画面に遷移させると警告が出るのでレンダリング後に呼ばせる
  // cf. <https://reactjs.org/blog/2020/02/26/react-v16.13.0.html#warnings-for-some-updates-during-render>
  const isStartTyping = useRef(false);

  const [countdownTimer, startCountdownTimer, initCountdownTimer] = useCountdownTimer(3, () => startTyping());

  const startTyping = () => {
    isStartTyping.current = true;
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key;

    if (key === 'Escape') {
      props.cancelGame();
    }
  }

  useEffect(() => {
    addEventListener('keydown', handleKeyDown);

    return () => { removeEventListener('keydown', handleKeyDown) }
  });

  useEffect(() => {
    initCountdownTimer();
    startCountdownTimer();
  }, []);

  useEffect(() => {
    if (isStartTyping.current) {
      props.startGame();
    }
  }, [isStartTyping.current]);

  return (
    <FixedFullScreenLayout>
      <Grid container width={'100%'} height={'100%'} justifyContent={'center'} alignItems={'center'}>
        <StartSignal countdownTimer={countdownTimer} />
      </Grid>
    </FixedFullScreenLayout>
  );
}
