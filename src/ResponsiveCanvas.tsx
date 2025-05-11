import { Box } from '@mui/material';
import React, { useEffect, useRef } from 'react';

export function ResponsiveCanvas(props: { sensitivity: any[], draw: (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => void }): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const resizeAndDrawCanvas = () => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const scale = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight;

    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(height * scale);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      props.draw(ctx, canvas.width, canvas.height);
    }
  };

  useEffect(() => {
    resizeAndDrawCanvas();

    // Detect size change and kick redraw
    const observer = new ResizeObserver(resizeAndDrawCanvas);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    resizeAndDrawCanvas();
  }, props.sensitivity);

  return (
    <Box width="100%" height="100%" ref={containerRef}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block' }}
      />
    </Box>
  );
}
