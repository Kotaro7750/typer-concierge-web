use dictionary::{
    Dictionary, DictionaryCatalog, DictionaryIndex, DictionaryOrigin, DictionaryType,
};
use serde::Deserialize;
use serde_wasm_bindgen::from_value;
use std::collections::HashMap;
use std::num::NonZeroUsize;
use tsify::Tsify;
use typing_engine::VocabularyEntry;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen_futures::JsFuture;
use web_sys::Response;

use crate::WasmError;

pub(crate) mod dictionary;
#[cfg(test)]
// This module is for testing dictionary file in public directory
mod dictionary_validity;

/// A type alias for a dictionary map, where the key is a tuple of the dictionary origin and its
/// name.
pub(crate) type DictionariesInLibrary = HashMap<(DictionaryOrigin, String), Dictionary>;

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Tsify)]
#[tsify(from_wasm_abi)]
#[serde(rename_all = "camelCase")]
/// A struct representing a request from the UI to construct a query.
pub struct QueryRequestFromUI {
    dictionary_type: DictionaryType,
    used_dictionaries: Vec<(DictionaryOrigin, String)>,
    key_stroke_count_threshold: Option<NonZeroUsize>,
}

impl QueryRequestFromUI {
    pub(crate) fn dictionary_type(&self) -> DictionaryType {
        self.dictionary_type
    }

    pub(crate) fn used_dictionaries(&self) -> &[(DictionaryOrigin, String)] {
        &self.used_dictionaries
    }

    pub(crate) fn key_stroke_count_threshold(&self) -> Option<NonZeroUsize> {
        self.key_stroke_count_threshold
    }
}

/// A sruct responsible for loading and managing dictionaries.
pub(crate) struct Library {
    word_dictionaries: DictionariesInLibrary,
    sentence_dictionaries: DictionariesInLibrary,
}

impl Library {
    pub fn new() -> Self {
        Self {
            word_dictionaries: HashMap::new(),
            sentence_dictionaries: HashMap::new(),
        }
    }

    /// Loads the dictionaries
    pub(crate) async fn load(&mut self, window: &web_sys::Window) -> Result<(), WasmError> {
        let dictionary_index = self.get_dictionary_index(window).await?;

        let (word, sentence) = dictionary_index.construct_dictionaries(window).await?;

        self.word_dictionaries = word;
        self.sentence_dictionaries = sentence;

        Ok(())
    }

    /// Loads the dictionary indeces from index JSON file
    async fn get_dictionary_index(
        &self,
        window: &web_sys::Window,
    ) -> Result<DictionaryIndex, WasmError> {
        // 1. Fetch dictionary index JSON
        let request_promise = window.fetch_with_str("dictionary_index.json");

        let response = JsFuture::from(request_promise).await?;
        let response: Response = response.dyn_into()?;

        let json = JsFuture::from(response.json()?).await?;

        // 2. Parse JSON
        Ok(from_value(json)?)
    }

    /// Construct and return dictionary catalog from the loaded dictionaries
    pub(crate) fn construct_dictionary_catalog(&self) -> DictionaryCatalog {
        DictionaryCatalog::new(
            self.word_dictionaries
                .values()
                .map(|d| d.construct_dictionary_info())
                .collect(),
            self.sentence_dictionaries
                .values()
                .map(|d| d.construct_dictionary_info())
                .collect(),
        )
    }

    /// Constructs vocabulary entries for the given request.
    pub(crate) fn construct_vocabulary_entries_for_request(
        &self,
        request: &QueryRequestFromUI,
    ) -> Vec<&VocabularyEntry> {
        let mut vocabulary_entries = Vec::new();

        for (origin, name) in request.used_dictionaries() {
            let dictionary = match request.dictionary_type() {
                DictionaryType::Word => self
                    .word_dictionaries
                    .get(&(*origin, name.clone()))
                    .unwrap(),
                DictionaryType::Sentence => self
                    .sentence_dictionaries
                    .get(&(*origin, name.clone()))
                    .unwrap(),
            };

            vocabulary_entries.append(&mut dictionary.get_vocabulary_entries());
        }

        vocabulary_entries
    }
}
