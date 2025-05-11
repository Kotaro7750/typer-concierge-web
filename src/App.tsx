import _, { useState, createContext } from 'react';
import { GameState, Library, LibraryOperator, GameStateContextType } from '@/@types/type';
import { useLibrary } from '@/hook/useLibrary';
import { NotificationRegistererMap, useNotification } from '@/hook/useNotification';
import { ModeSelectView } from '@/view/ModeSelect';
import { TransitionToTypingView } from '@/view/TransitionToTyping';
import { TypingView } from '@/view/Typing';
import { ResultView } from '@/view/Result';
import { GoogleAnalytics } from '@/component/GoogleAnalytics';
import { Box, createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';

export const GameStateContext = createContext<GameStateContextType>({} as GameStateContextType);
export const LibraryContext = createContext<{ library: Library, libraryOperator: LibraryOperator }>({} as { library: Library, libraryOperator: LibraryOperator });
export const NotificationContext = createContext<NotificationRegistererMap>({} as NotificationRegistererMap);

export function App() {
  const [gameState, setGameState] = useState<GameState>('ModeSelect');

  const registerNotification = useNotification(enqueueSnackbar);

  const [library, libraryOperator] = useLibrary(registerNotification);
  return (
    <Box  >
      <GoogleAnalytics />
      <SnackbarProvider anchorOrigin={{ vertical: 'top', horizontal: 'right' }} autoHideDuration={5000} />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GameStateContext.Provider value={{ gameState: gameState, setGameState: setGameState }}>
          <LibraryContext.Provider value={{ library: library, libraryOperator: libraryOperator }}>
            <NotificationContext.Provider value={registerNotification}>
              {
                gameState === 'ModeSelect' ? <ModeSelectView />
                  : gameState === 'TransitionToTyping' ? <TransitionToTypingView />
                    : gameState == 'Typing' ? <TypingView />
                      : <ResultView />
              }
            </NotificationContext.Provider>
          </LibraryContext.Provider>
        </GameStateContext.Provider>
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
