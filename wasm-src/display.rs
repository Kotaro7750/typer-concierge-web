use serde::{Deserialize, Serialize};
use tsify::Tsify;
use typing_engine::{display_info::ViewDisplayInfo, DisplayInfo};

#[derive(Debug, Clone, Serialize, Deserialize, Tsify)]
#[serde(rename_all = "camelCase")]
#[tsify(into_wasm_abi)]
/// A struct representing the display information for UI
pub struct DisplayInformation {
    view: ViewDisplayInformation,
    key_stroke: KeyStrokeDisplayInformation,
}

impl From<DisplayInfo> for DisplayInformation {
    fn from(di: DisplayInfo) -> Self {
        let key_stroke_info = di.key_stroke_info();

        Self {
            view: di.view_info().into(),
            key_stroke: KeyStrokeDisplayInformation {
                key_stroke: key_stroke_info.key_stroke().to_string(),
                current_cursor_position: key_stroke_info.current_cursor_position(),
                missed_positions: key_stroke_info.wrong_positions().clone(),
                progress: key_stroke_info.summary_statistics().progress(),
                lap_end_positions: di.lap_info().key_stroke_lap_end_positions().clone(),
                lap_end_time: di
                    .lap_info()
                    .elapsed_times()
                    .iter()
                    .map(|d| d.as_millis() as f64)
                    .collect(),
            },
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
/// A struct representing the display information of view for UI
pub(crate) struct ViewDisplayInformation {
    view: String,
    current_cursor_positions: Vec<usize>,
    missed_positions: Vec<usize>,
    last_position: usize,
}

impl From<&ViewDisplayInfo> for ViewDisplayInformation {
    fn from(vdi: &ViewDisplayInfo) -> Self {
        Self {
            view: vdi.view().to_string(),
            current_cursor_positions: vdi.current_cursor_positions().clone(),
            missed_positions: vdi.wrong_positions().clone(),
            last_position: vdi.last_position(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
/// A struct representing the display information of key stroke for UI
pub(crate) struct KeyStrokeDisplayInformation {
    key_stroke: String,
    current_cursor_position: usize,
    missed_positions: Vec<usize>,
    progress: f64,
    lap_end_positions: Vec<usize>,
    lap_end_time: Vec<f64>,
}
