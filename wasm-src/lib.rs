use display::DisplayInformation;
use library::dictionary::DictionaryType;
use library::Library;
use library::{dictionary::DictionaryCatalog, QueryRequestFromUI};
use result::GameResult;
use serde::{Deserialize, Serialize};
use std::num::NonZeroUsize;
use std::sync::LazyLock;
use std::time::Duration;
use tokio::sync::Mutex;
use tsify::Tsify;
use typing_engine::{
    KeyStrokeCharError, LapRequest, QueryRequest, TypingEngine, TypingResult as LibTypingResult,
    VocabularyOrder, VocabularyQuantifier, VocabularySeparator,
};
use wasm_bindgen::prelude::*;

mod display;
mod library;
mod result;
mod utils;

static LIBRARY: LazyLock<Mutex<Library>> = LazyLock::new(|| Mutex::new(Library::new()));
static TYPING_ENGINE: LazyLock<Mutex<TypingEngine>> =
    LazyLock::new(|| Mutex::new(TypingEngine::new()));
static AGGREGATED_RESULT: LazyLock<Mutex<Option<LibTypingResult>>> =
    LazyLock::new(|| Mutex::new(None));

#[derive(Debug)]
/// Error kind from WebAssembly
enum WasmErrorKind {
    CannotGetWindow,
    CannotSerDe(serde_wasm_bindgen::Error),
    JsError(JsValue),
    StrokedKeyInvalid(String),
    TypingEngineError(typing_engine::TypingEngineError),
    InternalError(String),
}

impl From<WasmErrorKind> for JsValue {
    fn from(value: WasmErrorKind) -> Self {
        match value {
            WasmErrorKind::CannotGetWindow => JsValue::from_str("Cannot get global `window`"),
            WasmErrorKind::JsError(value) => value,
            WasmErrorKind::CannotSerDe(err) => err.into(),
            WasmErrorKind::StrokedKeyInvalid(key) => {
                JsValue::from_str(&format!("Invalid key stroke: {}", key))
            }
            WasmErrorKind::TypingEngineError(err) => JsValue::from_str(&format!("{:?}", err)),
            WasmErrorKind::InternalError(err) => {
                JsValue::from_str(&format!("Internal error: {}", err))
            }
        }
    }
}

#[derive(Debug)]
/// Error from WebAssembly
pub struct WasmError {
    kind: WasmErrorKind,
}

impl WasmError {
    fn new(kind: WasmErrorKind) -> Self {
        Self { kind }
    }
}

impl From<JsValue> for WasmError {
    fn from(value: JsValue) -> Self {
        WasmError {
            kind: WasmErrorKind::JsError(value),
        }
    }
}

impl From<serde_wasm_bindgen::Error> for WasmError {
    fn from(value: serde_wasm_bindgen::Error) -> Self {
        WasmError {
            kind: WasmErrorKind::CannotSerDe(value),
        }
    }
}

impl From<typing_engine::TypingEngineError> for WasmError {
    fn from(value: typing_engine::TypingEngineError) -> Self {
        WasmError {
            kind: WasmErrorKind::TypingEngineError(value),
        }
    }
}

impl From<KeyStrokeCharError> for WasmError {
    fn from(value: KeyStrokeCharError) -> Self {
        Self {
            kind: WasmErrorKind::StrokedKeyInvalid(value.to_string()),
        }
    }
}

impl From<WasmError> for JsValue {
    fn from(value: WasmError) -> Self {
        value.kind.into()
    }
}

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen(start)]
pub fn main() -> Result<(), JsValue> {
    utils::set_panic_hook();

    Ok(())
}

#[wasm_bindgen]
pub async fn get_dictionary_catalog() -> Result<DictionaryCatalog, WasmError> {
    let window = web_sys::window().ok_or(WasmError::new(WasmErrorKind::CannotGetWindow))?;
    let mut library = LIBRARY.lock().await;

    library.load(&window).await?;

    Ok(library.construct_dictionary_catalog())
}

#[wasm_bindgen]
pub fn confirm_query(query_request: QueryRequestFromUI) -> Result<(), WasmError> {
    let library = LIBRARY.blocking_lock();

    let vocabulary_entries = library.construct_vocabulary_entries_for_request(&query_request);

    let request = match query_request.dictionary_type() {
        DictionaryType::Word => QueryRequest::new(
            &vocabulary_entries,
            VocabularyQuantifier::KeyStroke(
                query_request
                    .key_stroke_count_threshold()
                    .unwrap_or(NonZeroUsize::new(150).unwrap()),
            ),
            VocabularySeparator::WhiteSpace,
            VocabularyOrder::Random,
        ),
        DictionaryType::Sentence => QueryRequest::new(
            &vocabulary_entries,
            VocabularyQuantifier::Vocabulary(
                query_request
                    .key_stroke_count_threshold()
                    .unwrap_or(NonZeroUsize::new(vocabulary_entries.len()).unwrap()),
            ),
            VocabularySeparator::None,
            VocabularyOrder::InOrder,
        ),
    };

    let mut typing_engine = TYPING_ENGINE.blocking_lock();

    typing_engine.init(request);

    Ok(())
}

#[wasm_bindgen]
pub fn start_game() -> Result<DisplayInformation, WasmError> {
    let mut typing_engine = TYPING_ENGINE.blocking_lock();

    typing_engine.start()?;

    Ok(typing_engine
        .construct_display_info(LapRequest::IdealKeyStroke(NonZeroUsize::new(50).unwrap()))?
        .into())
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Tsify)]
#[tsify(from_wasm_abi)]
#[serde(rename_all = "camelCase")]
/// A struct representing the information of a key stroke
pub struct KeyStrokeInfo {
    key: String,
    elapsed_time_ms: u64,
}

#[derive(Debug, Clone, Serialize, Tsify)]
#[tsify(into_wasm_abi)]
#[serde(rename_all = "camelCase")]
/// A struct repsenting the result of a key stroke
pub struct StrokeKeyResult {
    is_finished: bool,
    display_information: DisplayInformation,
}

#[wasm_bindgen]
pub fn stroke_key(key_stroke_info: KeyStrokeInfo) -> Result<StrokeKeyResult, WasmError> {
    let mut typing_engine = TYPING_ENGINE.blocking_lock();

    let elapsed_time_duration = Duration::from_millis(key_stroke_info.elapsed_time_ms);

    if key_stroke_info.key.chars().count() != 1 {
        return Err(WasmError::new(WasmErrorKind::StrokedKeyInvalid(
            key_stroke_info.key,
        )));
    }
    let key_stroke_char = key_stroke_info.key.chars().next().unwrap();

    let is_finished = typing_engine
        .stroke_key_with_elapsed_time(key_stroke_char.try_into()?, elapsed_time_duration)?;

    let display_information: DisplayInformation = typing_engine
        .construct_display_info(LapRequest::IdealKeyStroke(NonZeroUsize::new(50).unwrap()))?
        .into();

    if is_finished {
        update_aggregated_result(&mut typing_engine)?;
    }

    Ok(StrokeKeyResult {
        is_finished,
        display_information,
    })
}

fn update_aggregated_result(typing_engine: &mut TypingEngine) -> Result<(), WasmError> {
    let this_result = typing_engine
        .construct_result(LapRequest::IdealKeyStroke(NonZeroUsize::new(50).unwrap()))?;

    let mut aggregated_result = AGGREGATED_RESULT.blocking_lock();

    let new_aggregated_result = if let Some(aggregated_result) = aggregated_result.as_mut() {
        aggregated_result.clone() + this_result
    } else {
        this_result
    };

    aggregated_result.replace(new_aggregated_result);

    Ok(())
}

#[wasm_bindgen]
pub fn get_result() -> Result<GameResult, WasmError> {
    let typing_engine = TYPING_ENGINE.blocking_lock();

    let this_result = typing_engine
        .construct_result(LapRequest::IdealKeyStroke(NonZeroUsize::new(50).unwrap()))?;

    let aggregated_result = AGGREGATED_RESULT.blocking_lock().clone();
    if aggregated_result.is_none() {
        return Err(WasmError::new(WasmErrorKind::InternalError(
            "Aggregated result is not initialized".to_string(),
        )));
    }
    let aggregated_result = aggregated_result.unwrap();

    Ok(GameResult::new(this_result, aggregated_result))
}
