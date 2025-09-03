"use client";
import React from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

import { RsaIdDot } from "../components/rsa-id-dot";

export default function Home() {
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
                <div className="size-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">tX</div>
                <h1 className="text-2xl md:text-3xl font-semibold">trueX Health</h1>
            </div>

            <div className="w-full max-w-3xl rounded-large border border-default-200 bg-background p-6">
                <h2 className="text-xl font-semibold mb-6">Patient form:</h2>

                <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget as HTMLFormElement;
                    const formData = new FormData(form);
                    const payload = Object.fromEntries(formData.entries());

                    try {
                        const { createPatient } = await import("../services/patients");
                        const res = await createPatient(payload);
                        if (!res.ok) {
                            console.error("Failed to submit form", await res.text());
                            window.dispatchEvent(new CustomEvent("toast", { detail: { type: "error", message: "Submission failed. Please try again." } }));
                            return;
                        }
                        window.dispatchEvent(new CustomEvent("toast", { detail: { type: "success", message: "Patient submitted successfully." } }));
                        form.reset();
                        setIdNumber("");
                        setDateOfBirth("");
                    } catch (err) {
                        console.error(err);
                        window.dispatchEvent(new CustomEvent("toast", { detail: { type: "error", message: "Network error. Please ensure the API is running." } }));
                    }
                }}>
                    <Input label="Name" name="firstName" isRequired placeholder="First name" variant="bordered" />
                    <Input label="Lastname" name="lastName" isRequired placeholder="Last name" variant="bordered" />

                    <Input label="Email" name="email" type="email" isRequired placeholder="name@example.com" variant="bordered" className="md:col-span-2" />
                    <Input label="Phone number" name="phoneNumber" type="tel" placeholder="e.g. 082 123 4567" variant="bordered" />

                    <div className="flex items-center gap-2">
                        <Input
                            label="RSA ID number"
                            name="idNumber"
                            placeholder="13-digit ID"
                            variant="bordered"
                            value={idNumber}
                            onValueChange={(val) => {
                                setIdNumber(val);
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

                    <Input label="Address" name="address" placeholder="Street, City, Code" variant="bordered" />

                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-foreground-600 block mb-1" htmlFor="medicalAid">Medical aid</label>
                        <select id="medicalAid" name="medicalAid" className="w-full rounded-medium border border-default-300 bg-transparent px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
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

                    <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                        <Button type="reset" variant="flat" onClick={() => { setIdNumber(""); setDateOfBirth(""); }}>Clear</Button>
                        <Button color="primary" type="submit">Submit</Button>
                    </div>
                </form>
            </div>
        </section>
    );
}
