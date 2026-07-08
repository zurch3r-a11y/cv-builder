import { useState, useEffect, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Loader2, Save, Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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
  LanguagesSection 
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
    // Render the CV template into an off-screen div to avoid any
    // overflow-clipping or scrollable-container capture issues.
    const container = document.createElement("div");
    container.style.cssText =
      "position:fixed;left:-9999px;top:0;width:794px;background:#fff;z-index:-1;";

    // html2canvas cannot parse oklch() (Tailwind v4's default color format).
    // Override every Tailwind CSS color token with an sRGB hex equivalent so
    // the canvas renderer sees only colors it understands.
    const compat = document.createElement("style");
    compat.textContent = `
      /* Tailwind v4 color token overrides — hex equivalents for html2canvas */
      *, *::before, *::after {
        --color-white: #ffffff;
        --color-black: #000000;
        --color-transparent: transparent;
        --color-gray-50:  #f9fafb; --color-gray-100: #f3f4f6;
        --color-gray-200: #e5e7eb; --color-gray-300: #d1d5db;
        --color-gray-400: #9ca3af; --color-gray-500: #6b7280;
        --color-gray-600: #4b5563; --color-gray-700: #374151;
        --color-gray-800: #1f2937; --color-gray-900: #111827;
        --color-zinc-50:  #fafafa; --color-zinc-100: #f4f4f5;
        --color-zinc-200: #e4e4e7; --color-zinc-300: #d4d4d8;
        --color-zinc-400: #a1a1aa; --color-zinc-500: #71717a;
        --color-zinc-600: #52525b; --color-zinc-700: #3f3f46;
        --color-zinc-800: #27272a; --color-zinc-900: #18181b;
        --color-slate-50:  #f8fafc; --color-slate-100: #f1f5f9;
        --color-slate-200: #e2e8f0; --color-slate-300: #cbd5e1;
        --color-slate-400: #94a3b8; --color-slate-500: #64748b;
        --color-slate-600: #475569; --color-slate-700: #334155;
        --color-slate-800: #1e293b; --color-slate-900: #0f172a;
        --color-red-50:  #fef2f2; --color-red-100: #fee2e2;
        --color-red-200: #fecaca; --color-red-400: #f87171;
        --color-red-500: #ef4444; --color-red-600: #dc2626;
        --color-red-700: #b91c1c; --color-red-800: #991b1b;
        --color-red-900: #7f1d1d;
        --color-blue-50:  #eff6ff; --color-blue-100: #dbeafe;
        --color-blue-200: #bfdbfe; --color-blue-400: #60a5fa;
        --color-blue-500: #3b82f6; --color-blue-600: #2563eb;
        --color-blue-700: #1d4ed8; --color-blue-800: #1e40af;
        --color-blue-900: #1e3a8a;
        --color-green-50:  #f0fdf4; --color-green-500: #22c55e;
        --color-green-600: #16a34a; --color-green-700: #15803d;
        --color-purple-500: #a855f7; --color-purple-600: #9333ea;
        --color-teal-500: #14b8a6;  --color-teal-600: #0d9488;
        --color-orange-500: #f97316; --color-orange-600: #ea580c;
        --color-rose-500: #f43f5e;  --color-rose-600: #e11d48;
      }
    `;
    container.appendChild(compat);
    document.body.appendChild(container);

    const TemplateMap: Record<string, React.ComponentType<{ data: ResumeData; accentColor: string }>> = {
      modern: ModernTemplate,
      classic: ClassicTemplate,
      minimal: MinimalTemplate,
      executive: ExecutiveTemplate,
    };
    const TemplateComponent = TemplateMap[template] ?? ModernTemplate;

    const root = createRoot(container);
    root.render(<TemplateComponent data={resumeData} accentColor={accentColor} />);

    // Give React a moment to paint
    await new Promise((r) => setTimeout(r, 400));

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 794,
        height: container.scrollHeight,
        windowWidth: 794,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = 210;
      const pageH = 297;
      const imgH = (canvas.height / canvas.width) * pageW;

      let y = 0;
      while (y < imgH) {
        if (y > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, -y, pageW, imgH);
        y += pageH;
      }

      const fileName = (title || "cv").replace(/\s+/g, "_").toLowerCase();
      pdf.save(`${fileName}.pdf`);
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
        data: JSON.parse(JSON.stringify(resume.data)) // Deep copy
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
    
    // Check if anything actually changed deeply
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
          
          // Update last saved snapshot
          lastSavedData.current = {
            title, template, accentColor, data: JSON.parse(JSON.stringify(resumeData))
          };

          // Patch cache locally to avoid full refetch
          queryClient.setQueryData(getGetResumeQueryKey(resumeId), updatedResume);
          // Invalidate list in background
          queryClient.invalidateQueries({ queryKey: getListResumesQueryKey() });

          // Reset to idle after a delay
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

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground font-medium uppercase text-xs tracking-wider">Plantilla:</span>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger className="h-8 w-[140px] border-none shadow-none bg-gray-100 hover:bg-gray-200">
                <SelectValue placeholder="Seleccionar plantilla" />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATES.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium uppercase text-xs tracking-wider">Color:</span>

            <div className="flex gap-1">
              {ACCENT_COLORS.map(c => (
                <button
                  key={c.value}
                  className={`w-6 h-6 rounded-full border border-black/10 transition-transform ${accentColor === c.value ? 'scale-125 ring-1 ring-offset-1 ring-primary' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c.value }}
                  onClick={() => setAccentColor(c.value)}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
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
