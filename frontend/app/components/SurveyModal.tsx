import { useState, useEffect } from "react";
import PixelModal from "./PixelModal";
import PixelButton from "./PixelButton";
import { API_BASE } from "../utils/constants";
import toggleMulti from "../utils/toggleMulti";

type SurveyModalProps = {
    surveyOpen: boolean;
    setSurveyOpen: React.Dispatch<React.SetStateAction<boolean>>;
    userId: number | null;
    setUserId: React.Dispatch<React.SetStateAction<number | null>>;
    surveyCompleted: boolean;
    setSurveyCompleted: React.Dispatch<React.SetStateAction<boolean>>;
};

const SURVEY_INTERESTS = [
  "Apartments",
  "Houses",
  "Roommates",
  "Short-term stays",
  "Buying",
] as const;

const SURVEY_AMENITIES = [
  "Pet friendly",
  "Parking",
  "Near NAU",
  "Downtown",
  "Quiet area",
  "Close to trails",
] as const;

export default function SurveyModal({
    surveyOpen,
    setSurveyOpen,
    userId,
    setUserId,
    surveyCompleted,
    setSurveyCompleted,
}: SurveyModalProps ) {

    const [surveyMoveTiming, setSurveyMoveTiming] = useState("");
    const [surveyInterests, setSurveyInterests] = useState<string[]>([]);
    const [surveyAmenities, setSurveyAmenities] = useState<string[]>([]);
    const [surveyBudget, setSurveyBudget] = useState("");
    const [surveyPets, setSurveyPets] = useState<"yes" | "no" | "">("");
    const [surveyNotes, setSurveyNotes] = useState("");
    const [surveyLoading, setSurveyLoading] = useState(false);
    const [surveyErr, setSurveyErr] = useState<string | null>(null);

    // Load persisted user + survey completion
    useEffect(() => {
    try {
      const storedUserId = Number(window.localStorage.getItem("vf_user_id"));
      const isCompleted = window.localStorage.getItem("vf_survey_completed") === "true";
      if (storedUserId) {
        setUserId(storedUserId);
        setSurveyCompleted(isCompleted);
      }
    } catch {
      // ignore (privacy mode / SSR)
    }
    }, []);

    const handleSubmitSurvey = async () => {
    // Allow survey even if the user isn't signed in yet.
    const storedUserId =
      userId ?? (typeof window !== "undefined" ? window.localStorage.getItem("vf_user_id") : null);

    if (!surveyMoveTiming) {
      setSurveyErr("Please select when you're moving.");
      return;
    }

    setSurveyLoading(true);
    setSurveyErr(null);

    const surveyPayload = {
      survey: {
        move_timing: surveyMoveTiming,
        interests: surveyInterests,
        amenities: surveyAmenities,
        budget: surveyBudget,
        has_pets: surveyPets === "yes" ? true : surveyPets === "no" ? false : null,
        notes: surveyNotes,
      }
    };

    try {
      console.log( JSON.stringify( surveyPayload ) )
      const res = await fetch(`${API_BASE}/user/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
  }

  return (
    <PixelModal
        open={surveyOpen}
        title="Quick Survey"
        onClose={() => {
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
          <p className="text-[10px] text-white/70">
            Help us personalize your experience.
          </p>

          {surveyErr && (
            <div className="rounded-none border-[3px] border-white p-3 text-[10px] text-white/90">
              {surveyErr}
            </div>
          )}

          
          <label className="grid gap-2 text-[10px] uppercase tracking-widest">
            <span>When are you moving?</span>
            <select
              required
              value={surveyMoveTiming}
              onChange={(e) => setSurveyMoveTiming(e.target.value)}
              className="rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white outline-none"
            >
              <option value="" disabled>
                Select...
              </option>
              <option value="0-30 days">0–30 days</option>
              <option value="1-3 months">1–3 months</option>
              <option value="3-6 months">3–6 months</option>
              <option value="6+ months">6+ months</option>
              <option value="Just browsing">Just browsing</option>
            </select>
          </label>

          <fieldset className="grid gap-2 border-[3px] border-white p-3">
            <legend className="px-2 text-[10px] uppercase tracking-widest">
              What are you looking for? (select all)
            </legend>
            <div className="grid gap-2">
              {SURVEY_INTERESTS.map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-[10px]">
                  <input
                    type="checkbox"
                    checked={surveyInterests.includes(opt)}
                    onChange={() => toggleMulti(opt, surveyInterests, setSurveyInterests)}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="grid gap-2 border-[3px] border-white p-3">
            <legend className="px-2 text-[10px] uppercase tracking-widest">
              Preferences (select all)
            </legend>
            <div className="grid gap-2">
              {SURVEY_AMENITIES.map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-[10px]">
                  <input
                    type="checkbox"
                    checked={surveyAmenities.includes(opt)}
                    onChange={() => toggleMulti(opt, surveyAmenities, setSurveyAmenities)}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="grid gap-2 text-[10px] uppercase tracking-widest">
            <span>Budget range (optional)</span>
            <input
              value={surveyBudget}
              onChange={(e) => setSurveyBudget(e.target.value)}
              className="rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white placeholder-white/50 outline-none"
              placeholder="$1,200–$1,800"
            />
          </label>

          <fieldset className="grid gap-2 border-[3px] border-white p-3">
            <legend className="px-2 text-[10px] uppercase tracking-widest">
              Pets? (optional)
            </legend>
            <div className="flex flex-wrap gap-3 text-[10px]">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pets"
                  checked={surveyPets === "yes"}
                  onChange={() => setSurveyPets("yes")}
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pets"
                  checked={surveyPets === "no"}
                  onChange={() => setSurveyPets("no")}
                />
                <span>No</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pets"
                  checked={surveyPets === ""}
                  onChange={() => setSurveyPets("")}
                />
                <span>Prefer not to say</span>
              </label>
            </div>
          </fieldset>

          <label className="grid gap-2 text-[10px] uppercase tracking-widest">
            <span>Anything else? (optional)</span>
            <textarea
              value={surveyNotes}
              onChange={(e) => setSurveyNotes(e.target.value)}
              className="min-h-[80px] rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white placeholder-white/50 outline-none"
              placeholder="Tell us what matters most..."
            />
          </label>
<div className="mt-2 flex items-center gap-3">
            <PixelButton type="submit" ariaLabel="Submit survey">
              {surveyLoading ? "Submitting..." : "Submit"}
            </PixelButton>

            <button
              type="button"
              onClick={() => {
                if (userId && !surveyCompleted) {
                  alert("Please complete the quick survey to continue.");
                  return;
                }
                setSurveyOpen(false);
              }}
              className="rounded-none border-[3px] border-white px-3 py-2 text-[10px] uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        </form>
      </PixelModal>
  );
}