interface PatientProfile {
  name: string;
  language: string;
  lastVisit: string;
  symptoms: string[];
}

const PROFILE_KEY = "aidoc_patient_profile";

function isClient() {
  return typeof window !== "undefined";
}

export function getProfile(): PatientProfile | null {
  if (!isClient()) return null;
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: PatientProfile) {
  if (!isClient()) return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {}
}

export function addSymptom(symptom: string) {
  if (!isClient()) return;
  try {
    const profile = getProfile();
    if (profile) {
      profile.symptoms.push(symptom);
      profile.lastVisit = new Date().toISOString();
      saveProfile(profile);
    }
  } catch {}
}