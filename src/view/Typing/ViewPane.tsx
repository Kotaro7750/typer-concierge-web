import React from 'react';
import { ViewDisplayInfo } from '@/@types/type';
import { ResponsiveCanvas } from '@/component/ResponsiveCanvas';
import { constructCharacterStyleInformation, constructCanvasLine, calcLineWindowIndex, typingviewColors, VIEW_CHARACTERS_PER_LINE, REMAIN_LAP_INDICATOR_SCALE, getActualCharacterHeight } from './utility';
import { Box, useTheme } from '@mui/material';

export function ViewPane(props: { viewDisplayInfo: ViewDisplayInfo }): React.JSX.Element {
  const viewDisplayInfo = props.viewDisplayInfo;

  const theme = useTheme();
  const [normalTextColor, wrongTextColor, outRangeTextColor, cursorTextColor, _] = typingviewColors(theme);

  const draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    const doubleCharacterWidth = Math.floor(width / VIEW_CHARACTERS_PER_LINE);

    ctx.font = `${doubleCharacterWidth}px TyperConciergeFont`;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'start';

    const characterHeight = getActualCharacterHeight(ctx);

    const remainingLapIndicatorHeight = Math.floor(characterHeight * REMAIN_LAP_INDICATOR_SCALE);
    const lineWindowHeight = height - remainingLapIndicatorHeight;

    const yDelta = Math.ceil(characterHeight * 1.5);
    const lineWindowCapacity = Math.floor(lineWindowHeight / yDelta);

    const [charStyleInfos, minCursorPosition] = constructCharacterStyleInformation(viewDisplayInfo.view, viewDisplayInfo.currentCursorPositions, viewDisplayInfo.missedPositions, viewDisplayInfo.lastPosition);
    const [lines, cursorLineIndex] = constructCanvasLine(charStyleInfos, minCursorPosition, width, doubleCharacterWidth);


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
      <ResponsiveCanvas sensitivity={[viewDisplayInfo]} draw={draw} />
    </Box>
  );
}
