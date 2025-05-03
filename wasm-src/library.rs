use serde::{Deserialize, Serialize};
use tsify::Tsify;
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize, Debug, Copy, Clone, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "snake_case")]
/// Represents the type of dictionary
pub enum DictionaryType {
    /// Dictionary containing individual words
    Word,
    /// Dictionary containing complete sentences or phrases
    Sentence,
}

#[derive(Serialize, Deserialize, Debug, Copy, Clone, Tsify)]
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

impl DictionaryInfo {
    pub(crate) fn new(
        name: String,
        dictionary_type: DictionaryType,
        origin: DictionaryOrigin,
        invalid_line_numbers: Vec<usize>,
        valid_vocabulary_count: usize,
    ) -> Self {
        Self {
            name,
            dictionary_type,
            origin,
            invalid_line_numbers,
            valid_vocabulary_count,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
/// A catalog that organizes dictionaries by their type
pub struct DictionaryCatalog {
    /// Collection of worddictionaries
    pub word: Vec<DictionaryInfo>,
    /// Collection of sentencedictionaries
    pub sentence: Vec<DictionaryInfo>,
}

impl DictionaryCatalog {
    pub(crate) fn dummy_catalog() -> Self {
        Self {
            word: vec![
                DictionaryInfo::new(
                    "単語辞書1".to_string(),
                    DictionaryType::Word,
                    DictionaryOrigin::Builtin,
                    vec![1, 10, 100],
                    1000,
                ),
                DictionaryInfo::new(
                    "単語辞書2".to_string(),
                    DictionaryType::Word,
                    DictionaryOrigin::UserDefined,
                    vec![],
                    1000,
                ),
            ],
            sentence: vec![
                DictionaryInfo::new(
                    "文章辞書1".to_string(),
                    DictionaryType::Sentence,
                    DictionaryOrigin::Builtin,
                    vec![1, 10, 100],
                    1000,
                ),
                DictionaryInfo::new(
                    "文章辞書2".to_string(),
                    DictionaryType::Sentence,
                    DictionaryOrigin::UserDefined,
                    vec![],
                    1000,
                ),
            ],
        }
    }
}
