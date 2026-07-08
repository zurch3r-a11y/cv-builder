import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, resumesTable } from "@workspace/db";
import {
  CreateResumeBody,
  UpdateResumeBody,
  GetResumeParams,
  UpdateResumeParams,
  DeleteResumeParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/resumes", async (req, res): Promise<void> => {
  const resumes = await db
    .select({
      id: resumesTable.id,
      title: resumesTable.title,
      template: resumesTable.template,
      accentColor: resumesTable.accentColor,
      data: resumesTable.data,
      updatedAt: resumesTable.updatedAt,
    })
    .from(resumesTable)
    .orderBy(resumesTable.updatedAt);

  const summaries = resumes.map((r) => ({
    id: r.id,
    title: r.title,
    template: r.template,
    accentColor: r.accentColor,
    firstName: r.data?.personalInfo?.firstName ?? null,
    lastName: r.data?.personalInfo?.lastName ?? null,
    jobTitle: r.data?.personalInfo?.jobTitle ?? null,
    updatedAt: r.updatedAt.toISOString(),
  }));

  res.json(summaries);
});

router.post("/resumes", async (req, res): Promise<void> => {
  const parsed = CreateResumeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [resume] = await db
    .insert(resumesTable)
    .values({
      title: parsed.data.title,
      template: parsed.data.template,
      accentColor: parsed.data.accentColor,
      data: parsed.data.data as object,
    })
    .returning();

  res.status(201).json({
    id: resume.id,
    title: resume.title,
    template: resume.template,
    accentColor: resume.accentColor,
    data: resume.data,
    createdAt: resume.createdAt.toISOString(),
    updatedAt: resume.updatedAt.toISOString(),
  });
});

router.get("/resumes/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetResumeParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [resume] = await db
    .select()
    .from(resumesTable)
    .where(eq(resumesTable.id, params.data.id));

  if (!resume) {
    res.status(404).json({ error: "Resume not found" });
    return;
  }

  res.json({
    id: resume.id,
    title: resume.title,
    template: resume.template,
    accentColor: resume.accentColor,
    data: resume.data,
    createdAt: resume.createdAt.toISOString(),
    updatedAt: resume.updatedAt.toISOString(),
  });
});

router.put("/resumes/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateResumeParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateResumeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateValues: Partial<typeof resumesTable.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (parsed.data.title !== undefined) updateValues.title = parsed.data.title;
  if (parsed.data.template !== undefined) updateValues.template = parsed.data.template;
  if (parsed.data.accentColor !== undefined) updateValues.accentColor = parsed.data.accentColor;
  if (parsed.data.data !== undefined) updateValues.data = parsed.data.data as object;

  const [resume] = await db
    .update(resumesTable)
    .set(updateValues)
    .where(eq(resumesTable.id, params.data.id))
    .returning();

  if (!resume) {
    res.status(404).json({ error: "Resume not found" });
    return;
  }

  res.json({
    id: resume.id,
    title: resume.title,
    template: resume.template,
    accentColor: resume.accentColor,
    data: resume.data,
    createdAt: resume.createdAt.toISOString(),
    updatedAt: resume.updatedAt.toISOString(),
  });
});

router.delete("/resumes/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteResumeParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [resume] = await db
    .delete(resumesTable)
    .where(eq(resumesTable.id, params.data.id))
    .returning();

  if (!resume) {
    res.status(404).json({ error: "Resume not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
