"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { Upload, FileText } from "lucide-react";

const proposalSchema = z.object({
  projectFile: z.string().min(1, "Project file is required."),
  projectFileName: z.string().min(1, "Project file name is required."),
});

interface ChangeProposalFormProps {
  teamId: string;
  initialProjectFile: string | null;
  initialProjectFileName: string | null;
  onProposalChanged: () => void;
}

export function ChangeProposalForm({
  teamId,
  initialProjectFile,
  initialProjectFileName,
  onProposalChanged,
}: ChangeProposalFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projectFile, setProjectFile] = useState<string | null>(initialProjectFile);
  const [projectFileName, setProjectFileName] = useState<string | null>(initialProjectFileName);
  const [errors, setErrors] = useState<z.ZodFormattedError<z.infer<typeof proposalSchema>> | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed.");
        setProjectFile(null);
        setProjectFileName(null);
        e.target.value = ""; // Clear the input
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProjectFile(reader.result as string); // Store Base64 string
        setProjectFileName(file.name); // Store file name
      };
      reader.readAsDataURL(file);
    } else {
      setProjectFile(null);
      setProjectFileName(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = proposalSchema.safeParse({ projectFile, projectFileName });
    if (!result.success) {
      setErrors(result.error.format());
      toast.error("Please upload a project file.");
      return;
    }
    setErrors(null);

    try {
      const response = await fetch(`/api/teams/${teamId}/proposal`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectFile, projectFileName }),
      });

      if (response.ok) {
        toast.success("Project proposal updated successfully!");
        setIsDialogOpen(false);
        onProposalChanged(); // Callback to refresh team data in dashboard
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update project proposal.");
      }
    } catch (error) {
      console.error("Error updating project proposal:", error);
      toast.error("An unexpected error occurred.");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form state when dialog is closed
      setProjectFile(initialProjectFile);
      setProjectFileName(initialProjectFileName);
      setErrors(null);
    }
    setIsDialogOpen(open);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="flex-1 text-2xl font-bold">
          <FileText className="h-8 w-8 mr-4" /> Change Proposal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Change Project Proposal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project-file" className="text-right">
              <Upload className="w-4 h-4 mr-2 inline" /> Upload New Proposal
            </Label>
            <Input
              id="project-file"
              type="file"
              onChange={handleFileChange}
              className="col-span-3"
            />
          </div>
          {errors?.projectFile && <p className="text-red-500 text-xs mt-1">{errors.projectFile._errors[0]}</p>}
          {projectFileName && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              Current file: {projectFileName}
            </p>
          )}
          <Button type="submit" className="w-full mt-4">Update Proposal</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
