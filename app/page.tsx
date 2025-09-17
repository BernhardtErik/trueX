"use client";
import React from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import Image from "next/image";

import { RsaIdDot } from "../components/rsa-id-dot";
import PatientSearch from "../components/patient-search";

export default function Home() {
    const [formOpen, setFormOpen] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string>("");
    const [idNumber, setIdNumber] = React.useState("");
    const [dateOfBirth, setDateOfBirth] = React.useState("");
    const [idValid, setIdValid] = React.useState(false);

    // Luhn check for SA ID
    const luhnCheck = (id: string) => {
        let sum = 0;
        let shouldDouble = false;
        for (let i = id.length - 1; i >= 0; i--) {
            let digit = parseInt(id.charAt(i), 10);
            if (shouldDouble) {
                digit = digit * 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        return sum % 10 === 0;
    };

    const isValidSouthAfricanId = (id: string) =>
        /^\d{13}$/.test(id) && luhnCheck(id);

    const parseDobFromRsaId = (id: string): string | null => {
        if (!id || id.length < 6) return null;
        const yy = parseInt(id.slice(0, 2), 10);
        const mm = parseInt(id.slice(2, 4), 10);
        const dd = parseInt(id.slice(4, 6), 10);

        const now = new Date();
        const currentYear = now.getFullYear();
        const candidates = [1900 + yy, 2000 + yy];

        for (const year of candidates) {
            const date = new Date(`${year}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`);
            if (!isNaN(date.getTime())) return date.toISOString().slice(0, 10); // YYYY-MM-DD
        }

        return null;
    };

    const medicalAidOptions = [
        { key: "none", label: "None" },
        { key: "discovery", label: "Discovery" },
        { key: "momentum", label: "Momentum" },
        { key: "bonitas", label: "Bonitas" },
        { key: "gems", label: "GEMS" },
        { key: "medshield", label: "Medshield" },
        { key: "other", label: "Other" },
    ];

    return (
        <section className="flex flex-col items-center py-8 md:py-12">
            <div className="flex items-center gap-3 mb-6">
                <Image src="/truex.jpeg" alt="trueX Health logo" width={100} height={100} className="size-25 rounded-full object-cover" />
            </div>

            <div className="w-full max-w-3xl mb-4 flex items-center justify-between gap-4">
                <PatientSearch onSelect={async (patientSummary) => {
                    // Normalize values and populate form with selected patient, then open in edit mode
                    let form = document.getElementById("patient-form") as HTMLFormElement | null;
                    if (!form) {
                        setFormOpen(true);
                        await new Promise((r) => setTimeout(r, 0));
                        form = document.getElementById("patient-form") as HTMLFormElement | null;
                        if (!form) return;
                    }

                    const toYYYYMMDD = (value: unknown): string => {
                        if (!value) return "";
                        try {
                            if (typeof value === "string") {
                                if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
                                const d = new Date(value);
                                if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
                                const cleaned = value.replace(/[^0-9]/g, "");
                                if (cleaned.length === 8) {
                                    const y = cleaned.slice(0, 4);
                                    const m = cleaned.slice(4, 6);
                                    const d2 = cleaned.slice(6, 8);
                                    return `${y}-${m}-${d2}`;
                                }
                                return "";
                            }
                            if (typeof value === "number") {
                                const d = new Date(value);
                                if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
                                return "";
                            }
                            if (value instanceof Date) {
                                if (!isNaN(value.getTime())) return value.toISOString().slice(0, 10);
                                return "";
                            }
                        } catch {
                            return "";
                        }
                        return "";
                    };

                    const formatPhone = (value: unknown): string => {
                        const digits = String(value ?? "").replace(/\D/g, "");
                        if (digits.length === 10) {
                            return `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6)}`;
                        }
                        return String(value ?? "");
                    };

                    // fetch full patient by id to ensure latest and complete record
                    let patient = patientSummary;
                    try {
                        const { getPatientById } = await import("../services/patients");
                        if (patientSummary?.id != null) {
                            patient = await getPatientById(patientSummary.id);
                        }
                    } catch (e) {
                        console.warn("Failed to fetch full patient by id, using summary.", e);
                    }

                    const validMedicalAidKeys = new Set(["", "none", "discovery", "momentum", "bonitas", "gems", "medshield", "other"]);
                    const normalizedMedicalAid = validMedicalAidKeys.has(String(patient.medicalAid ?? "").toLowerCase())
                        ? String(patient.medicalAid ?? "").toLowerCase()
                        : "";

                    const fields: Record<string, string> = {
                        firstName: patient.firstName ?? "",
                        lastName: patient.lastName ?? "",
                        email: patient.email ?? "",
                        phoneNumber: formatPhone(patient.phoneNumber),
                        // idNumber and dateOfBirth are controlled; do not set DOM value here
                        address: patient.address ?? "",
                        medicalAid: normalizedMedicalAid,
                        medicalHistory: patient.medicalHistory ?? "",
                        allergies: patient.allergies ?? "",
                        currentMedication: patient.currentMedication ?? "",
                    };
                    const setFieldValue = (formEl: HTMLFormElement, fieldName: string, val: string) => {
                        const el = formEl.querySelector(`[name="${fieldName}"]`) as HTMLElement | null;
                        if (!el) return;
                        if (el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
                            (el as any).value = val;
                            el.dispatchEvent(new Event('input', { bubbles: true }));
                            el.dispatchEvent(new Event('change', { bubbles: true }));
                            return;
                        }
                        const inner = (el as HTMLElement).querySelector('input') as HTMLInputElement | null;
                        if (inner) {
                            inner.value = val;
                            inner.dispatchEvent(new Event('input', { bubbles: true }));
                            inner.dispatchEvent(new Event('change', { bubbles: true }));
                            return;
                        }
                        (el as any).value = val;
                        (el as any).dispatchEvent(new Event('input', { bubbles: true }));
                        (el as any).dispatchEvent(new Event('change', { bubbles: true }));
                    };

                    for (const [name, value] of Object.entries(fields)) {
                        setFieldValue(form, name, value);
                    }
                    const newId = String(patient.idNumber ?? "");
                    setIdNumber(newId);
                    // update RSA dot status based on populated value
                    window.dispatchEvent(new CustomEvent("rsa-id-change", { detail: newId }));
                    setDateOfBirth(toYYYYMMDD(patient.dateOfBirth));
                    form.dataset.patientId = String(patient.id);
                    setEditingId(String(patient.id));
                    setFormOpen(true);
                }} />
                <Button color="primary" variant="solid" onClick={() => {
                    const form = document.getElementById("patient-form") as HTMLFormElement | null;
                    if (form) {
                        form.reset();
                        delete form.dataset.patientId;
                    }
                    setIdNumber("");
                    // reset RSA ID dot status to idle
                    window.dispatchEvent(new CustomEvent("rsa-id-change", { detail: "" }));
                    setDateOfBirth("");
                    setEditingId("");
                    setFormOpen(true);
                }}>Add new patient</Button>
            </div>

            {formOpen && (
            <div className="w-full max-w-3xl rounded-large border border-default-200 bg-background p-6">
                <div className="flex items-center justify-between mb-6 gap-4">
                    <h2 className="text-xl font-semibold">Patient form:</h2>
                </div>

                <form id="patient-form" className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget as HTMLFormElement;
                    const formData = new FormData(form);
                    const payload: Record<string, any> = Object.fromEntries(formData.entries());

                    // Client-side validation
                    const errors: string[] = [];
                    const firstName = String(payload.firstName ?? "").trim();
                    const lastName = String(payload.lastName ?? "").trim();
                    const email = String(payload.email ?? "").trim();
                    const phoneRaw = String(payload.phoneNumber ?? "");
                    const phoneDigits = phoneRaw.replace(/\D/g, "");
                    const rsaId = String(payload.idNumber ?? "").trim();
                    let dob = String(payload.dateOfBirth ?? "").trim();

                    if (!firstName) errors.push("First name is required.");
                    if (!lastName) errors.push("Last name is required.");
                    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!email || !emailRe.test(email)) errors.push("A valid email address is required.");

                    if (phoneDigits && phoneDigits.length !== 10) errors.push("Phone number must have 10 digits.");

                    if (rsaId) {
                        if (!isValidSouthAfricanId(rsaId)) {
                            errors.push("RSA ID number is invalid. It must be 13 digits and pass the Luhn check.");
                        } else if (!dob) {
                            // Auto-fill DOB from valid RSA ID if not provided
                            const parsed = parseDobFromRsaId(rsaId);
                            if (parsed) {
                                dob = parsed;
                                payload.dateOfBirth = parsed;
                                setDateOfBirth(parsed);
                            }
                        } else {
                            const parsed = parseDobFromRsaId(rsaId);
                            if (parsed && parsed !== dob) {
                                errors.push("Date of birth does not match the RSA ID number.");
                            }
                        }
                    }

                    if (!rsaId && !dob) {
                        errors.push("Provide either an RSA ID number or a date of birth.");
                    }

                    if (errors.length > 0) {
                        window.dispatchEvent(new CustomEvent("toast", { detail: { type: "warning", message: `Please fix the form: ${errors[0]}` } }));
                        return;
                    }

                    try {
                        const { createPatient, updatePatient } = await import("../services/patients");
                        let res: Response;
                        const existingId = (form.dataset.patientId || "").trim();
                        if (existingId) {
                            res = await updatePatient(existingId, payload);
                        } else {
                            res = await createPatient(payload);
                        }
                        if (!res.ok) {
                            console.error("Failed to submit form", await res.text());
                            window.dispatchEvent(new CustomEvent("toast", { detail: { type: "error", message: "Save failed. Please try again." } }));
                            return;
                        }
                        window.dispatchEvent(new CustomEvent("toast", { detail: { type: "success", message: existingId ? "Patient updated successfully." : "Patient created successfully." } }));
                        // keep the form values when updating; only clear when new created and you wish to start fresh
                        if (!existingId) {
                            form.reset();
                            setIdNumber("");
                            // reset RSA ID dot status to idle
                            window.dispatchEvent(new CustomEvent("rsa-id-change", { detail: "" }));
                            setDateOfBirth("");
                        }
                    } catch (err) {
                        console.error(err);
                        window.dispatchEvent(new CustomEvent("toast", { detail: { type: "error", message: "Network error. Please ensure the API is running." } }));
                    }
                }}>
                    <input type="hidden" name="id" />
                    <Input label="Name" name="firstName" isRequired placeholder="First name" variant="bordered" />
                    <Input label="Lastname" name="lastName" isRequired placeholder="Last name" variant="bordered" />

                    <Input label="Email" name="email" type="email" isRequired placeholder="name@example.com" variant="bordered" className="md:col-span-2" />
                    <Input label="Phone number" name="phoneNumber" type="tel" placeholder="e.g. 082 123 4567" variant="bordered" />

                    <div className="flex items-center gap-2">
                        <Input
                            label="RSA ID number"
                            name="idNumber"
                            isRequired
                            placeholder="13-digit ID"
                            variant="bordered"
                            value={idNumber}
                            onValueChange={(val) => {
                                setIdNumber(val);
                                // Notify RSA ID dot indicator about changes
                                window.dispatchEvent(new CustomEvent("rsa-id-change", { detail: val }));
                                const valid = isValidSouthAfricanId(val);
                                setIdValid(valid);
                                if (valid) setDateOfBirth(parseDobFromRsaId(val) ?? "");
                                else setDateOfBirth("");
                            }}
                        />
                        <RsaIdDot />
                    </div>

                    <Input
                        label="Date of birth"
                        name="dateOfBirth"
                        type="date"
                        variant="bordered"
                        value={dateOfBirth}
                        onValueChange={setDateOfBirth}
                    />

                    <Input label="Address" name="address" isRequired placeholder="Street, City, Code" variant="bordered" />

                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-foreground-600 block mb-1" htmlFor="medicalAid">Medical aid</label>
                        <select id="medicalAid" name="medicalAid" required defaultValue="" className="w-full rounded-medium border border-default-300 bg-transparent px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="" disabled>Select option</option>
                            {medicalAidOptions.map((opt) => (
                                <option key={opt.key} value={opt.key}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-foreground-600 block mb-1" htmlFor="medicalHistory">Medical history</label>
                        <textarea id="medicalHistory" name="medicalHistory" rows={3} placeholder="Provide relevant medical history" className="w-full rounded-medium border border-default-300 bg-transparent px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-foreground-600 block mb-1" htmlFor="allergies">Known allergies</label>
                        <textarea id="allergies" name="allergies" rows={3} placeholder="List any known allergies" className="w-full rounded-medium border border-default-300 bg-transparent px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-foreground-600 block mb-1" htmlFor="currentMedication">Current medication</label>
                        <textarea id="currentMedication" name="currentMedication" rows={3} placeholder="List current medications" className="w-full rounded-medium border border-default-300 bg-transparent px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>

                    <div className="md:col-span-2 flex justify-between items-center gap-3 pt-2">
                        <div className="flex items-center gap-3">
                            {editingId && (
                                <>
                                    <Button color="danger" variant="flat" onClick={async (e) => {
                                        e.preventDefault();
                                        const form = document.getElementById("patient-form") as HTMLFormElement | null;
                                        if (!form) return;
                                        const existingId = (form.dataset.patientId || "").trim();
                                        if (!existingId) {
                                            window.dispatchEvent(new CustomEvent("toast", { detail: { type: "warning", message: "Select a patient to delete." } }));
                                            return;
                                        }
                                        if (!confirm("Are you sure you want to delete this patient? This action cannot be undone.")) return;
                                        try {
                                            const { deletePatient } = await import("../services/patients");
                                            const res = await deletePatient(existingId);
                                            if (!res.ok) {
                                                window.dispatchEvent(new CustomEvent("toast", { detail: { type: "error", message: "Delete failed." } }));
                                                return;
                                            }
                                            window.dispatchEvent(new CustomEvent("toast", { detail: { type: "success", message: "Patient deleted." } }));
                                            form.reset();
                                            delete form.dataset.patientId;
                                            setIdNumber("");
                                            // reset RSA ID dot status to idle
                                            window.dispatchEvent(new CustomEvent("rsa-id-change", { detail: "" }));
                                            setDateOfBirth("");
                                            setEditingId("");
                                            setFormOpen(false);
                                        } catch (err) {
                                            console.error(err);
                                            window.dispatchEvent(new CustomEvent("toast", { detail: { type: "error", message: "Network error during delete." } }));
                                        }
                                    }}>Delete</Button>
                                    <Button color="secondary" variant="flat" onClick={async (e) => {
                                        e.preventDefault();
                                        const form = document.getElementById("patient-form") as HTMLFormElement | null;
                                        if (!form) return;
                                        const existingId = (form.dataset.patientId || "").trim();
                                        if (!existingId) {
                                            window.dispatchEvent(new CustomEvent("toast", { detail: { type: "warning", message: "Select a patient to update." } }));
                                            return;
                                        }
                                        const formData = new FormData(form);
                                        const payload = Object.fromEntries(formData.entries());
                                        try {
                                            const { updatePatient } = await import("../services/patients");
                                            const res = await updatePatient(existingId, payload);
                                            if (!res.ok) {
                                                console.error("Failed to update patient", await res.text());
                                                window.dispatchEvent(new CustomEvent("toast", { detail: { type: "error", message: "Update failed. Please try again." } }));
                                                return;
                                            }
                                            window.dispatchEvent(new CustomEvent("toast", { detail: { type: "success", message: "Patient updated successfully." } }));
                                        } catch (err) {
                                            console.error(err);
                                            window.dispatchEvent(new CustomEvent("toast", { detail: { type: "error", message: "Network error during update." } }));
                                        }
                                    }}>Update</Button>
                                </>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Button type="reset" variant="flat" onClick={() => { const form = document.getElementById("patient-form") as HTMLFormElement | null; if (form) delete form.dataset.patientId; setIdNumber(""); window.dispatchEvent(new CustomEvent("rsa-id-change", { detail: "" })); setDateOfBirth(""); setEditingId(""); }}>Clear</Button>
                            {!editingId && (<Button color="primary" type="submit">Save</Button>)}
                        </div>
                    </div>
                </form>
            </div>
            )}
        </section>
    );
}
