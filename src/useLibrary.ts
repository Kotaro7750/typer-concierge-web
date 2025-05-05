import { useEffect, useReducer, useState, useActionState, startTransition } from 'react';
import { Library, LibraryOperator } from './@types/type';
import { get_dictionary_catalog, DictionaryType, DictionaryOrigin, DictionaryCatalog, confirm_query, QueryRequestFromUI } from '../pkg/typer_concierge_web';

export function useLibrary(errorHandler: (e: Error) => void): [Library, LibraryOperator] {

  type LibraryReducerActionType =
    { type: 'use', dictionaryName: string, dictionaryOrigin: DictionaryOrigin }
    | { type: 'disuse', dictionaryName: string, dictionaryOrigin: DictionaryOrigin }

  // Libraryとは異なり現在有効な辞書タイプではない方も保持する
  type LibraryInner = {
    usedDictionaries: {
      word: [DictionaryOrigin, string][],
      sentence: [DictionaryOrigin, string][],
    },
  }

  const existInCatalog = (catalog: DictionaryCatalog, dictionaryName: string, dictionaryType: DictionaryType, dictionaryOrigin: DictionaryOrigin) => {
    const catalogOfType = dictionaryType == 'word' ? catalog.word : catalog.sentence;

    for (let dictionaryInfo of catalogOfType) {
      if (dictionaryInfo.dictionaryType != dictionaryType) {
        throw new Error(`DictionaryType mismatch in ${dictionaryInfo.name} expected ${dictionaryType}, but ${dictionaryInfo.dictionaryType}`);
      }

      if (dictionaryInfo.name == dictionaryName && dictionaryInfo.origin == dictionaryOrigin) {
        return true;
      }
    }

    return false;
  };

  // 辞書群関連をまとめて１つのstateとして管理する
  const libraryReducer: React.Reducer<LibraryInner, LibraryReducerActionType> = (state: LibraryInner, action: LibraryReducerActionType) => {
    switch (action.type) {
      // 現在有効になっている辞書タイプで利用可能な辞書から追加する
      case 'use':
        if (!existInCatalog(catalog, action.dictionaryName, usedDictionaryType, action.dictionaryOrigin)) {
          throw new Error(`used dictionary(${action.dictionaryName}) not in catalog`);
        }

        // 現在有効になっている辞書タイプによって追加する場所を切り替える
        const addedUsedDictionaries: { word: [DictionaryOrigin, string][], sentence: [DictionaryOrigin, string][] } = usedDictionaryType == 'word' ? {
          word: state.usedDictionaries.word.concat([[action.dictionaryOrigin, action.dictionaryName]]),
          sentence: state.usedDictionaries.sentence,
        } : {
          word: state.usedDictionaries.word,
          sentence: state.usedDictionaries.sentence.concat([[action.dictionaryOrigin, action.dictionaryName]]),
        };

        return {
          usedDictionaries: addedUsedDictionaries,
        };

      // 現在有効になっている辞書タイプで利用可能な辞書を不使用とする
      case 'disuse':
        if (!existInCatalog(catalog, action.dictionaryName, usedDictionaryType, action.dictionaryOrigin)) {
          throw new Error(`disused dictionary(${action.dictionaryName}) not in catalog`);
        }

        const deletedUsedDictionaryFileNameList: { word: [DictionaryOrigin, string][], sentence: [DictionaryOrigin, string][] } = usedDictionaryType == 'word' ? {
          word: state.usedDictionaries.word.filter(e => e[0] !== action.dictionaryOrigin || e[1] !== action.dictionaryName),
          sentence: state.usedDictionaries.sentence,
        } : {
          word: state.usedDictionaries.word,
          sentence: state.usedDictionaries.sentence.filter(e => e[0] !== action.dictionaryOrigin || e[1] !== action.dictionaryName),
        };


        return {
          usedDictionaries: deletedUsedDictionaryFileNameList,
        };

    }
  }

  const confirmQuery = (keyStrokeCountThreshold: number) => {
    let request: QueryRequestFromUI = {
      dictionaryType: usedDictionaryType,
      usedDictionaries: effectiveUsedDictionaries,
      keyStrokeCountThreshold: null,
    }

    if (usedDictionaryType == 'word') {
      request.keyStrokeCountThreshold = keyStrokeCountThreshold;
    }

    confirm_query(request);
  };

  const [usedDictionaryType, setUsedDictionaryType] = useState<DictionaryType>('word');

  const initialCatalog: DictionaryCatalog = {
    word: [],
    sentence: [],
  }
  const loadCatalog = async (_: DictionaryCatalog) => {
    let catalog: DictionaryCatalog = initialCatalog;

    try {
      catalog = await get_dictionary_catalog();
    } catch (e: any) {
      errorHandler(e);
    }

    // XXX
    // Exclusion from used dictionary list is needed

    return catalog;
  };

  const [catalog, kickLoadCatalog, isLibraryLoading] = useActionState<DictionaryCatalog>(loadCatalog, initialCatalog);

  const operator: LibraryOperator = {
    use: (dictionaryName: string, dictionaryOrigin: DictionaryOrigin) => {
      dispatchLibrary({ type: 'use', dictionaryName: dictionaryName, dictionaryOrigin: dictionaryOrigin });
    },
    disuse: (dictionaryName: string, dictionaryOrigin: DictionaryOrigin) => {
      dispatchLibrary({ type: 'disuse', dictionaryName: dictionaryName, dictionaryOrigin: dictionaryOrigin });
    },
    load: () => {
      startTransition(() => kickLoadCatalog());
    },
    setType: (dictionaryType: DictionaryType) => {
      setUsedDictionaryType(dictionaryType);
    },
    confirmQuery: (keyStrokeCountThreshold: number) => {
      confirmQuery(keyStrokeCountThreshold);
    },
  }

  // 依存なしなので初回のみ
  useEffect(() => {
    startTransition(() => kickLoadCatalog());
  }, []);

  const [innerLibrary, dispatchLibrary] = useReducer(libraryReducer, {
    usedDictionaries: { word: [], sentence: [] },
  });

  // 返却する型は現在有効な辞書タイプの情報のみを持つ
  const effectiveUsedDictionaries = usedDictionaryType == 'word' ? innerLibrary.usedDictionaries.word : innerLibrary.usedDictionaries.sentence;
  const effectiveCatalog = usedDictionaryType == 'word' ? catalog.word : catalog.sentence;

  const library: Library = {
    usedDictionaries: effectiveUsedDictionaries,
    catalog: effectiveCatalog,
    usedDictionaryType,
    isAvailableDictionariesLoading: isLibraryLoading,
  };

  return [library, operator];
}
