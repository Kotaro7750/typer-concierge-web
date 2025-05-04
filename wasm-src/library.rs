pub(crate) mod dictionary;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen_futures::JsFuture;
use web_sys::Response;

pub(crate) struct Library {}

impl Library {
    pub fn new() -> Self {
        Self {}
    }

    pub(crate) async fn load(&mut self, window: &web_sys::Window) -> Result<(), JsValue> {
        let request_promise = window.fetch_with_str("dictionary_catalog.json");

        let response = JsFuture::from(request_promise).await?;
        let response: Response = response.dyn_into()?;

        let json = JsFuture::from(response.json()?).await?;

        web_sys::console::log_1(&json); // Log the JSON to console for debugging

        Ok(())
    }
}
