import { useState } from "react";
import { useLibrary } from "./useLibrary";
import { useTypingEngine } from "./useTypingEngine";
import { DisplayInfo, GameState, Library, LibraryOperator } from "@/@types/type";
import { NotificationRegistererMap } from "./useNotification";
import { trackEvent } from "@/util/analyticsUtils";

export type KeyStrokeCountThreshold = number;
export type KeyStrokeCountThresholdSetter = (value: KeyStrokeCountThreshold) => void;
export type PrepareStartGame = () => void;
export type StartGame = () => void;
export type OnInput = (key: string, elapsedTime: number) => void;
export type CancelGame = () => void;
export type BackToModeSelect = () => void;
export type MayFinishPromise = Promise<void>;

export function useGameControl(notificationRegisterer: NotificationRegistererMap):
  [
    GameState,
    Library,
    LibraryOperator,
    KeyStrokeCountThreshold,
    KeyStrokeCountThresholdSetter,
    PrepareStartGame,
    StartGame,
    OnInput,
    CancelGame,
    BackToModeSelect,
    DisplayInfo,
    MayFinishPromise
  ] {
  const [gameState, setGameState] = useState<GameState>('ModeSelect');
  const [keyStrokeCountThreshold, setKeyStrokeCountThreshold] = useState<KeyStrokeCountThreshold>(150);

  let resolveFn: () => void;
  const mayFinishPromise = new Promise<void>((resolve, _) => {
    resolveFn = resolve;
  });

  const [displayInfo, onConfirmQuery, onStartGame, onInput] = useTypingEngine(() => {
    resolveFn();
    setGameState('Finished');
  });
  const [library, libraryOperator] = useLibrary(notificationRegisterer);

  const prepareStartGame = () => {
    const usedDictionaryType = library.usedDictionaryType;
    const usedDictionaries = library.usedDictionaries;

    try {
      onConfirmQuery(usedDictionaryType, usedDictionaries, keyStrokeCountThreshold);
    } catch (e) {
      notificationRegisterer.get('error')?.('問題文作成エラー', e instanceof Error ? e.message : String(e));
      return;
    }
    setGameState('TransitionToTyping');

    trackEvent('start_game', {
      used_dictionary_type: usedDictionaryType,
      used_dictionaries: usedDictionaries,
      key_stroke_count_threshold: keyStrokeCountThreshold,
    });
  }

  const startGame = () => {
    try {
      onStartGame();
    } catch (e) {
      notificationRegisterer.get('error')?.('ゲーム開始エラー', e instanceof Error ? e.message : String(e));
      setGameState('ModeSelect');
    }
    setGameState('Typing');
  }

  const onInputWrapper = (key: string, elapsedTime: number) => {
    try {
      onInput(key, elapsedTime);
    } catch (e) {
      notificationRegisterer.get('error')?.('キー入力処理エラー', e instanceof Error ? e.message : String(e));
      setGameState('ModeSelect');
    }
  }

  const cancelGame = () => {
    setGameState('ModeSelect');
    trackEvent('cancel_game');
  }

  const backToModeSelect = () => {
    setGameState('ModeSelect');
    trackEvent('back_to_mode_select');
  }

  return [gameState, library, libraryOperator, keyStrokeCountThreshold, setKeyStrokeCountThreshold, prepareStartGame, startGame, onInputWrapper, cancelGame, backToModeSelect, displayInfo, mayFinishPromise]
}
