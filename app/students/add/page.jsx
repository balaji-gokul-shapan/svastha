import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

const gradeOptions = [
  { value: "V-A", label: "V-A" },
  { value: "VI-C", label: "VI-C" },
  { value: "VII-A", label: "VII-A" },
  { value: "VIII-B", label: "VIII-B" },
  { value: "IX-A", label: "IX-A" },
  { value: "X-B", label: "X-B" },
];

export default function AddStudentPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-sf text-2xl font-bold text-foreground">Add Student</h2>
        <p className="text-sm text-muted-foreground">
          Enter student details below to create a new record.
        </p>
      </div>

      <form className="space-y-4 rounded-xl border border-border bg-card p-5 sm:p-6">
        <Accordion defaultValue={["personal", "academic"]} multiple className="space-y-3">
          <AccordionItem value="personal">
            <AccordionTrigger>Personal Information</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="student-name" className="text-sm font-medium text-foreground">
                    Student Name
                  </label>
                  <Input
                    id="student-name"
                    name="studentName"
                    type="text"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="student-id" className="text-sm font-medium text-foreground">
                    Student ID
                  </label>
                  <Input
                    id="student-id"
                    name="studentId"
                    type="text"
                    placeholder="STU-0000"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="academic">
            <AccordionTrigger>Academic Data</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="grade" className="text-sm font-medium text-foreground">
                    Grade
                  </label>
                  <Combobox
                    id="grade"
                    name="grade"
                    items={gradeOptions}
                    placeholder="Select grade"
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-foreground">Admission Type</p>
                  <RadioGroup className="grid gap-2" aria-label="Admission Type">
                    <RadioGroupItem id="new-admission" name="admissionType" value="new" defaultChecked>
                      New Admission
                    </RadioGroupItem>
                    <RadioGroupItem id="transfer" name="admissionType" value="transfer">
                      Transfer
                    </RadioGroupItem>
                    <RadioGroupItem id="reemission" name="admissionType" value="reemission">
                      Re-admission
                    </RadioGroupItem>
                  </RadioGroup>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="guardian">
            <AccordionTrigger>Guardian Details</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="guardian" className="text-sm font-medium text-foreground">
                    Guardian Name
                  </label>
                  <Input
                    id="guardian"
                    name="guardian"
                    type="text"
                    placeholder="Parent/Guardian"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="guardian-phone" className="text-sm font-medium text-foreground">
                    Guardian Phone
                  </label>
                  <Input
                    id="guardian-phone"
                    name="guardianPhone"
                    type="tel"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="notes">
            <AccordionTrigger>Additional Notes</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1.5">
                <label htmlFor="notes" className="text-sm font-medium text-foreground">
                  Notes
                </label>
                <Textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  placeholder="Optional notes"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex items-center justify-end gap-2">
          <Link href="/students">
            <Button variant="outline" size="default" type="button">
              Cancel
            </Button>
          </Link>
          <Button variant="default" size="default" type="submit">
            Save Student
          </Button>
        </div>
      </form>
    </section>
  );
}
