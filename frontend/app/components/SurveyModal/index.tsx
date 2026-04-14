import { useState, useEffect, Fragment } from "react";
import PixelModal from "../PixelModal";
import PixelButton from "../PixelButton";
import { API_BASE } from "../../utils/constants";
import { useSfx } from "../../hooks";
import apiFetch from "../../utils/apiFetch";
import TextInput from "./TextInput"
import SelectInput from "./SelectInput"
import CheckboxInput from "./CheckboxInput"
import TextareaInput from "./TextareaInput"

type SurveyModalProps = {
  surveyOpen: boolean;
  setSurveyOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userId: number | null;
  setUserId: React.Dispatch<React.SetStateAction<number | null>>;
  surveyCompleted: boolean;
  setSurveyCompleted: React.Dispatch<React.SetStateAction<boolean>>;
};


export default function SurveyModal({
  surveyOpen,
  setSurveyOpen,
  userId,
  setUserId,
  surveyCompleted,
  setSurveyCompleted,
}: SurveyModalProps) {

  const [surveyLoading, setSurveyLoading] = useState(false);
  const [surveyErr, setSurveyErr] = useState<string | null>(null);

  const [survey, setSurvey] = useState([]);
  const [surveyAnswers, setSurveyAnswers] = useState([]);

  const {playClickSfx, playHoverSfx} = useSfx();

  const fetchSurvey = async () => {
    return await apiFetch("/survey-questions");
  }

  const initialize = async () => {
    const surv = await fetchSurvey();
    setSurvey(surv);
    const answers = surv.map(q => {
        if (q.input === "checkbox")
        {
          return [];
        } 
        return "";
    });

    setSurveyAnswers(answers);
  }

  // Load persisted user + survey completion
  useEffect(() => {
    try {
      const storedUserId = Number(window.localStorage.getItem("vf_user_id"));
      const isCompleted = window.localStorage.getItem("vf_survey_completed") === "true";
      if (storedUserId) {
        setUserId(storedUserId);
        setSurveyCompleted(isCompleted);

      initialize();
      }
    } catch {
      // ignore (privacy mode / SSR)
    }
  }, []);

  const handleSubmitSurvey = async () => {
    setSurveyLoading(true);
    setSurveyErr(null);

    const surveyPayload = {survey: {}};
    for (let i = 0; i < surveyAnswers.length; i++)
    {
      surveyPayload.survey[survey[i].question] = surveyAnswers[i]
    }

    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        method: "PATCH",
        credentials: "include",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(surveyPayload),
      });

      const contentType = res.headers.get("content-type") || "";
      const raw = await res.text();
      const data = contentType.includes("application/json") ? JSON.parse(raw) : { detail: raw };

      if (!res.ok) throw new Error((data as any)?.detail ?? "Failed to submit survey");

      try {
        window.localStorage.setItem("vf_survey_completed", "true");
      } catch {
        // ignore
      }

      setSurveyCompleted(true);
      setSurveyOpen(false);
    } catch (e: any) {
      setSurveyErr(e?.message ?? "Unknown survey error");
    } finally {
      setSurveyLoading(false);
    }
  };

  const handleSurveyAnswerChange = (val, idx) => {
    setSurveyAnswers(prev => prev.map((ans, i) => {
      if (i === idx)
      {
        if (Array.isArray(ans))
        {
          return ans.includes(val)
            ? ans.filter(v => v !== val)
            : [...ans, val];
        }

        return val
      }
      return ans
    }))
  }

  return (
    <PixelModal
      open={surveyOpen}
      title="Quick Survey"
      onClose={() => {
        playClickSfx();
        setSurveyOpen(false);
      }}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await handleSubmitSurvey();
        }}
        className="grid gap-4"
      >
        <div className="max-h-[65vh] overflow-y-auto pr-2 grid gap-4">
          <p className="text-[10px] text-white/70">Help us personalize your experience.</p>
          {survey.map((question, i) => {
            if (question.input === "text")
            {
              return (
                <Fragment key={i}>
                  <TextInput
                    name={question.question}
                    value={surveyAnswers[i]}
                    onChange={handleSurveyAnswerChange}
                    idx={i}
                  />
                </Fragment>
              );
            }

            else if (question.input === "select")
            {
              return (
                <Fragment key={i}>
                  <SelectInput
                    name={question.question}
                    value={surveyAnswers[i]}
                    options={question.options}
                    onChange={handleSurveyAnswerChange}
                    idx={i}
                  />
                </Fragment>
              );
            }

            else if (question.input === "checkbox")
            {
              return (
                <Fragment key={i}>
                  <CheckboxInput
                    name={question.question}
                    values={surveyAnswers[i]}
                    options={question.options}
                    onChange={handleSurveyAnswerChange}
                    idx={i}
                  />
                </Fragment>
              )
            }

            else if (question.input === "textarea")
            {
              return (
                <Fragment key={i}>
                  <TextareaInput
                    name={question.question}
                    value={surveyAnswers[i]}
                    onChange={handleSurveyAnswerChange}
                    idx={i}
                  />
                </Fragment>
              )
            }
          })}
        </div>

        {/* ✅ Sticky footer with buttons */}
        <div className="sticky bottom-0 bg-black pt-3 border-t-[3px] border-white flex items-center gap-3">
          <PixelButton 
            onClick={playClickSfx}
            type="submit" ariaLabel="Submit survey">
            {surveyLoading ? "Submitting..." : "Submit"}
          </PixelButton>

          <button
            type="button"
            onClick={() => {
              playClickSfx();
              if (userId && !surveyCompleted) {
                alert("Please complete the quick survey to continue.");
                return;
              }
              setSurveyOpen(false);
              
            }}
            className="rounded-none border-[3px] border-white px-3 py-2 text-[10px] uppercase tracking-widest"
            onMouseEnter={playHoverSfx}
            onPointerEnter={playHoverSfx}
            onFocus={playHoverSfx}
          >
            Cancel
          </button>
        </div>
      </form>
    </PixelModal>
  );
}
