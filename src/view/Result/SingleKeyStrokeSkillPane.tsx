import { useState, useMemo } from 'react';
import { SingleKeyStrokeSkill } from 'pkg/typer_concierge_web';
import { TileCard } from './TileCard';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Grid,
  Button,
  Modal,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { keyStrokeForDisplay } from './utility';

interface SingleKeyStrokeSkillPaneProps {
  stat: SingleKeyStrokeSkill[];
}

type SortKey = 'accuracy' | 'averageTimeMs' | 'wrongCount';

export function SingleKeyStrokeSkillPane({ stat }: SingleKeyStrokeSkillPaneProps) {
  const [sortKey, setSortKey] = useState<SortKey>('accuracy');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSortColumn, setModalSortColumn] = useState<keyof SingleKeyStrokeSkill>('keyStroke');
  const [modalSortDirection, setModalSortDirection] = useState<'asc' | 'desc'>('asc');

  const displayStringOfSortKey = new Map<SortKey, string>([
    ['accuracy', '正確率'],
    ['averageTimeMs', '平均タイプ時間'],
    ['wrongCount', 'ミスタイプ数'],
  ]);

  const sorted = useMemo(() => {
    return [...stat].sort((a, b) => {
      switch (sortKey) {
        case 'accuracy':
          return b.accuracy - a.accuracy;
        case 'averageTimeMs':
          return Math.floor(a.averageTimeMs) - Math.floor(b.averageTimeMs);
        case 'wrongCount':
          return a.wrongCount - b.wrongCount;
        default:
          return 0;
      }
    });
  }, [stat, sortKey]);

  const modalSorted = useMemo(() => {
    return [...stat].sort((a, b) => {
      const direction = modalSortDirection === 'asc' ? 1 : -1;
      const getValue = (x: SingleKeyStrokeSkill) => {
        switch (modalSortColumn) {
          case 'keyStroke':
            return x.keyStroke;
          case 'count':
            return x.count;
          case 'accuracy':
            return x.accuracy;
          case 'averageTimeMs':
            return x.averageTimeMs;
          case 'wrongCount':
            return x.wrongCount;
          default:
            return 0;
        }
      };

      const valA = getValue(a);
      const valB = getValue(b);
      if (typeof valA === 'string' && typeof valB === 'string') {
        return valA.localeCompare(valB) * direction;
      }
      return ((valA as number) - (valB as number)) * direction;
    });
  }, [stat, modalSortColumn, modalSortDirection]);

  const toggleModal = () => setModalOpen(prev => !prev);

  const handleSortClick = (column: keyof SingleKeyStrokeSkill) => {
    if (modalSortColumn === column) {
      setModalSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setModalSortColumn(column);
      setModalSortDirection('asc');
    }
  };

  const formatLabel = (skill: SingleKeyStrokeSkill): string => {
    const labelMap: Record<SortKey, string> = {
      accuracy: `${(skill.accuracy * 100).toFixed(2)}%`,
      averageTimeMs: `${Math.floor(skill.averageTimeMs)} ms`,
      wrongCount: `${skill.wrongCount}回`,
    };
    return labelMap[sortKey];
  };

  const top3 = sorted.slice(0, 3);
  const bottom3 = sorted.slice(-3).reverse();

  const getTooltipContent = (skill: SingleKeyStrokeSkill): React.ReactNode => (
    <>
      <Typography variant="body2" color="text.secondary">
        タイプ数: {skill.count}回
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {displayStringOfSortKey.get('wrongCount')}: {skill.wrongCount}回
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {displayStringOfSortKey.get('accuracy')}: {(skill.accuracy * 100).toFixed(2)}%
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {displayStringOfSortKey.get('averageTimeMs')}: {Math.floor(skill.averageTimeMs)} ms
      </Typography>
    </>
  );

  const RankingItem = ({ idx, skill }: { idx: number; skill: SingleKeyStrokeSkill }) => {
    const displayKey = keyStrokeForDisplay(skill.keyStroke);

    return (
      <ListItem key={`item-${idx}`}>
        <Tooltip title={getTooltipContent(skill)} placement="auto">
          <ListItemText
            primary={
              <Box display="flex" alignItems="center" justifyContent="center">
                <Typography variant="h5" sx={{ fontWeight: 'bold', mr: 1 }}>
                  {displayKey}
                </Typography>
                <Typography variant="h6">{formatLabel(skill)}</Typography>
              </Box>
            }
          />
        </Tooltip>
      </ListItem>
    );
  };

  const noMistypes = stat.every(skill => skill.wrongCount === 0);

  return (
    <>
      <TileCard>
        <Box mb={2}>
          <FormControl fullWidth size="small">
            <InputLabel id="sort-key-select-label">指標を選択</InputLabel>
            <Select
              labelId="sort-key-select-label"
              value={sortKey}
              label="指標を選択"
              onChange={(e) => setSortKey(e.target.value as SortKey)}
            >
              {Array.from(displayStringOfSortKey.entries()).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {noMistypes && sortKey !== 'averageTimeMs' ? (
          <Box textAlign="center" mt={4}>
            <Typography variant="body1" color="text.secondary">
              ミスタイプはありませんでした
            </Typography>
          </Box>
        ) : (
          <Grid container justifyContent="space-between">
            <Grid width="48%">
              <Stack alignItems="center">
                <Typography variant="h6" gutterBottom>
                  <IconButton color="success">
                    <ThumbUpIcon />
                  </IconButton>
                  得意なキー
                </Typography>
                <List dense>
                  {top3.map((skill, idx) => (
                    <RankingItem key={`top-${idx}`} idx={idx} skill={skill} />
                  ))}
                </List>
              </Stack>
            </Grid>

            <Grid container width="4%" justifyContent={'center'}>
              <Divider orientation="vertical" />
            </Grid>

            <Grid width="48%">
              <Stack alignItems="center">
                <Typography variant="h6" gutterBottom>
                  <IconButton color="error">
                    <ThumbDownIcon />
                  </IconButton>
                  苦手なキー
                </Typography>
                <List dense>
                  {bottom3.map((skill, idx) => (
                    <RankingItem key={`bottom-${idx}`} idx={idx} skill={skill} />
                  ))}
                </List>
              </Stack>
            </Grid>
          </Grid>
        )}

        <Box textAlign="center" mt={3}>
          <Button variant="contained" onClick={toggleModal}>
            全てのキー
          </Button>
        </Box>
      </TileCard>


      <Modal open={modalOpen} onClose={toggleModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxHeight: '80vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Stack alignItems={'center'} width={'100%'} height={'100%'}>
            <Typography variant="h6" gutterBottom>
              全てのキー
            </Typography>
            <TableContainer
              component={Paper}
              sx={{ maxHeight: '60vh', overflowY: 'auto' }}
            >
              <Table size="small" stickyHeader>

                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={modalSortColumn === 'keyStroke'}
                        direction={modalSortDirection}
                        onClick={() => handleSortClick('keyStroke')}
                      >
                        キー
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={modalSortColumn === 'count'}
                        direction={modalSortDirection}
                        onClick={() => handleSortClick('count')}
                      >
                        タイプ数
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={modalSortColumn === 'accuracy'}
                        direction={modalSortDirection}
                        onClick={() => handleSortClick('accuracy')}
                      >
                        {displayStringOfSortKey.get('accuracy')}
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={modalSortColumn === 'averageTimeMs'}
                        direction={modalSortDirection}
                        onClick={() => handleSortClick('averageTimeMs')}
                      >
                        {displayStringOfSortKey.get('averageTimeMs')}
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={modalSortColumn === 'wrongCount'}
                        direction={modalSortDirection}
                        onClick={() => handleSortClick('wrongCount')}
                      >
                        {displayStringOfSortKey.get('wrongCount')}
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {modalSorted.map((skill, idx) => (
                    <TableRow key={`table-${idx}`}>
                      <TableCell>{keyStrokeForDisplay(skill.keyStroke)}</TableCell>
                      <TableCell align="right">{skill.count}</TableCell>
                      <TableCell align="right">{(skill.accuracy * 100).toFixed(2)}%</TableCell>
                      <TableCell align="right">{Math.floor(skill.averageTimeMs)} ms</TableCell>
                      <TableCell align="right">{skill.wrongCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Box>
      </Modal>
    </>
  );
}
