import _, { useState, createContext } from 'react';
import { GameState, Library, LibraryOperator, GameStateContextType } from './@types/type';
import { useLibrary } from './useLibrary';
import { NotificationRegistererMap, useNotification } from './useNotification';
import { ModeSelectView } from './ModeSelectView';
import { TransitionToTypingView } from './TransitionToTypingView';
import { TypingView } from './TypingView';
import { ResultView } from './ResultView';
import { NotificationToast } from './NotificationToast';
import { Box, createTheme, CssBaseline, ThemeProvider } from '@mui/material';

export const GameStateContext = createContext<GameStateContextType>({} as GameStateContextType);
export const LibraryContext = createContext<{ library: Library, libraryOperator: LibraryOperator }>({} as { library: Library, libraryOperator: LibraryOperator });
export const NotificationContext = createContext<NotificationRegistererMap>({} as NotificationRegistererMap);

export function App() {
  const [gameState, setGameState] = useState<GameState>('ModeSelect');

  const [notifications, registerNotification, unregisterNotification] = useNotification(5000);

  const [library, libraryOperator] = useLibrary(registerNotification);
  return (
    <Box height={'100vh'} width={'100vw'} >
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
        <NotificationToast
          notifications={notifications}
          unregisterNotification={unregisterNotification} />
      </ThemeProvider>
    </Box>
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
