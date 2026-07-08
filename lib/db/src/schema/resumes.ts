import { pgTable, serial, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const resumesTable = pgTable("resumes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  template: text("template").notNull().default("modern"),
  accentColor: text("accent_color").notNull().default("#2563eb"),
  data: jsonb("data").notNull().$type<ResumeData>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertResumeSchema = createInsertSchema(resumesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type ResumeRow = typeof resumesTable.$inferSelect;

// Resume data types
export interface PersonalInfo {
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  locality?: string;
  city?: string;
  country?: string;
  birthDate?: string;
  nationality?: string;
  maritalStatus?: string;
  idNumber?: string;
  linkedin?: string;
  website?: string;
  summary?: string;
  photoUrl?: string | null;
}

export interface WorkExperience {
  id: string;
  jobTitle: string;
  employer: string;
  startDate: string;
  endDate?: string | null;
  current: boolean;
  city?: string;
  description?: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string | null;
  current: boolean;
  city?: string;
  description?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
}

export interface Language {
  id: string;
  language: string;
  proficiency: string;
}

export interface ResumeData {
  personalInfo?: PersonalInfo;
  workExperience?: WorkExperience[];
  education?: Education[];
  skills?: Skill[];
  languages?: Language[];
}
