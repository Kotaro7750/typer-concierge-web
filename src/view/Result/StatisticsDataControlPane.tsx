import _, { useContext } from 'react';
import { IconButton, Stack, Tooltip, useTheme } from '@mui/material';
import { TileCard } from './TileCard';
import { Analytics, Delete } from '@mui/icons-material';
import Color from 'color';
import { NotificationContext } from '@/App';
import { reset_statistics } from 'pkg/typer_concierge_web';

export function StatisticsDataControlPane(props: { onResetStatistics: () => void }) {
  const notificationRegisterer = useContext(NotificationContext);

  const resetStatistics = () => {
    try {
      reset_statistics();
      props.onResetStatistics();
      notificationRegisterer.get('success')?.("成功", "正常に統計データをリセットできました");
    } catch (e) {
      notificationRegisterer.get('error')?.("エラー", "統計データのリセットに失敗しました");
    }
  }

  const manageResult = () => {
    notificationRegisterer.get('warning')?.("未実装エラー", "統計データの管理は未実装です");
  }

  const theme = useTheme();
  const STATISTICS_FUNCTION_DESCRIPTION = `統計データはリロードやページを離れたりしない限り累積されていきます。何回も繰り返しタイピングを行っていくことでより正確な統計データを取得することができます。`;

  return (
    <TileCard sx={{ height: '100%', backgroundColor: `${Color(theme.palette.success.main).alpha(0.2).rgb().string()}` }}>
      <Stack spacing={2} alignItems="center" height={'100%'}>
        <Tooltip title={STATISTICS_FUNCTION_DESCRIPTION}>
          <IconButton size="large" color='success' onClick={manageResult}>
            <Analytics fontSize='large' />
          </IconButton>
        </Tooltip>
        <IconButton size="large" color='default' onClick={resetStatistics}>
          <Delete fontSize='large' />
        </IconButton>
      </Stack>
    </TileCard >
  );
};

