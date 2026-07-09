import { useState, useEffect, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Loader2, Save, Download } from "lucide-react";
import { Link } from "wouter";
import { 
  useGetResume, 
  useUpdateResume, 
  getGetResumeQueryKey, 
  getListResumesQueryKey,
  ResumeData
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CVPreview } from "@/components/CVPreview";
import { ModernTemplate, ClassicTemplate, MinimalTemplate, ExecutiveTemplate } from "@/components/cv-templates";
import { TEMPLATES, ACCENT_COLORS } from "@/lib/constants";

import { 
  PersonalInfoSection, 
  WorkExperienceSection, 
  EducationSection, 
  SkillsSection, 
  LanguagesSection,
  CoursesSection
} from "@/components/editor/EditorSections";

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const resumeId = parseInt(id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries & Mutations
  const { data: resume, isLoading, isError } = useGetResume(resumeId, {
    query: {
      enabled: !!resumeId,
      queryKey: getGetResumeQueryKey(resumeId)
    }
  });

  const updateResume = useUpdateResume();

  // Local State
  const [title, setTitle] = useState("");
  const [template, setTemplate] = useState("");
  const [accentColor, setAccentColor] = useState("");
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  
  // Save State
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [pdfLoading, setPdfLoading] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialization Guard
  const initializedForId = useRef<number | null>(null);
  const lastSavedData = useRef<{ title: string, template: string, accentColor: string, data: ResumeData | null }>({
    title: "", template: "", accentColor: "", data: null
  });
  const mutateFnRef = useRef(updateResume.mutate);

  // Keep ref up to date
  useEffect(() => {
    mutateFnRef.current = updateResume.mutate;
  }, [updateResume.mutate]);

  const handleDownloadPDF = useCallback(async () => {
    if (!resumeData) return;
    setPdfLoading(true);

    const TemplateMap: Record<string, React.ComponentType<{ data: ResumeData; accentColor: string }>> = {
      modern: ModernTemplate,
      classic: ClassicTemplate,
      minimal: MinimalTemplate,
      executive: ExecutiveTemplate,
    };
    const TemplateComponent = TemplateMap[template] ?? ModernTemplate;

    // Render the template off-screen to measure content height
    const container = document.createElement("div");
    container.style.cssText =
      "position:absolute;left:-9999px;top:0;width:794px;background:#fff;overflow:visible;";
    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(<TemplateComponent data={resumeData} accentColor={accentColor} />);

    // Wait for React to paint and images to load
    await new Promise((r) => setTimeout(r, 600));

    try {
      // A4 at 96 dpi = 794 × 1123 px
      const A4_H_PX = 1123;
      const contentH = container.scrollHeight;
      // Scale down to fit one page when content is close; let it be multi-page if truly long
      const scale = contentH <= A4_H_PX * 1.5 ? Math.min(1, A4_H_PX / contentH) : 1;

      // ── Collect all CSS from the current document ──────────────────────────
      // Vite injects styles as same-origin <style> tags — cssRules is accessible.
      const cssChunks: string[] = [];
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules ?? [])) {
            cssChunks.push(rule.cssText);
          }
        } catch { /* skip cross-origin sheets */ }
      }

      // ── Open a minimal print window ────────────────────────────────────────
      const printWin = window.open("", "_blank", "width=900,height=700");
      if (!printWin) {
        toast({
          title: "Permite las ventanas emergentes",
          description: "Activa los popups para este sitio y vuelve a intentarlo.",
          variant: "destructive",
        });
        return;
      }

      printWin.document.open();
      printWin.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${cssChunks.join("\n")}
/* Force exact color printing — no browser color adjustments */
*, *::before, *::after {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}
html, body { margin: 0; padding: 0; background: white; }
@media print {
  @page { margin: 0; size: A4 portrait; }
  body > div {
    transform-origin: top left;
    transform: scale(${scale.toFixed(4)});
    width: 794px;
  }
}
</style>
</head>
<body><div>${container.innerHTML}</div></body>
</html>`);
      printWin.document.close();

      // Give the print window time to load images and apply styles
      await new Promise((r) => setTimeout(r, 900));

      printWin.focus();
      printWin.print();

      // Auto-close after the print dialog is dismissed
      setTimeout(() => { try { printWin.close(); } catch { /* ok */ } }, 3000);

    } catch (e) {
      console.error("PDF error:", e);
      toast({ title: "Error al generar PDF", description: String(e), variant: "destructive" });
    } finally {
      root.unmount();
      document.body.removeChild(container);
      setPdfLoading(false);
    }
  }, [resumeData, template, accentColor, title, toast]);

  // Init Data from Server
  useEffect(() => {
    if (resume && initializedForId.current !== resumeId) {
      initializedForId.current = resumeId;
      setTitle(resume.title);
      setTemplate(resume.template);
      setAccentColor(resume.accentColor);
      setResumeData(resume.data);
      
      lastSavedData.current = {
        title: resume.title,
        template: resume.template,
        accentColor: resume.accentColor,
        data: JSON.parse(JSON.stringify(resume.data))
      };
    }
  }, [resume, resumeId]);

  // Handle redirect if bad ID or invalid param
  useEffect(() => {
    if (!resumeId || isNaN(resumeId) || resumeId <= 0) {
      setLocation("/");
    }
  }, [resumeId, setLocation]);

  useEffect(() => {
    if (isError) {
      toast({
        title: "CV no encontrado",
        description: "No se encontró el CV solicitado.",
        variant: "destructive"
      });
      setLocation("/");
    }
  }, [isError, setLocation, toast]);

  // Auto-Save Logic
  const triggerSave = useCallback(() => {
    if (!resumeData || !title || !template || !accentColor) return;
    
    const currentSnapshot = JSON.stringify({ title, template, accentColor, data: resumeData });
    const lastSavedSnapshot = JSON.stringify(lastSavedData.current);
    
    if (currentSnapshot === lastSavedSnapshot) return;

    setSaveStatus("saving");

    mutateFnRef.current(
      {
        id: resumeId,
        data: { title, template, accentColor, data: resumeData }
      },
      {
        onSuccess: (updatedResume) => {
          setSaveStatus("saved");
          
          lastSavedData.current = {
            title, template, accentColor, data: JSON.parse(JSON.stringify(resumeData))
          };

          queryClient.setQueryData(getGetResumeQueryKey(resumeId), updatedResume);
          queryClient.invalidateQueries({ queryKey: getListResumesQueryKey() });

          setTimeout(() => setSaveStatus("idle"), 2000);
        },
        onError: () => {
          setSaveStatus("idle");
          toast({
            title: "Error al guardar",
            description: "No se pudieron guardar los cambios. Verifica tu conexión.",
            variant: "destructive"
          });
        }
      }
    );
  }, [resumeId, title, template, accentColor, resumeData, queryClient, toast]);

  // Debounce effect
  useEffect(() => {
    if (initializedForId.current !== resumeId) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      triggerSave();
    }, 800);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [resumeData, title, template, accentColor, resumeId, triggerSave]);

  const updateData = (section: keyof ResumeData, payload: any) => {
    setResumeData(prev => prev ? { ...prev, [section]: payload } : null);
  };

  if (isLoading || !resumeData) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-white overflow-hidden">
      {/* Editor Header */}
      <header className="border-b h-14 shrink-0 flex items-center justify-between px-4 bg-white z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          
          <Input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-48 h-8 border-transparent hover:border-border focus-visible:ring-1 bg-transparent font-medium"
          />
        </div>

        <div className="flex items-center gap-5 overflow-x-auto">
          {/* Template selector */}
          <div className="flex items-center gap-2 text-sm shrink-0">
            <span className="text-muted-foreground font-medium uppercase text-xs tracking-wider">Plantilla:</span>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger className="h-8 w-[130px] border-none shadow-none bg-gray-100 hover:bg-gray-200">
                <SelectValue placeholder="Plantilla" />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATES.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Accent color picker */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-muted-foreground font-medium uppercase text-xs tracking-wider">Acento:</span>
            <div className="flex gap-1">
              {ACCENT_COLORS.map(c => (
                <button
                  key={c.value}
                  className={`w-5 h-5 rounded-full border border-black/10 transition-transform ${accentColor === c.value ? 'scale-125 ring-1 ring-offset-1 ring-primary' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c.value }}
                  onClick={() => setAccentColor(c.value)}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Save status + Download */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 min-w-[80px] justify-end">
              {saveStatus === "saving" && (
                <span className="text-xs text-muted-foreground flex items-center">
                  <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> Guardando...
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="text-xs text-green-600 flex items-center font-medium">
                  <Save className="h-3 w-3 mr-1.5" /> Guardado
                </span>
              )}
            </div>
            <Button
              size="sm"
              className="h-8 gap-1.5 rounded-full px-4 font-medium"
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
            >
              {pdfLoading
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generando...</>
                : <><Download className="h-3.5 w-3.5" /> Descargar PDF</>
              }
            </Button>
          </div>
        </div>
      </header>

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Forms */}
        <div className="w-[450px] shrink-0 border-r bg-gray-50 overflow-y-auto">
          <div className="p-6 pb-24">
            <Accordion type="multiple" defaultValue={["personal"]} className="space-y-4">
              <AccordionItem value="personal" className="bg-white rounded-lg border px-1 shadow-sm">
                <AccordionTrigger className="px-4 font-semibold hover:no-underline text-[15px]">Información personal</AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <PersonalInfoSection 
                    data={resumeData.personalInfo} 
                    onChange={(data: any) => updateData('personalInfo', data)} 
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="experience" className="bg-white rounded-lg border px-1 shadow-sm">
                <AccordionTrigger className="px-4 font-semibold hover:no-underline text-[15px]">Experiencia laboral</AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <WorkExperienceSection 
                    data={resumeData.workExperience || []} 
                    onChange={(data: any) => updateData('workExperience', data)} 
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="education" className="bg-white rounded-lg border px-1 shadow-sm">
                <AccordionTrigger className="px-4 font-semibold hover:no-underline text-[15px]">Educación</AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <EducationSection 
                    data={resumeData.education || []} 
                    onChange={(data: any) => updateData('education', data)} 
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="skills" className="bg-white rounded-lg border px-1 shadow-sm">
                <AccordionTrigger className="px-4 font-semibold hover:no-underline text-[15px]">Habilidades</AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <SkillsSection 
                    data={resumeData.skills || []} 
                    onChange={(data: any) => updateData('skills', data)} 
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="languages" className="bg-white rounded-lg border px-1 shadow-sm">
                <AccordionTrigger className="px-4 font-semibold hover:no-underline text-[15px]">Idiomas</AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <LanguagesSection 
                    data={resumeData.languages || []} 
                    onChange={(data: any) => updateData('languages', data)} 
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="courses" className="bg-white rounded-lg border px-1 shadow-sm">
                <AccordionTrigger className="px-4 font-semibold hover:no-underline text-[15px]">Formación Complementaria</AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <CoursesSection 
                    data={resumeData.courses || []} 
                    onChange={(data: any) => updateData('courses', data)} 
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 bg-zinc-200 overflow-hidden relative">
          <CVPreview 
            data={resumeData} 
            template={template} 
            accentColor={accentColor}
          />
        </div>
      </div>
    </div>
  );
}
