import _, { useState } from 'react';
import { DisplayInfo } from '@/@types/type';
import { start_game, stroke_key } from 'pkg/typer_concierge_web';

export function useTypingEngine(onFinished: () => void): [DisplayInfo | null, () => void, (c: string, elapsedTimeMs: number) => void] {
  const [displayInfo, setDisplayInfo] = useState<DisplayInfo | null>(null);


  const startGame = () => {
    // XXX try-catch
    const displayInfo = start_game();
    setDisplayInfo(displayInfo);
  }

  const onInput = (c: string, elapsedTimeMs: number) => {
    // XXX try-catch
    const result = stroke_key({ key: c, elapsedTimeMs: elapsedTimeMs })
    setDisplayInfo(result.displayInformation);
    if (result.isFinished) {
      onFinished();
    }
  }

  return [displayInfo, startGame, onInput]
}
