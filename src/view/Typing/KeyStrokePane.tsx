import _ from 'react';
import { KeyStrokeDisplayInfo, CharacterStyleInformation, CharacterStyleInformationForCanvas } from '@/@types/type';

import { ResponsiveCanvas } from '@/component/ResponsiveCanvas';

import { constructCanvasLine, constructCharacterStyleInformation, calcLineWindowIndex, roundRect, typingviewColors, KEY_STROKES_PER_LAP, REMAIN_LAP_INDICATOR_SCALE, getActualCharacterHeight } from './utility';
import { Box, useTheme } from '@mui/material';

function splitByLap(charStyleInfos: CharacterStyleInformation[], minCursorPosition: number, lapEndPositions: number[], lapEndTimes: number[])
  : [CharacterStyleInformation[][], number[], number, number] {
  let currentLapIndex = 0;

  const lapEndPosDict = new Map<number, boolean>();
  lapEndPositions.forEach(pos => {
    lapEndPosDict.set(pos, true);

    // ラップの終了位置はソートされていることが前提
    if (minCursorPosition > pos) {
      currentLapIndex++;
    }
  });

  let inLapCharStyleInfos: CharacterStyleInformation[] = [];
  const lapCharStyleInfos: CharacterStyleInformation[][] = [];

  const lapTimes: number[] = [];
  let previousLapEndElapsedTime: number = 0;

  charStyleInfos.forEach((elem, i) => {
    inLapCharStyleInfos.push(elem);

    // この要素がラップの最後だったら表示要素を構築する
    if (lapEndPosDict.has(i)) {
      const lapIndex = lapCharStyleInfos.length;
      // ラップタイムは確定してから配列に格納されるのでまだない場合もある
      const lapTimeMS = lapIndex > lapEndTimes.length - 1 ? 0 : lapEndTimes[lapIndex] - previousLapEndElapsedTime;
      lapTimes.push(lapTimeMS);

      previousLapEndElapsedTime = lapEndTimes[lapIndex];
      lapCharStyleInfos.push(inLapCharStyleInfos);

      inLapCharStyleInfos = [];
    }
  });

  if (inLapCharStyleInfos.length != 0) {
    lapCharStyleInfos.push(inLapCharStyleInfos);
    lapTimes.push(0);
  }

  const inLapMinCursorPosition = lapCharStyleInfos[currentLapIndex].findIndex((charStyleInfo) => { return charStyleInfo.cursorRelative == 'onCursor' });

  return [lapCharStyleInfos, lapTimes, currentLapIndex, inLapMinCursorPosition]
}

export function KeyStrokePane(props: { keyStrokeDisplayInfo: KeyStrokeDisplayInfo }) {
  const { keyStroke, currentCursorPosition, missedPositions, lapEndTime, lapEndPositions } = props.keyStrokeDisplayInfo;

  const theme = useTheme();
  const [normalTextColor, wrongTextColor, outRangeTextColor, cursorTextColor, borderColor] = typingviewColors(theme);

  const draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const [charStyleInfos, minCursorPosition] = constructCharacterStyleInformation(keyStroke, [currentCursorPosition], missedPositions, keyStroke.length - 1);
    const [lapCharStyleInfos, lapTimes, currentLapIndex, inLapMinCursorPosition] = splitByLap(charStyleInfos, minCursorPosition, lapEndPositions, lapEndTime);

    ctx.clearRect(0, 0, width, height);

    // Remaining area is for lap time
    const lineWindowWidth = Math.floor(width * 0.8);

    // Because key stroke characters are all single width, 2 is multiplied
    // 10 is added for margin
    const doubleCharacterWidth = Math.floor(lineWindowWidth / (KEY_STROKES_PER_LAP + 10) * 2);

    ctx.font = `${doubleCharacterWidth}px TyperConciergeFont`;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'start';

    const characterHeight = getActualCharacterHeight(ctx);

    const remainingLapIndicatorHeight = Math.floor(characterHeight * REMAIN_LAP_INDICATOR_SCALE);
    const lineWindowHeight = height - remainingLapIndicatorHeight;

    const lines: CharacterStyleInformationForCanvas[][] = [];
    // [行の所属するラップのインデックス, 行を含めてそのラップには残り何行あるか]
    const lapOfLines: [number, number][] = [];

    let cursorLineIndex = 0;

    lapCharStyleInfos.forEach((lapCharStyleInfo, i) => {
      const [inLapLines, inLapCursorLineIndex] = constructCanvasLine(lapCharStyleInfo, i == currentLapIndex ? inLapMinCursorPosition : 0, lineWindowWidth, doubleCharacterWidth);

      for (let remainedLine = inLapLines.length; remainedLine >= 1; remainedLine--) {
        lapOfLines.push([i, remainedLine]);
      }

      if (i == currentLapIndex) {
        cursorLineIndex = lines.length + inLapCursorLineIndex;
      }
      lines.push(...inLapLines);
    });

    // 2 is multiplied for margin
    const yDelta = Math.ceil(characterHeight * 2);
    const lineWindowCapacity = Math.floor(lineWindowHeight / yDelta);

    const [windowTopIndex, windowBottomIndex] = calcLineWindowIndex(lines.length, lineWindowCapacity, cursorLineIndex);

    for (let lineIdx = windowTopIndex; lineIdx <= windowBottomIndex; lineIdx++) {
      for (const element of lines[lineIdx]) {
        if (element.isWrong) {
          ctx.fillStyle = wrongTextColor;
        } else if (element.cursorRelative == 'before' || element.isOutRange) {
          ctx.fillStyle = outRangeTextColor;
        } else if (element.cursorRelative == 'onCursor') {
          ctx.fillStyle = cursorTextColor;
        } else {
          ctx.fillStyle = normalTextColor;
        }

        if (element.explicitSpace) {
          ctx.fillText('⬚', element.x, yDelta * (lineIdx - windowTopIndex));
        } else {
          ctx.fillText(element.c, element.x, yDelta * (lineIdx - windowTopIndex));
        }
      }
    }

    // Draw lap time rectangles
    const lapTimeAreaWidth = width - lineWindowWidth;
    const xMarginForLapTimeRectangle = Math.floor(lapTimeAreaWidth * 0.1);
    let y = 0;
    for (let lineIdx = windowTopIndex; lineIdx <= windowBottomIndex;) {
      const [lapIndex, lineCount] = lapOfLines[lineIdx];

      const rectangleBorderWidth = 2;

      const rectangleWidth = Math.floor(lapTimeAreaWidth * 0.8);
      const rectangleUpperLeftX = lineWindowWidth + xMarginForLapTimeRectangle;
      const rectangleUpperLeftY = y + rectangleBorderWidth;

      // Designate gap between rectangles in 0 to 1. 1 means no gap.
      const rectangleGapFactor = 0.8;
      // How many lines are lap rectangle cover
      // TODO: There may be no meaning not to use just lineCount
      const rectangleHeightMultiplier = Math.min(lineCount, windowBottomIndex - lineIdx + 1);
      const rectangleHeight = Math.floor(yDelta * rectangleGapFactor - rectangleBorderWidth + (rectangleHeightMultiplier - 1) * yDelta);

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = rectangleBorderWidth;
      roundRect(ctx, rectangleUpperLeftX, rectangleUpperLeftY, rectangleWidth, rectangleHeight, 3);

      ctx.font = `${doubleCharacterWidth}px TyperConciergeFont`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillStyle = normalTextColor;

      const lapTimeText = lapTimes[lapIndex] == 0 ? '' : `${(lapTimes[lapIndex] / 1000).toFixed(3)}秒`;
      ctx.fillText(lapTimeText, rectangleUpperLeftX + Math.floor(rectangleWidth / 2), rectangleUpperLeftY + Math.floor(rectangleHeight / 2));

      y += yDelta * lineCount;
      lineIdx += lineCount;
    }

    // Draw remaining lap indicator
    const remainingLapIndicatorFontSize = Math.floor(doubleCharacterWidth * REMAIN_LAP_INDICATOR_SCALE);

    if ((windowBottomIndex + 1) < lines.length) {
      ctx.font = `${remainingLapIndicatorFontSize}px TyperConciergeFont`;
      ctx.textBaseline = 'top';
      ctx.textAlign = 'center';
      ctx.fillStyle = normalTextColor;
      ctx.fillText(`︾${lines.length - (windowBottomIndex + 1)}行`, Math.floor(width / 2), lineWindowHeight);
    }
  };


  return (
    <Box height={'100%'} width={'100%'} border={2} borderRadius={2} borderColor={'primary.main'} padding={2}>
      <ResponsiveCanvas sensitivity={[props.keyStrokeDisplayInfo]} draw={draw} />
    </Box>
  );
}
