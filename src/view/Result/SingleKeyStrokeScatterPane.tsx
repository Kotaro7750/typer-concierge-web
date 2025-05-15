import _ from 'react';
import { TileCard } from './TileCard';
import { SingleKeyStrokeSkill } from 'pkg/typer_concierge_web';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LinearScale, PointElement, ChartOptions } from "chart.js";
import Color from 'color';
import { Stack, Typography, useTheme } from '@mui/material';
import { keyStrokeForDisplay } from './utility';
import Annotation from 'chartjs-plugin-annotation';

export function SingleKeyStrokePlot(props: { averageWPS: number, averageAccuracyPercent: number, stat: SingleKeyStrokeSkill[] }) {
  ChartJS.register(ArcElement, Tooltip, Legend, LinearScale, PointElement, Annotation);

  const averageStrokeTimeMs = 1000.0 / props.averageWPS;

  // Divide data points into four categories based on accuracy and average time
  type DataPoint = { key: string, x: number, y: number };
  const accurateFast: DataPoint[] = [];
  const accurateSlow: DataPoint[] = [];
  const inaccurateFast: DataPoint[] = [];
  const inaccurateSlow: DataPoint[] = [];

  props.stat.forEach((singleKeyStrokeStat) => {
    const key = singleKeyStrokeStat.keyStroke;
    const accuracy = singleKeyStrokeStat.accuracy;
    const accuracyPercent = accuracy * 100;
    const averageTimeMs = singleKeyStrokeStat.averageTimeMs;

    if (accuracyPercent >= props.averageAccuracyPercent) {
      if (averageTimeMs <= averageStrokeTimeMs) {
        accurateFast.push({ key, x: accuracyPercent, y: averageTimeMs });
      } else {
        accurateSlow.push({ key, x: accuracyPercent, y: averageTimeMs });
      }
    } else {
      if (averageTimeMs <= averageStrokeTimeMs) {
        inaccurateFast.push({ key, x: accuracyPercent, y: averageTimeMs });
      } else {
        inaccurateSlow.push({ key, x: accuracyPercent, y: averageTimeMs });
      }
    }
  });

  const theme = useTheme();
  const datapointAlpha = 0.8;

  const data = {
    datasets: [
      {
        label: '正確で速い',
        data: accurateFast,
        backgroundColor: Color(theme.palette.success.main).alpha(datapointAlpha).rgb().string(),
      },
      {
        label: '正確で遅い',
        data: accurateSlow,
        backgroundColor: Color(theme.palette.info.main).alpha(datapointAlpha).rgb().string(),
      },
      {
        label: '不正確で速い',
        data: inaccurateFast,
        backgroundColor: Color(theme.palette.warning.main).alpha(datapointAlpha).rgb().string(),
      },
      {
        label: '不正確で遅い',
        data: inaccurateSlow,
        backgroundColor: Color(theme.palette.error.main).alpha(datapointAlpha).rgb().string(),
      }
    ],
  };

  const areaAlpha = 0.2;

  const options: ChartOptions<'scatter'> = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function(ctx: any) {
            const point = ctx.raw;
            return `キー:${keyStrokeForDisplay(point.key)} 正確さ:${point.x.toFixed(0)}% 平均タイプ時間:${point.y}ms`;
          }
        }
      },
      annotation: {
        annotations: {
          VerticalLine: {
            type: 'line',
            xMin: props.averageAccuracyPercent,
            xMax: props.averageAccuracyPercent,
            borderColor: 'red',
            borderWidth: 1,
            borderDash: [10, 5],
            label: {
              content: `平均 ${props.averageAccuracyPercent}%`,
              display: false,
            },
            enter({ element }, _) {
              if (!element.label) {
                return
              }
              element.label.options.display = true;
              return true;
            },
            leave({ element }, _) {
              if (!element.label) {
                return
              }
              element.label.options.display = false;
              return true;
            }
          },
          HorizontalLine: {
            type: 'line',
            yMin: averageStrokeTimeMs,
            yMax: averageStrokeTimeMs,
            borderColor: 'orange',
            borderWidth: 1,
            borderDash: [10, 5],
            label: {
              content: `平均 ${averageStrokeTimeMs}ms`,
              display: false,
            },
            enter({ element }, _) {
              if (!element.label) {
                return
              }
              element.label.options.display = true;
              return true;
            },
            leave({ element }, _) {
              if (!element.label) {
                return
              }
              element.label.options.display = false;
              return true;
            }
          },
          AccurateFast: {
            type: 'box',
            xMin: props.averageAccuracyPercent,
            yMax: averageStrokeTimeMs,
            backgroundColor: Color(theme.palette.success.main).alpha(areaAlpha).rgb().string(),
            borderWidth: 0,
          },
          AccurateSlow: {
            type: 'box',
            xMin: props.averageAccuracyPercent,
            yMin: averageStrokeTimeMs,
            backgroundColor: Color(theme.palette.info.main).alpha(areaAlpha).rgb().string(),
            borderWidth: 0,
          },
          InaccurateFast: {
            type: 'box',
            xMax: props.averageAccuracyPercent,
            yMax: averageStrokeTimeMs,
            backgroundColor: Color(theme.palette.warning.main).alpha(areaAlpha).rgb().string(),
            borderWidth: 0,
          },
          InaccurateSlow: {
            type: 'box',
            xMax: props.averageAccuracyPercent,
            yMin: averageStrokeTimeMs,
            backgroundColor: Color(theme.palette.error.main).alpha(areaAlpha).rgb().string(),
            borderWidth: 0,
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '正確さ（%）',
        },
        beginAtZero: false,
      },
      y: {
        title: {
          display: true,
          text: '平均タイプ時間（ms）',
        },
        beginAtZero: false,
      },
    }
  }

  return (
    <TileCard>
      <Stack alignItems={'center'}>
        <Typography variant="h6" >
          タイプ速度・精度マップ
        </Typography>
        <Scatter data={data} options={options} />
      </Stack>
    </TileCard>
  )
}
