import _, { useState } from 'react';
import { DisplayInfo } from '@/@types/type';
import { DictionaryOrigin, DictionaryType, start_game, stroke_key, QueryRequestFromUI, confirm_query } from 'pkg/typer_concierge_web';

export type FinishedHandler = () => void;
export type OnConfirmQuery = (usedDictionaryType: DictionaryType, usedDictionaries: [DictionaryOrigin, string][], keyStrokeCountThreshold: number) => void;
export type OnStartGame = () => void;
export type OnInput = (c: string, elapsedTimeMs: number) => void;

export function useTypingEngine(finishedHandler: FinishedHandler): [DisplayInfo, OnConfirmQuery, OnStartGame, OnInput] {
  const [displayInfo, setDisplayInfo] = useState<DisplayInfo>({
    view: {
      view: '',
      currentCursorPositions: [],
      missedPositions: [],
      lastPosition: 0,
    },
    keyStroke: {
      keyStroke: '',
      currentCursorPosition: 0,
      missedPositions: [],
      progress: 0,
      lapEndPositions: [],
      lapEndTime: [],
    }
  });

  const onStartGame = () => {
    // XXX try-catch
    const displayInfo = start_game();
    setDisplayInfo(displayInfo);
  }

  const onInput = (c: string, elapsedTimeMs: number) => {
    // XXX try-catch
    const result = stroke_key({ key: c, elapsedTimeMs: elapsedTimeMs })
    setDisplayInfo(result.displayInformation);
    if (result.isFinished) {
      finishedHandler();
    }
  }

  const onConfirmQuery = (usedDictionaryType: DictionaryType, usedDictionaries: [DictionaryOrigin, string][], keyStrokeCountThreshold: number) => {
    let request: QueryRequestFromUI = {
      dictionaryType: usedDictionaryType,
      usedDictionaries: usedDictionaries,
      keyStrokeCountThreshold: null,
    }

    if (usedDictionaryType == 'word') {
      request.keyStrokeCountThreshold = keyStrokeCountThreshold;
    }

    confirm_query(request);
  };

  return [displayInfo, onConfirmQuery, onStartGame, onInput]
}
