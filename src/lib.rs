mod utils;
use wasm_bindgen::prelude::*;
use wasm_bindgen::Clamped;
use web_sys::{console, ImageData};

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn generate_mandelbrot(width: u32, height: u32, color: &str) -> ImageData {
    let mut data = vec![0; (width * height * 4) as usize];
    let (r, g, b) = hex_to_rgb(color);

    for y in 0..height {
        for x in 0..width {
            let cx = x as f64 / width as f64 * 3.5 - 2.5;
            let cy = y as f64 / height as f64 * 2.0 - 1.0;
            let mut zx = 0.0;
            let mut zy = 0.0;
            let mut i = 0;
            while zx * zx + zy * zy < 4.0 && i < 255 {
                let tmp = zx * zx - zy * zy + cx;
                zy = 2.0 * zx * zy + cy;
                zx = tmp;
                i += 1;
            }
            let pixel_index = (y * width + x) as usize * 4;
            data[pixel_index] = (r * i as f64) as u8;
            data[pixel_index + 1] = (g * i as f64) as u8;
            data[pixel_index + 2] = (b * i as f64) as u8;
            data[pixel_index + 3] = 255;
        }
    }

    console::log_1(&"Mandelbrot generation complete".into());
    ImageData::new_with_u8_clamped_array_and_sh(Clamped(&data[..]), width, height).unwrap()
}

fn hex_to_rgb(hex: &str) -> (f64, f64, f64) {
    let hex = hex.trim_start_matches('#');
    let r = u8::from_str_radix(&hex[0..2], 16).unwrap() as f64 / 255.0;
    let g = u8::from_str_radix(&hex[2..4], 16).unwrap() as f64 / 255.0;
    let b = u8::from_str_radix(&hex[4..6], 16).unwrap() as f64 / 255.0;
    (r, g, b)
}
