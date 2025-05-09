import React from 'react';
import { LibraryOperator } from './@types/type';
import { DictionaryInfo, DictionaryOrigin } from '../pkg/typer_concierge_web';
import { Box, Checkbox, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip, Typography } from '@mui/material';
import { ErrorOutline, WarningAmberOutlined } from '@mui/icons-material';

export function SelectDictionaryPane(props: { availableDictionaryList: DictionaryInfo[], usedDictionaryList: [DictionaryOrigin, string][], libraryOperator: LibraryOperator }): React.JSX.Element {
  const usedDictionaryOneHot = new Map<string, boolean>(props.usedDictionaryList.map(e => [`${e[0]} ${e[1]}`, true]));

  const elem: React.JSX.Element[] = [];

  const DISABLED_DICTIONARY_TOOLTIP_TEXT = '辞書に含まれる語彙がありません';
  const DICTIONARY_CONTAIN_ERROR_TOOLTIP_TEXT_BASE = '以下の行に無効な語彙があります';

  // 表示用に辞書をソートする
  // TODO ソート順がいろいろあると嬉しい
  const sortedAvailableDictionaryList = Array.from(props.availableDictionaryList).sort((a, b) => {
    const aName = a.name;
    const bName = b.name;
    if (aName < bName) {
      return -1;
    } else if (aName > bName) {
      return 1;
    } else {
      return 0;
    }
  });

  // 辞書リストのそれぞれの項目を構築
  sortedAvailableDictionaryList.forEach((dictionaryInfo: DictionaryInfo, i: number) => {
    const dictionaryName = dictionaryInfo.origin === 'user_defined' ? `${dictionaryInfo.name}` : `${dictionaryInfo.name}`;
    const enable = dictionaryInfo.validVocabularyCount !== 0;
    // XXX 文と単語の辞書の名前に被りがあった時に衝突しないか
    const used = usedDictionaryOneHot.has(`${dictionaryInfo.origin} ${dictionaryInfo.name}`);

    // 辞書に無効な語彙を含むときの警告文の生成
    let containErrorTooltipText = DICTIONARY_CONTAIN_ERROR_TOOLTIP_TEXT_BASE;
    dictionaryInfo.invalidLineNumbers.forEach(lineNum => {
      containErrorTooltipText = containErrorTooltipText.concat(`\r\n${lineNum}行目`);
    });

    const onChange = (name: string, origin: DictionaryOrigin) => {
      if (used) {
        return () => {
          props.libraryOperator.disuse(name, origin);
        }
      } else {
        return () => {
          props.libraryOperator.use(name, origin);
        }
      }
    }

    const checkbox = (
      <ListItem key={i} disablePadding secondaryAction={
        <span className='ms-auto'>
          {dictionaryInfo.invalidLineNumbers.length != 0 ?
            <Tooltip title={
              <React.Fragment>
                <Typography variant='caption'>{DICTIONARY_CONTAIN_ERROR_TOOLTIP_TEXT_BASE}</Typography>
                <ul>
                  {
                    dictionaryInfo.invalidLineNumbers.map((lineNum, i) => {
                      return <li key={i}>
                        <Typography variant='caption'>{lineNum}行目</Typography>
                      </li>
                    })
                  }
                </ul>
              </React.Fragment>
            } placement='top'>
              <WarningAmberOutlined fontSize='small' color='warning' />
            </Tooltip>
            : undefined}
          {!enable ?
            <Tooltip title={DISABLED_DICTIONARY_TOOLTIP_TEXT} placement='top'>
              <ErrorOutline fontSize='small' color='error' />
            </Tooltip>
            : undefined}
        </span>
      }>
        <ListItemButton selected={used} disabled={!enable} onClick={onChange(dictionaryInfo.name, dictionaryInfo.origin)}>
          <ListItemIcon>
            <Checkbox checked={used} />
          </ListItemIcon>
          <ListItemText >
            {dictionaryName}
          </ListItemText>

        </ListItemButton>
      </ListItem>
    );

    elem.push(checkbox);
  });

  return (
    <Box height={'100%'} width={'100%'} overflow={'auto'}>
      <List>
        {elem}
      </List>
    </Box>
  );
}
