use dictionary::DictionaryCatalog;
use dictionary::{Dictionary, DictionaryIndex, DictionaryOrigin};
use serde_wasm_bindgen::from_value;
use std::collections::HashMap;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen_futures::JsFuture;
use web_sys::Response;

pub(crate) mod dictionary;
#[cfg(test)]
// This module is for testing dictionary file in public directory
mod dictionary_validity;

/// A type alias for a dictionary map, where the key is a tuple of the dictionary origin and its
/// name.
pub(crate) type DictionariesInLibrary = HashMap<(DictionaryOrigin, String), Dictionary>;

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
    pub(crate) async fn load(&mut self, window: &web_sys::Window) -> Result<(), JsValue> {
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
    ) -> Result<DictionaryIndex, JsValue> {
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
                .iter()
                .map(|(_, d)| d.construct_dictionary_info())
                .collect(),
            self.sentence_dictionaries
                .iter()
                .map(|(_, d)| d.construct_dictionary_info())
                .collect(),
        )
    }
}
