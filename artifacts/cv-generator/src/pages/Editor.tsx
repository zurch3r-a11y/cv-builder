import { useState, useEffect, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Loader2, Save, Download, Type } from "lucide-react";
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
import { TEMPLATES, ACCENT_COLORS, TEXT_COLORS } from "@/lib/constants";

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
  const [textColor, setTextColor] = useState("#111827");
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  
  // Save State
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [pdfLoading, setPdfLoading] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialization Guard
  const initializedForId = useRef<number | null>(null);
  const lastSavedData = useRef<{ title: string, template: string, accentColor: string, textColor: string, data: ResumeData | null }>({
    title: "", template: "", accentColor: "", textColor: "", data: null
  });
  const mutateFnRef = useRef(updateResume.mutate);

  // Keep ref up to date
  useEffect(() => {
    mutateFnRef.current = updateResume.mutate;
  }, [updateResume.mutate]);

  const handleDownloadPDF = useCallback(async () => {
    if (!resumeData) return;
    setPdfLoading(true);

    // Render the CV template into an off-screen div.
    // Use position:absolute so the container's height is content-driven,
    // not fixed to the viewport (which is what position:fixed causes).
    const container = document.createElement("div");
    container.style.cssText =
      "position:absolute;left:-9999px;top:0;width:794px;background:#fff;z-index:-1;overflow:visible;";
    document.body.appendChild(container);

    const TemplateMap: Record<string, React.ComponentType<{ data: ResumeData; accentColor: string; textColor?: string }>> = {
      modern: ModernTemplate,
      classic: ClassicTemplate,
      minimal: MinimalTemplate,
      executive: ExecutiveTemplate,
    };
    const TemplateComponent = TemplateMap[template] ?? ModernTemplate;

    const root = createRoot(container);
    root.render(
      <TemplateComponent data={resumeData} accentColor={accentColor} textColor={textColor} />
    );

    // Give React a moment to paint
    await new Promise((r) => setTimeout(r, 500));

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
        // html2canvas crashes on oklch() (Tailwind v4). Rewrite all oklch/oklab
        // to hex, plus strip color-mix() for opacity modifiers.
        onclone: (_clonedDoc: Document, element: HTMLElement) => {
          // ── Remove h-full so template only takes content height ───────────
          // Templates use h-full which resolves to viewport height in fixed/absolute
          // containers. Override to 'auto' so the PDF is compact.
          const templateRoot = element.firstElementChild as HTMLElement | null;
          if (templateRoot) {
            templateRoot.style.height = "auto";
            templateRoot.style.minHeight = "0";
          }

          // ── Color-space math ──────────────────────────────────────────────
          const gamma = (x: number) => {
            x = Math.max(0, Math.min(1, x));
            return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
          };
          const oklabToHex = (l: number, a: number, b: number): string => {
            const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
            const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
            const s_ = l - 0.0894841775 * a - 1.2914855480 * b;
            const L3 = l_ ** 3, M3 = m_ ** 3, S3 = s_ ** 3;
            const r  =  4.0767416621 * L3 - 3.3077115913 * M3 + 0.2309699292 * S3;
            const g  = -1.2684380046 * L3 + 2.6097574011 * M3 - 0.3413193965 * S3;
            const bv = -0.0041960863 * L3 - 0.7034186147 * M3 + 1.7076147010 * S3;
            const ri = Math.round(gamma(r) * 255);
            const gi = Math.round(gamma(g) * 255);
            const bi = Math.round(gamma(bv) * 255);
            return `#${ri.toString(16).padStart(2,"0")}${gi.toString(16).padStart(2,"0")}${bi.toString(16).padStart(2,"0")}`;
          };
          const oklchToHex = (l: number, c: number, h: number): string => {
            const hRad = (h * Math.PI) / 180;
            return oklabToHex(l, c * Math.cos(hRad), c * Math.sin(hRad));
          };

          // ── Named-color → rgb table (subset used by Tailwind) ────────────
          const NAMED: Record<string, [number,number,number]> = {
            white:[255,255,255], black:[0,0,0], transparent:[0,0,0],
            red:[255,0,0], green:[0,128,0], blue:[0,0,255],
          };
          const hexToRgb = (hex: string): [number,number,number] => [
            parseInt(hex.slice(1,3),16),
            parseInt(hex.slice(3,5),16),
            parseInt(hex.slice(5,7),16),
          ];
          const parseColor = (tok: string): [number,number,number] | null => {
            tok = tok.trim().toLowerCase();
            if (NAMED[tok]) return NAMED[tok];
            if (/^#[0-9a-f]{6}$/i.test(tok)) return hexToRgb(tok);
            if (/^#[0-9a-f]{8}$/i.test(tok)) return hexToRgb(tok.slice(0,7));
            return null;
          };
          const pct = (v: string) => v.endsWith("%") ? +v.slice(0,-1)/100 : +v;

          // ── Main patcher ──────────────────────────────────────────────────
          const patchText = (css: string): string => {
            css = css.replace(
              /oklch\(\s*([+-]?[\d.]+%?)\s+([+-]?[\d.]+%?)\s+([+-]?[\d.]+%?)(?:\s*\/\s*([+-]?[\d.]+%?))?\s*\)/g,
              (_m, ls, cs, hs, as) => {
                const hex = oklchToHex(pct(ls), pct(cs), pct(hs));
                if (as !== undefined) {
                  const a = Math.round(Math.max(0,Math.min(1,pct(as)))*255);
                  return `${hex}${a.toString(16).padStart(2,"0")}`;
                }
                return hex;
              }
            );
            css = css.replace(
              /oklab\(\s*([+-]?[\d.]+%?)\s+([+-]?[\d.]+%?)\s+([+-]?[\d.]+%?)(?:\s*\/\s*([+-]?[\d.]+%?))?\s*\)/g,
              (_m, ls, as2, bs, alphas) => {
                const hex = oklabToHex(pct(ls), pct(as2), pct(bs));
                if (alphas !== undefined) {
                  const a = Math.round(Math.max(0,Math.min(1,pct(alphas)))*255);
                  return `${hex}${a.toString(16).padStart(2,"0")}`;
                }
                return hex;
              }
            );
            const evalColorMix = (colorTok: string, mixPct: number): string => {
              const rgb = parseColor(colorTok);
              if (rgb) return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${(mixPct/100).toFixed(3)})`;
              return colorTok;
            };
            css = css.replace(
              /color-mix\(\s*in\s+ok[a-z]+\s*,\s*([^,]+?)\s+([\d.]+)%\s*,\s*transparent\s*\)/gi,
              (_m, c, p) => evalColorMix(c.trim(), +p)
            );
            css = css.replace(
              /color-mix\(\s*in\s+ok[a-z]+\s*,\s*transparent\s*,\s*([^,]+?)\s+([\d.]+)%\s*\)/gi,
              (_m, c, p) => evalColorMix(c.trim(), +p)
            );
            css = css.replace(
              /color-mix\(\s*in\s+ok[a-z]+\s*,\s*([^,]+?)\s+([\d.]+)%\s*,\s*([^)]+?)\s*\)/gi,
              (_m, c1, p1, c2) => {
                const rgb1 = parseColor(c1.trim());
                const rgb2 = parseColor(c2.trim());
                if (rgb1 && rgb2) {
                  const t = +p1 / 100;
                  const r = Math.round(rgb1[0]*t + rgb2[0]*(1-t));
                  const g = Math.round(rgb1[1]*t + rgb2[1]*(1-t));
                  const b = Math.round(rgb1[2]*t + rgb2[2]*(1-t));
                  return `rgb(${r},${g},${b})`;
                }
                return rgb1 ? `rgb(${rgb1[0]},${rgb1[1]},${rgb1[2]})` : (rgb2 ? `rgb(${rgb2[0]},${rgb2[1]},${rgb2[2]})` : "#888888");
              }
            );
            css = css.replace(/\bok(?:lab|lch)\b/gi, "srgb");
            return css;
          };

          element.ownerDocument.querySelectorAll("style").forEach((s) => {
            s.textContent = patchText(s.textContent ?? "");
          });
        },
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
  }, [resumeData, template, accentColor, textColor, title, toast]);

  // Init Data from Server
  useEffect(() => {
    if (resume && initializedForId.current !== resumeId) {
      initializedForId.current = resumeId;
      setTitle(resume.title);
      setTemplate(resume.template);
      setAccentColor(resume.accentColor);
      // textColor is persisted in localStorage (not the API) since it's a UI preference
      const storedTextColor = localStorage.getItem(`cv-textColor-${resumeId}`);
      setTextColor(storedTextColor || "#111827");
      setResumeData(resume.data);
      
      lastSavedData.current = {
        title: resume.title,
        template: resume.template,
        accentColor: resume.accentColor,
        textColor: storedTextColor || "#111827",
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
    
    const currentSnapshot = JSON.stringify({ title, template, accentColor, textColor, data: resumeData });
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
            title, template, accentColor, textColor, data: JSON.parse(JSON.stringify(resumeData))
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
  }, [resumeId, title, template, accentColor, textColor, resumeData, queryClient, toast]);

  // Persist textColor to localStorage whenever it changes
  useEffect(() => {
    if (initializedForId.current !== resumeId) return;
    localStorage.setItem(`cv-textColor-${resumeId}`, textColor);
  }, [textColor, resumeId]);

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
  }, [resumeData, title, template, accentColor, textColor, resumeId, triggerSave]);

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

          {/* Text color picker */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-muted-foreground font-medium uppercase text-xs tracking-wider flex items-center gap-1">
              <Type className="h-3 w-3" /> Texto:
            </span>
            <div className="flex gap-1">
              {TEXT_COLORS.map(c => (
                <button
                  key={c.value}
                  className={`w-5 h-5 rounded-full border border-black/10 transition-transform ${textColor === c.value ? 'scale-125 ring-1 ring-offset-1 ring-primary' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c.value }}
                  onClick={() => setTextColor(c.value)}
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
            </Accordion>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 bg-zinc-200 overflow-hidden relative">
          <CVPreview 
            data={resumeData} 
            template={template} 
            accentColor={accentColor}
            textColor={textColor}
          />
        </div>
      </div>
    </div>
  );
}
