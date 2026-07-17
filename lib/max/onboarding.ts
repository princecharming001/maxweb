/**
 * Onboarding step config — mirrors the iOS OnboardingV2 quiz exactly.
 * The quiz is split into two phases like the app:
 *   intro    (before the paywall): age, gender, goals, motivation, effort
 *   schedule (after the paywall):  day shape, work, meals, workout, weekends,
 *                                  shower, recap
 * Answers survive page hops via sessionStorage.
 */
export type OnboardingAnswers = Record<string, unknown>;

const KEY = "max_onboarding_answers";

export function loadAnswers(): OnboardingAnswers {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}
export function saveAnswers(a: OnboardingAnswers) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    /* best-effort */
  }
}
export function clearAnswers() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export interface Choice {
  id: string;
  label: string;
  sub?: string;
}

/** Intro-phase question (data-driven; single/ranked/motivation). */
export interface IntroStep {
  id: string;
  field: string;
  title: string; // may contain \n for the two-line serif titles
  sub: string;
  kind: "single" | "ranked" | "motivation";
  options: Choice[];
  max?: number; // ranked cap
}

export const MAXX_TILES: Choice[] = [
  { id: "skinmax", label: "Skinmax", sub: "clearer, calmer skin" },
  { id: "fitmax", label: "Fitmax", sub: "build your best body" },
  { id: "hairmax", label: "Hairmax", sub: "fuller, healthier hair" },
  { id: "heightmax", label: "Heightmax", sub: "posture and presence" },
  { id: "bonemax", label: "Bonemax", sub: "a sharper jaw and frame" },
];

export const INTRO_STEPS: IntroStep[] = [
  {
    id: "age",
    field: "age_band",
    title: "How old\nare you?",
    sub: "Your plan is calibrated to where you are.",
    kind: "single",
    options: [
      { id: "under_18", label: "Under 18" },
      { id: "18_24", label: "18–24" },
      { id: "25_34", label: "25–34" },
      { id: "35_plus", label: "35+" },
    ],
  },
  {
    id: "gender",
    field: "gender",
    title: "You are…",
    sub: "Facial analysis differs by bone structure.",
    kind: "single",
    options: [
      { id: "male", label: "Male" },
      { id: "female", label: "Female" },
    ],
  },
  {
    id: "goals",
    field: "goals",
    title: "What are we\nworking on?",
    sub: "Pick up to 3.",
    kind: "ranked",
    max: 3,
    options: MAXX_TILES,
  },
  {
    id: "motivation",
    field: "motivation",
    title: "What's pulling\nyou here?",
    sub: "It helps Max talk to you straight.",
    kind: "motivation",
    options: [
      { id: "heartbreak", label: "Someone broke my heart" },
      { id: "no_respect", label: "No one respects me" },
      { id: "event", label: "An upcoming date or event" },
      { id: "mog", label: "I just want to mog" },
      { id: "curious", label: "Just curious" },
      { id: "other", label: "Something else" },
    ],
  },
  {
    id: "effort",
    field: "intensity_preference",
    title: "How hard do you\nwant to go?",
    sub: "The plan flexes to match — you can change this later.",
    kind: "single",
    options: [
      { id: "light", label: "Light touch", sub: "some tips and tricks" },
      { id: "steady", label: "Steady", sub: "tweaking my daily routine" },
      { id: "all_in", label: "All in", sub: "becoming a new person" },
    ],
  },
];

export const SHOWER_TIMES: Choice[] = [
  { id: "morning", label: "After I wake up" },
  { id: "night", label: "Before bed" },
  { id: "both", label: "Both" },
];

export const WEEKENDS: Choice[] = [
  { id: "sleep_in", label: "I sleep in" },
  { id: "same", label: "Same rhythm" },
];

export const WORK_LOCATIONS: Choice[] = [
  { id: "office", label: "In office" },
  { id: "hybrid", label: "Hybrid" },
  { id: "home", label: "From home" },
];
