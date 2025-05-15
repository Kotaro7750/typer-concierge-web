import _, { createContext } from 'react';
import { NotificationRegistererMap, useNotification } from '@/hook/useNotification';
import { ModeSelectView } from '@/view/ModeSelect';
import { TransitionToTypingView } from '@/view/TransitionToTyping';
import { TypingView } from '@/view/Typing';
import { ResultView } from '@/view/Result';
import { GoogleAnalytics } from '@/component/GoogleAnalytics';
import { Box, createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { useGameControl } from './hook/useGameControl';

export const NotificationContext = createContext<NotificationRegistererMap>({} as NotificationRegistererMap);

export function App() {

  const registerNotification = useNotification(enqueueSnackbar);

  const [
    gameState,
    library, libraryOperator,
    keyStrokeCountThreshold, setKeyStrokeCountThreshold,
    prepareStartGame, startGame, onInput, cancelGame, backToModeSelect,
    displayInfo, mayFinishPromise
  ] = useGameControl(registerNotification);

  return (
    <Box  >
      <GoogleAnalytics />
      <SnackbarProvider anchorOrigin={{ vertical: 'top', horizontal: 'right' }} autoHideDuration={5000} />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationContext.Provider value={registerNotification}>
          {
            gameState === 'ModeSelect' ?
              <ModeSelectView
                library={library}
                libraryOperator={libraryOperator}
                keyStrokeCountThreshold={keyStrokeCountThreshold}
                setKeyStrokeCountThreshold={setKeyStrokeCountThreshold}
                prepareStartGame={prepareStartGame}
              />
              : gameState === 'TransitionToTyping' ?
                <TransitionToTypingView
                  startGame={startGame}
                  cancelGame={cancelGame}
                />
                : gameState == 'Typing' ?
                  <TypingView
                    displayInfo={displayInfo}
                    onInput={onInput}
                    cancelGame={cancelGame}
                    mayFinishPromise={mayFinishPromise}
                  />
                  : <ResultView backToModeSelect={backToModeSelect} retryGame={prepareStartGame} />
          }
        </NotificationContext.Provider>
      </ThemeProvider >
    </Box >
  );
}

import TyperConciergeFont from './assets/TyperConciergeFont-Regular.woff';

const theme = createTheme({
  typography: {
    fontFamily: 'TyperConciergeFont',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@font-face': [{
          fontFamily: 'TyperConciergeFont',
          fontStyle: 'normal',
          fontWeight: 400,
          src: `url(${TyperConciergeFont}) format('woff')`,
        }]
      }
    }
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#5863f8',
    },
    secondary: {
      main: '#9d58f8',
    },
  },
})
