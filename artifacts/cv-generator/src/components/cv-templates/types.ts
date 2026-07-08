import { ResumeData } from "@workspace/api-client-react";

export interface TemplateProps {
  data: ResumeData;
  accentColor: string;
  textColor?: string;
}

export const defaultResumeData: ResumeData = {
  personalInfo: {
    firstName: "",
    lastName: "",
    jobTitle: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    summary: "",
    linkedin: "",
    website: "",
  },
  workExperience: [],
  education: [],
  skills: [],
  languages: [],
};
