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

const SURVEY_COMMUNITIES = [
  "Culture Communities",
  "Club & Hobby Communities",
  "Health-Sport-Recreation Communities",
] as const;

const SURVEY_HOUSING = ["Own", "Rent", "RV", "Couch Surf"] as const;

const SURVEY_RELATIONSHIP = ["Single", "Partnered", "Married", "Divorced"] as const;

const SURVEY_WORK_MODE = ["Remotely", "Semi-remotely", "In-Office"] as const;

const SURVEY_AGE = ["-30", "31-50", "50+"] as const;

const SURVEY_REGION = ["East Coast", "West Coast", "Mid-west", "South", "North"] as const;

const SURVEY_SEASON = ["Spring", "Summer", "Fall", "Winter"] as const;

const SURVEY_INTENT = [
  "Moving to Flagstaff",
  "Thinking about moving to Flagstaff",
  "Visiting Flagstaff",
  "Just playing around",
] as const;

export default function SurveyModal({
  surveyOpen,
  setSurveyOpen,
  userId,
  setUserId,
  surveyCompleted,
  setSurveyCompleted,
}: SurveyModalProps) {
  const [surveyIntent, setSurveyIntent] = useState("");
  const [surveyCommunities, setSurveyCommunities] = useState<string[]>([]);
  const [surveyHousing, setSurveyHousing] = useState("");
  const [surveyRelationship, setSurveyRelationship] = useState("");
  const [surveyWorkMode, setSurveyWorkMode] = useState("");
  const [surveyAge, setSurveyAge] = useState("");
  const [surveyRegion, setSurveyRegion] = useState("");
  const [surveySeason, setSurveySeason] = useState("");
  const [surveyFirstName, setSurveyFirstName] = useState("");
  const [surveyLastName, setSurveyLastName] = useState("");
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
    const storedUserId =
      userId ??
      (typeof window !== "undefined" ? Number(window.localStorage.getItem("vf_user_id")) : null);

    if (!storedUserId) {
      setSurveyErr("Please sign in to submit the survey.");
      return;
    }

    if (!surveyIntent) {
      setSurveyErr("Please choose one option for Flagstaff.");
      return;
    }

    setSurveyLoading(true);
    setSurveyErr(null);

    const surveyPayload = {
      survey: {
        first_name: surveyFirstName || null,
        last_name: surveyLastName || null,
        flagstaff_intent: surveyIntent,
        community_interests: surveyCommunities,
        housing_status: surveyHousing || null,
        relationship_status: surveyRelationship || null,
        work_mode: surveyWorkMode || null,
        age_group: surveyAge || null,
        current_region: surveyRegion || null,
        favorite_season: surveySeason || null,
        notes: surveyNotes,
      },
    };


    try {
      const res = await fetch(`${API_BASE}/users/${storedUserId}`, {
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
  };

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
        <div className="max-h-[65vh] overflow-y-auto pr-2 grid gap-4">
          <p className="text-[10px] text-white/70">Help us personalize your experience.</p>
          <label className="grid gap-2 text-[10px] uppercase tracking-widest">
            <span>First name</span>
            <input
              type="text"
              value={surveyFirstName}
              onChange={(e) => setSurveyFirstName(e.target.value)}
              className="rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white outline-none"
              placeholder="Enter first name"
            />
          </label>

        <label className="grid gap-2 text-[10px] uppercase tracking-widest">
          <span>Last name</span>
          <input
            type="text"
            value={surveyLastName}
            onChange={(e) => setSurveyLastName(e.target.value)}
            className="rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white outline-none"
            placeholder="Enter last name"
          />
        </label>

        {surveyErr && (
          <div className="rounded-none border-[3px] border-white p-3 text-[10px] text-white/90">
            {surveyErr}
          </div>
        )}

        <label className="grid gap-2 text-[10px] uppercase tracking-widest">
          <span>Are you…</span>
          <select
            required
            value={surveyIntent}
            onChange={(e) => setSurveyIntent(e.target.value)}
            className="rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white outline-none"
          >
            <option value="" disabled>
              Select...
            </option>
            {SURVEY_INTENT.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="grid gap-2 border-[3px] border-white p-3">
          <legend className="px-2 text-[10px] uppercase tracking-widest">
            Are you into (select all)
          </legend>
          <div className="grid gap-2">
            {SURVEY_COMMUNITIES.map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-[10px]">
                <input
                  type="checkbox"
                  checked={surveyCommunities.includes(opt)}
                  onChange={() => toggleMulti(opt, surveyCommunities, setSurveyCommunities)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="grid gap-2 text-[10px] uppercase tracking-widest">
          <span>Do you…</span>
          <select
            value={surveyHousing}
            onChange={(e) => setSurveyHousing(e.target.value)}
            className="rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white outline-none"
          >
            <option value="">Select...</option>
            {SURVEY_HOUSING.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-[10px] uppercase tracking-widest">
          <span>Are you…</span>
          <select
            value={surveyRelationship}
            onChange={(e) => setSurveyRelationship(e.target.value)}
            className="rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white outline-none"
          >
            <option value="">Select...</option>
            {SURVEY_RELATIONSHIP.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-[10px] uppercase tracking-widest">
          <span>How do you work?</span>
          <select
            value={surveyWorkMode}
            onChange={(e) => setSurveyWorkMode(e.target.value)}
            className="rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white outline-none"
          >
            <option value="">Select...</option>
            {SURVEY_WORK_MODE.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-[10px] uppercase tracking-widest">
          <span>How old are you?</span>
          <select
            value={surveyAge}
            onChange={(e) => setSurveyAge(e.target.value)}
            className="rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white outline-none"
          >
            <option value="">Select...</option>
            {SURVEY_AGE.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-[10px] uppercase tracking-widest">
          <span>Where do you live now?</span>
          <select
            value={surveyRegion}
            onChange={(e) => setSurveyRegion(e.target.value)}
            className="rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white outline-none"
          >
            <option value="">Select...</option>
            {SURVEY_REGION.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-[10px] uppercase tracking-widest">
          <span>What’s your favorite season?</span>
          <select
            value={surveySeason}
            onChange={(e) => setSurveySeason(e.target.value)}
            className="rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white outline-none"
          >
            <option value="">Select...</option>
            {SURVEY_SEASON.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

          <label className="grid gap-2 text-[10px] uppercase tracking-widest">
            <span>Anything else? (optional)</span>
            <textarea
              value={surveyNotes}
              onChange={(e) => setSurveyNotes(e.target.value)}
              className="min-h-[80px] rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white placeholder-white/50 outline-none"
              placeholder="Tell us what matters most..."
            />
          </label>
        </div>

        {/* ✅ Sticky footer with buttons */}
        <div className="sticky bottom-0 bg-black pt-3 border-t-[3px] border-white flex items-center gap-3">
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
