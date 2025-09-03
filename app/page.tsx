"use client";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/textarea";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";

export default function Home() {
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
      {/* Logo and title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="size-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">tX</div>
        <h1 className="text-2xl md:text-3xl font-semibold">trueX Health</h1>
      </div>

      <Card className="w-full max-w-3xl">
        <CardBody>
          <h2 className="text-xl font-semibold mb-6">patient form:</h2>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Name" name="name" isRequired placeholder="First name" variant="bordered" />
            <Input label="Lastname" name="lastname" isRequired placeholder="Last name" variant="bordered" />

            <Input label="Email" name="email" type="email" isRequired placeholder="name@example.com" variant="bordered" className="md:col-span-2" />

            <Input label="Phone number" name="phone" type="tel" placeholder="e.g. 082 123 4567" variant="bordered" />
            <Input label="RSA ID number" name="rsaId" placeholder="13-digit ID" variant="bordered" />

            <Input label="Date of birth" name="dob" type="date" variant="bordered" />
            <Input label="Address" name="address" placeholder="Street, City, Code" variant="bordered" />

            <div className="md:col-span-2">
              <Select label="Medical aid" name="medicalAid" variant="bordered" placeholder="Select option">
                {medicalAidOptions.map((opt) => (
                  <SelectItem key={opt.key}>{opt.label}</SelectItem>
                ))}
              </Select>
            </div>

            <Textarea label="Medical history" name="medicalHistory" minRows={3} placeholder="Provide relevant medical history" variant="bordered" className="md:col-span-2" />

            <Textarea label="Known allergies" name="knownAllergies" minRows={3} placeholder="List any known allergies" variant="bordered" className="md:col-span-2" />

            <Textarea label="Current medication" name="currentMedication" minRows={3} placeholder="List current medications" variant="bordered" className="md:col-span-2" />

            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <Button type="reset" variant="flat">Clear</Button>
              <Button color="primary" type="submit">Submit</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </section>
  );
}
