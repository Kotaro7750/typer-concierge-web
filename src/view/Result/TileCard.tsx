import React from 'react';
import { Card, CardProps, CardContent } from '@mui/material';

type TileCardProps = CardProps & {
  children: React.ReactNode;
};

export const TileCard: React.FC<TileCardProps> = ({ children, ...props }) => {
  return (
    <Card
      elevation={3}
      sx={{
        width: '100%',
        height: '100%',
        borderRadius: 2,
        padding: 2,
        backgroundColor: '#fdfdfd',
        ...props.sx,
      }}
      {...props}
    >
      <CardContent sx={{ width: '100%', height: '100%' }}>
        {children}
      </CardContent>
    </Card>
  );
};
