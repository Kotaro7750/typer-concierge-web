import { Box } from '@mui/material';
import React, { useEffect, useRef } from 'react';

export function ResponsiveCanvas(props: { sensitivity: any[], draw: (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => void }): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (containerRef.current === null || canvasRef.current === null) {
      return;
    }

    const scale = window.devicePixelRatio;

    canvasRef.current.width = Math.floor(containerRef.current.clientWidth * scale);
    canvasRef.current.height = Math.floor(containerRef.current.clientHeight * scale);

    const ctx = canvasRef.current.getContext('2d');
    if (ctx === null) {
      return;
    }

    props.draw(ctx, canvasRef.current.width, canvasRef.current.height);
  }, [visualViewport?.width, visualViewport?.height]);

  useEffect(() => {
    if (canvasRef.current === null) {
      return;
    }

    const ctx = canvasRef.current.getContext('2d');
    if (ctx === null) {
      return;
    }

    props.draw(ctx, canvasRef.current.width, canvasRef.current.height);
  }, props.sensitivity);

  return (
    <Box width={'100%'} height={'100%'} ref={containerRef}>
      <canvas style={{ display: 'block', width: '100%', height: '100%' }} ref={canvasRef} />
    </Box>
  );
}
