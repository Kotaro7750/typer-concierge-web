use library::DictionaryCatalog;
use wasm_bindgen::prelude::*;

mod library;
mod utils;

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
pub fn get_dictionary_catalog() -> Result<DictionaryCatalog, JsValue> {
    let catalog = library::DictionaryCatalog::dummy_catalog();

    Ok(catalog)
}
