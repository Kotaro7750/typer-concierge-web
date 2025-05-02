mod utils;
use wasm_bindgen::prelude::*;
use web_sys::console;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn hello() -> Result<(), JsValue> {
    console::log_1(&"Hello from wasm".into());

    Ok(())
}
