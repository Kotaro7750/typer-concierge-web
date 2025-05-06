use serde::Serialize;
use tsify::Tsify;
use typing_engine::EntitySummaryStatistics;
use typing_engine::TypingResult as LibraryTypingResult;

#[derive(Debug, Clone, Serialize, Tsify)]
#[serde(rename_all = "camelCase")]
#[tsify(into_wasm_abi)]
/// A struct representing the result of typing
pub struct TypingResult {
    total_time_ms: usize,
    key_stroke: TypingResultTarget,
    ideal_key_stroke: TypingResultTarget,
}

impl From<LibraryTypingResult> for TypingResult {
    fn from(t: LibraryTypingResult) -> Self {
        Self {
            total_time_ms: t.total_time().as_millis().try_into().unwrap(),
            key_stroke: t.summary().key_stroke().clone().into(),
            ideal_key_stroke: t.summary().ideal_key_stroke().clone().into(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Tsify)]
#[serde(rename_all = "camelCase")]
#[tsify(into_wasm_abi)]
/// A struct representing the target of typing
pub struct TypingResultTarget {
    whole_count: usize,
    completely_correct_count: usize,
    missed_count: usize,
}

impl From<EntitySummaryStatistics> for TypingResultTarget {
    fn from(t: EntitySummaryStatistics) -> Self {
        Self {
            whole_count: t.whole_count(),
            completely_correct_count: t.completely_correct_count(),
            missed_count: t.wrong_count(),
        }
    }
}
