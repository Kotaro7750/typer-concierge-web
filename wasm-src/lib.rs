use library::Library;
use library::{dictionary::DictionaryCatalog, QueryRequestFromUI};
use std::num::NonZeroUsize;
use std::sync::LazyLock;
use tokio::sync::Mutex;
use typing_engine::{
    QueryRequest, TypingEngine, VocabularyOrder, VocabularyQuantifier, VocabularySeparator,
};
use wasm_bindgen::prelude::*;

mod library;
mod utils;

static LIBRARY: LazyLock<Mutex<Library>> = LazyLock::new(|| Mutex::new(Library::new()));
static TYPING_ENGINE: LazyLock<Mutex<TypingEngine>> =
    LazyLock::new(|| Mutex::new(TypingEngine::new()));

#[derive(Debug)]
/// Error kind from WebAssembly
enum WasmErrorKind {
    CannotGetWindow,
    CannotSerDe(serde_wasm_bindgen::Error),
    JsError(JsValue),
}

impl From<WasmErrorKind> for JsValue {
    fn from(value: WasmErrorKind) -> Self {
        match value {
            WasmErrorKind::CannotGetWindow => JsValue::from_str("Cannot get global `window`"),
            WasmErrorKind::JsError(value) => value,
            WasmErrorKind::CannotSerDe(err) => err.into(),
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

    let request = QueryRequest::new(
        &vocabulary_entries,
        VocabularyQuantifier::KeyStroke(
            query_request
                .key_stroke_count_threshold()
                .unwrap_or(NonZeroUsize::new(150).unwrap()),
        ),
        VocabularySeparator::WhiteSpace,
        VocabularyOrder::Random,
    );

    let mut typing_engine = TYPING_ENGINE.blocking_lock();

    typing_engine.init(request);

    Ok(())
}
