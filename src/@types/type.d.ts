import { DictionaryType, DictionaryOrigin, DictionaryInfo } from '../../pkg/typer_concierge_web';

export type GameState = 'ModeSelect' | 'TransitionToTyping' | 'Typing' | 'Finished';

export interface GameStateContextType {
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
}

export type Library = {
  readonly usedDictionaries: [DictionaryOrigin, string][],
  readonly catalog: DictionaryInfo[],
  readonly usedDictionaryType: DictionaryType,
  readonly isAvailableDictionariesLoading: boolean,
}

export type LibraryOperator = {
  use: (dictionaryName: string, dictionaryOrigin: DictionaryOrigin) => void,
  disuse: (dictionaryName: string, dictionaryOrigin: DictionaryOrigin) => void,
  load: () => void,
  setType: (dictionaryType: DictionaryType) => void,
  confirmQuery: (keyStrokeCountThreshold: number) => void,
}


export type ViewDisplayInfo = {
  readonly view: string,
  readonly currentCursorPositions: number[],
  readonly missedPositions: number[],
  readonly lastPosition: number,
}

export type KeyStrokeDisplayInfo = {
  readonly keyStroke: string,
  readonly currentCursorPosition: number,
  readonly missedPositions: number[],
  readonly progress: number,
  readonly lapEndPositions: number[],
  readonly lapEndTime: number[],
}

export type DisplayInfo = {
  readonly view: ViewDisplayInfo,
  readonly keyStroke: KeyStrokeDisplayInfo,
}

export type CharacterStyleInformation = {
  c: string,
  isWrong: boolean,
  cursorRelative: 'before' | 'onCursor' | 'after',
  isOutRange: boolean,
}

export type CharacterStyleInformationForCanvas = CharacterStyleInformation & {
  x: number,
  explicitSpace: boolean
}


export type TypingResultStatistics = {
  keyStroke: TypingResultStatisticsTarget,
  idealKeyStroke: TypingResultStatisticsTarget,
  totalTimeMs: number,
}

export type TypingResultStatisticsTarget = {
  wholeCount: number,
  completelyCorrectCount: number,
  missedCount: number,
}
