use serde::Serialize;
use tsify::Tsify;
use typing_engine::EntitySkillStatistics;
use typing_engine::EntitySummaryStatistics;
use typing_engine::KeyStrokeChar;
use typing_engine::TypingResult as LibraryTypingResult;

#[derive(Debug, Clone, Serialize, Tsify)]
#[serde(rename_all = "camelCase")]
#[tsify(into_wasm_abi)]
/// A struct representing the result of typing.
/// This contains the result of the current game and the aggregated result.
pub struct GameResult {
    this_result: TypingResult,
    aggregated_result: TypingResult,
}

impl GameResult {
    pub(crate) fn new(
        this_result: LibraryTypingResult,
        aggregated_result: LibraryTypingResult,
    ) -> Self {
        Self {
            this_result: this_result.into(),
            aggregated_result: aggregated_result.into(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Tsify)]
#[serde(rename_all = "camelCase")]
#[tsify(into_wasm_abi)]
/// A struct representing the result of typing
pub struct TypingResult {
    total_time_ms: usize,
    key_stroke: TypingResultTarget,
    ideal_key_stroke: TypingResultTarget,
    single_key_stroke_skills: Vec<SingleKeyStrokeSkill>,
}

impl From<LibraryTypingResult> for TypingResult {
    fn from(t: LibraryTypingResult) -> Self {
        Self {
            total_time_ms: t.total_time().as_millis().try_into().unwrap(),
            key_stroke: t.summary().key_stroke().clone().into(),
            ideal_key_stroke: t.summary().ideal_key_stroke().clone().into(),
            single_key_stroke_skills: t
                .skill_statistics()
                .single_key_stroke()
                .iter()
                .map(|s| SingleKeyStrokeSkill::from(s.clone()))
                .collect(),
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

#[derive(Debug, Clone, Serialize, Tsify)]
#[serde(rename_all = "camelCase")]
#[tsify(into_wasm_abi)]
/// A struct representing the skill of a single key stroke
pub struct SingleKeyStrokeSkill {
    key_stroke: String,
    count: usize,
    wrong_count: usize,
    completely_correct_count: usize,
    average_time_ms: u64,
    accuracy: f64,
    wrong_count_ranking: Vec<(String, usize)>,
}

impl From<EntitySkillStatistics<KeyStrokeChar>> for SingleKeyStrokeSkill {
    fn from(t: EntitySkillStatistics<KeyStrokeChar>) -> Self {
        let wrong_count = t
            .wrong_count_ranking()
            .iter()
            .fold(0, |acc, (_, v)| acc + v);

        Self {
            key_stroke: Into::<char>::into(t.entity().clone()).to_string(),
            count: t.count(),
            wrong_count,
            completely_correct_count: t.completely_correct_count(),
            average_time_ms: t.average_time().as_secs() * 1000
                + u64::from(t.average_time().subsec_millis()),
            accuracy: t.accuracy(),
            wrong_count_ranking: t
                .wrong_count_ranking()
                .iter()
                .map(|(k, v)| (Into::<char>::into(k.clone()).to_string(), *v))
                .collect(),
        }
    }
}
