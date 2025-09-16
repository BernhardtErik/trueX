export type PatientPayload = Record<string, FormDataEntryValue> | Record<string, unknown>;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8081";

export async function createPatient(payload: PatientPayload): Promise<Response> {
  const res = await fetch(`${API_BASE}/patients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res;
}

export async function updatePatient(id: string | number, payload: PatientPayload): Promise<Response> {
  const res = await fetch(`${API_BASE}/patients/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res;
}

export async function deletePatient(id: string | number): Promise<Response> {
  const res = await fetch(`${API_BASE}/patients/${id}`, {
    method: "DELETE",
  });
  return res;
}

export type Patient = {
  id: string | number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  idNumber?: string;
  dateOfBirth?: string;
  address?: string;
  medicalAid?: string;
  medicalHistory?: string;
  allergies?: string;
  currentMedication?: string;
  [key: string]: any;
};

export async function searchPatients(query: string): Promise<Patient[]> {
  const res = await fetch(`${API_BASE}/patients/search?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  return res.json();
}

export async function getPatientById(id: string | number): Promise<Patient> {
  const res = await fetch(`${API_BASE}/patients/${id}`);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}
