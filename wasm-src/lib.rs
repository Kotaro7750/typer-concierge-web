use library::dictionary::DictionaryCatalog;
use library::Library;
use std::sync::{LazyLock, Mutex};
use wasm_bindgen::prelude::*;

mod library;
mod utils;

static LIBRARY: LazyLock<Mutex<Library>> = LazyLock::new(|| Mutex::new(Library::new()));

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
pub async fn get_dictionary_catalog() -> Result<DictionaryCatalog, JsValue> {
    let catalog = DictionaryCatalog::dummy_catalog();

    let window = web_sys::window().ok_or("no global `window` exists")?;
    LIBRARY.lock().unwrap().load(&window).await?;

    Ok(catalog)
}
