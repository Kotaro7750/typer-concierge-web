use std::collections::HashMap;

use futures::future::join_all;
use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::from_value;
use tsify::Tsify;
use typing_engine::VocabularyEntry;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;

use super::DictionariesInLibrary;

/// Parses the body of a dictionary file and returns vocabulary entries and invalid line numbers.
/// Line numbers are 1-indexed.
fn parse_dictionary_body(body: &str) -> (Vec<VocabularyEntry>, Vec<usize>) {
    let mut vocabulary_entries = Vec::new();
    // 1-indexed line numbers
    let mut invalid_line_numbers = Vec::new();

    for (i, line) in body.lines().enumerate() {
        // Empty lines should be considered as error lines
        if line.trim().is_empty() {
            invalid_line_numbers.push(i + 1);
            continue;
        }

        // Parse the line using typing_engine's parse_vocabulary_entry
        match typing_engine::parse_vocabulary_entry(line) {
            Ok(entry) => vocabulary_entries.push(entry),
            Err(_) => {
                invalid_line_numbers.push(i + 1);
            }
        }
    }

    (vocabulary_entries, invalid_line_numbers)
}

#[derive(Serialize, Deserialize, Debug, Clone, Tsify)]
#[tsify(from_wasm_abi)]
/// Represents the index entry for individual dictionary
pub(crate) struct DictionaryIndexEntry {
    /// Path of the dictionary file in the server
    path: String,
}

impl DictionaryIndexEntry {
    /// Construct dictionary itself by fetching dictionary file content and parsing it
    pub(crate) async fn construct_dictionary(
        &self,
        window: &web_sys::Window,
        name: &str,
        dictionary_type: DictionaryType,
    ) -> Result<Dictionary, JsValue> {
        let request_promise = window.fetch_with_str(&self.path);

        let response = JsFuture::from(request_promise).await?;
        let response: web_sys::Response = response.dyn_into()?;

        let text = JsFuture::from(response.text()?).await?;

        let body: String = from_value(text)?;

        let (vocabulary_entries, invalid_line_numbers) = parse_dictionary_body(&body);

        Ok(Dictionary {
            name: name.to_string(),
            dictionary_type,
            origin: DictionaryOrigin::Builtin,
            vocabulary_entries,
            invalid_line_numbers,
        })
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, Tsify)]
#[tsify(from_wasm_abi)]
/// Represents the dictionary index for library
pub(crate) struct DictionaryIndex {
    /// Collection of word dictionaries
    word: HashMap<String, DictionaryIndexEntry>,
    /// Collection of sentence dictionaries
    sentence: HashMap<String, DictionaryIndexEntry>,
}

impl DictionaryIndex {
    /// Construsts actual dictionaries from holing indices
    pub(crate) async fn construct_dictionaries(
        &self,
        window: &web_sys::Window,
    ) -> Result<(DictionariesInLibrary, DictionariesInLibrary), JsValue> {
        // Constructing dictionaries is done in parallel
        let futures = self
            .word
            .iter()
            .map(|(dictionary_name, entry)| {
                entry.construct_dictionary(window, dictionary_name, DictionaryType::Word)
            })
            .chain(self.sentence.iter().map(|(dictionary_name, entry)| {
                entry.construct_dictionary(window, dictionary_name, DictionaryType::Sentence)
            }))
            .collect::<Vec<_>>();

        // Wait for all futures to complete
        let (dictionaries, errors): (
            Vec<Result<Dictionary, JsValue>>,
            Vec<Result<Dictionary, JsValue>>,
        ) = join_all(futures)
            .await
            .into_iter()
            .partition(|result| result.is_ok());
        let dictionaries: Vec<_> = dictionaries.into_iter().map(Result::unwrap).collect();
        let errors: Vec<_> = errors.into_iter().map(Result::unwrap_err).collect();

        errors.into_iter().for_each(|error| {
            web_sys::console::log_1(&format!("Error: {:?}", error).into());
        });

        // Parsed dictionaries must be partitioned by their type
        let (word_dictionaries, sentence_dictionaries): (Vec<Dictionary>, Vec<Dictionary>) =
            dictionaries
                .into_iter()
                .partition(|dictionary| dictionary.dictionary_type == DictionaryType::Word);

        Ok((
            word_dictionaries
                .into_iter()
                .map(|d| ((d.origin, d.name.clone()), d))
                .collect::<HashMap<_, _>>(),
            sentence_dictionaries
                .into_iter()
                .map(|d| ((d.origin, d.name.clone()), d))
                .collect::<HashMap<_, _>>(),
        ))
    }
}

#[derive(Serialize, Deserialize, Debug, Copy, Clone, Tsify, PartialEq, Eq)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "snake_case")]
/// Represents the type of dictionary
pub enum DictionaryType {
    /// Dictionary containing individual words
    Word,
    /// Dictionary containing complete sentences or phrases
    Sentence,
}

#[derive(Serialize, Deserialize, Debug, Copy, Clone, Tsify, PartialEq, Eq, Hash)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "snake_case")]
/// Represents the source of a dictionary
pub enum DictionaryOrigin {
    /// Provided with the application
    Builtin,
    /// Created or imported by the user
    UserDefined,
}

#[derive(Serialize, Deserialize, Debug, Clone, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
/// Contains metadata and information about a specific dictionary
pub struct DictionaryInfo {
    /// Name of the dictionary
    pub name: String,
    /// Type of dictionary
    pub dictionary_type: DictionaryType,
    /// Origin of the dictionary
    pub origin: DictionaryOrigin,
    /// List of line numbers that contain invalid entries in the source file
    pub invalid_line_numbers: Vec<usize>,
    /// Count of valid vocabulary entries in the dictionary
    pub valid_vocabulary_count: usize,
}

#[derive(Debug, Clone)]
/// Represents a dictionary actually containing vocabulary entries
pub(crate) struct Dictionary {
    name: String,
    dictionary_type: DictionaryType,
    origin: DictionaryOrigin,
    vocabulary_entries: Vec<VocabularyEntry>,
    invalid_line_numbers: Vec<usize>,
}
impl Dictionary {
    /// Returns the dictionary infomation that only contains metadata
    pub(crate) fn construct_dictionary_info(&self) -> DictionaryInfo {
        DictionaryInfo {
            name: self.name.clone(),
            dictionary_type: self.dictionary_type,
            origin: self.origin,
            invalid_line_numbers: self.invalid_line_numbers.clone(),
            valid_vocabulary_count: self.vocabulary_entries.len(),
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
/// A dictionary metadata catalog that organizes dictionaries by their type
pub struct DictionaryCatalog {
    /// Collection of worddictionaries
    pub word: Vec<DictionaryInfo>,
    /// Collection of sentencedictionaries
    pub sentence: Vec<DictionaryInfo>,
}

impl DictionaryCatalog {
    pub(crate) fn new(word: Vec<DictionaryInfo>, sentence: Vec<DictionaryInfo>) -> Self {
        Self { word, sentence }
    }
}
