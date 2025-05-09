import _, { useState, useEffect, useContext } from 'react';

import { SelectDictionaryPane } from './SelectDictionaryPane';

import { GameStateContext } from './App';
import { LibraryContext } from './App';
import { NotificationContext } from './App';
import { Box, Button, ButtonGroup, CircularProgress, Grid, IconButton, Input, Slider, Stack, Step, StepLabel, Stepper, Tooltip, Typography } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { DictionaryType } from '../pkg/typer_concierge_web';

const LAP_LENGTH = 50;

function ModeSelectInstruction(props: { selectedDictionaryType: DictionaryType, usedDictionariesSelected: boolean }) {
  return (
    <Box width={'100%'} height={'100%'} >
      <Stepper orientation='vertical' activeStep={0}>
        <Step completed={SelectDictionaryPane !== null}>
          <StepLabel key={1}>辞書タイプを選択</StepLabel>
        </Step>
        <Step completed={props.usedDictionariesSelected}>
          <StepLabel key={2} optional={<Typography variant='caption'>複数選択可</Typography>}>辞書をクリックして選択</StepLabel>
        </Step>
        {
          props.selectedDictionaryType == 'word' &&
          <Step completed={true}>
            <StepLabel key={3} >スライダーでタイプ数を選択</StepLabel>
          </Step>
        }
        <Step>
          <StepLabel key={4} optional={<Typography variant='caption'>スペースキーでも可能</Typography>}>Startで開始</StepLabel>
        </Step>
      </Stepper>
    </Box>
  );
}

export function ModeSelectView() {
  const gameStateContext = useContext(GameStateContext);
  const notificationRegisterer = useContext(NotificationContext);

  // NOTE: 分割代入を使っていこう cf. <https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment>
  const { library: { usedDictionaryType, usedDictionaries: usedDictionaries, catalog: availableDictionaries, isAvailableDictionariesLoading }, libraryOperator } = useContext(LibraryContext);

  const [keyStrokeCountThreshold, setKeyStrokeCountThreshold] = useState(150);

  const canStart = () => {
    return usedDictionaries.length !== 0;
  }

  const confirmReady = () => {
    if (!canStart()) {
      return;
    }


    try {
      libraryOperator.confirmQuery(keyStrokeCountThreshold);
    } catch (e) {
      notificationRegisterer.get('error')?.('問題文作成エラー', e instanceof Error ? e.message : String(e));
      return;
    }
    gameStateContext.setGameState('TransitionToTyping');
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key;

    if (key === ' ') {
      confirmReady();
    }
  }

  useEffect(() => {
    addEventListener('keydown', handleKeyDown);

    return () => { removeEventListener('keydown', handleKeyDown) }
  });

  const WORD_TOOLTIP_TEXT = `辞書に含まれる単語からいくつかランダムに選びます。\n文章との併用はできません。`;
  const SENTENCE_TOOLTIP_TEXT = `辞書に含まれる文章から全て順番通りに選びます。\n単語との併用はできません。`

  const KEY_STROKE_THRESHOLD_TOOLTIP_TEXT = 'ローマ字を何文字打ったらゲームが終了するかというタイプ数です。\n平均的な人だと1分間に150から250タイプできるとされているので、1分間のゲームをしたい場合には200程度にすると良いです。';

  return (
    <Box width={'100vw'} height={'100vh'} >
      <Stack width={'100%'} height={'100%'} justifyContent={'center'} direction={'column'}>
        <Grid container columns={12} spacing={8} height={'50%'}>
          <Grid size={7} offset={1}>
            {/* 左側のペイン - 辞書選択 */}
            <Box height={'100%'}>
              <Stack width={'100%'} height={'100%'} direction={'column'} spacing={2}>
                <Grid container justifyContent={'space-between'}>
                  <ButtonGroup>
                    <Tooltip title={WORD_TOOLTIP_TEXT} placement='top'>
                      <Button variant={usedDictionaryType === 'word' ? 'contained' : 'outlined'} onClick={() => libraryOperator.setType('word')}>単語</Button>
                    </Tooltip>

                    <Tooltip title={SENTENCE_TOOLTIP_TEXT} placement='top'>
                      <Button variant={usedDictionaryType === 'sentence' ? 'contained' : 'outlined'} onClick={() => libraryOperator.setType('sentence')}>文章</Button>
                    </Tooltip>
                  </ButtonGroup>

                  <Box>
                    <IconButton onClick={() => { libraryOperator.load(); }} disabled={isAvailableDictionariesLoading} >
                      <Refresh />
                    </IconButton>
                  </Box>
                </Grid>

                <Box border={1} p={1} borderRadius={1} borderColor={'primary.main'} height={'50%'}>
                  {isAvailableDictionariesLoading ?
                    <Stack width={'100%'} height={'100%'} justifyContent={'center'}>
                      <Grid container justifyContent={'center'} alignItems={'center'} height={'100%'} >
                        <CircularProgress />
                      </Grid>
                    </Stack>
                    :
                    <SelectDictionaryPane availableDictionaryList={availableDictionaries} usedDictionaryList={usedDictionaries} libraryOperator={libraryOperator} />
                  }
                </Box>

                {
                  usedDictionaryType == 'word'
                    ? (
                      <Grid container justifyContent={'center'} >
                        <Grid container justifyContent={'center'} width={'75%'} >
                          <Grid size={10}>
                            <Slider value={keyStrokeCountThreshold} min={LAP_LENGTH} max={600} step={LAP_LENGTH} onChange={(_: Event, newValue: number) => setKeyStrokeCountThreshold(newValue)} />
                          </Grid>
                          <Grid container justifyContent={'center'} size={2}>
                            <Tooltip title={KEY_STROKE_THRESHOLD_TOOLTIP_TEXT} placement='top'>
                              <Input value={keyStrokeCountThreshold} size='small' onChange={(e) => setKeyStrokeCountThreshold(Number(e.target.value))} inputProps={{ step: LAP_LENGTH, min: LAP_LENGTH, max: 600, type: 'number', 'aria-labelledby': 'input-slider' }} />
                            </Tooltip>
                          </Grid>
                        </Grid>
                      </Grid>
                    )
                    : undefined
                }

                <Grid container justifyContent={'center'}>
                  <Button onClick={confirmReady} variant='contained' size='large' disabled={!canStart() || isAvailableDictionariesLoading} >Start</Button>
                </Grid>
              </Stack>
            </Box>
          </Grid>

          {/* 右側のペイン - 説明 */}
          <Grid size={3} >
            <ModeSelectInstruction selectedDictionaryType={usedDictionaryType} usedDictionariesSelected={usedDictionaries.length > 0} />
          </Grid>
        </Grid>
      </Stack >
    </Box >
  );
}
