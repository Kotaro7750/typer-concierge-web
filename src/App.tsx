import _, { useState, createContext } from 'react';
import { GameState, Library, LibraryOperator, GameStateContextType } from './@types/type';
import { useLibrary } from './useLibrary';
import { NotificationRegistererMap, useNotification } from './useNotification';
import { ModeSelectView } from './ModeSelectView';
import { TransitionToTypingView } from './TransitionToTypingView';
import { TypingView } from './TypingView';
import { ResultView } from './ResultView';
import { NotificationToast } from './NotificationToast';

export const GameStateContext = createContext<GameStateContextType>({} as GameStateContextType);
export const LibraryContext = createContext<{ library: Library, libraryOperator: LibraryOperator }>({} as { library: Library, libraryOperator: LibraryOperator });
export const NotificationContext = createContext<NotificationRegistererMap>({} as NotificationRegistererMap);

export function App() {
  const [gameState, setGameState] = useState<GameState>('ModeSelect');

  const [notifications, registerNotification, unregisterNotification] = useNotification(5000);

  const [library, libraryOperator] = useLibrary(registerNotification);
  return (
    <div className='vh-100 vw-100'>
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
    </div>
  );
}

