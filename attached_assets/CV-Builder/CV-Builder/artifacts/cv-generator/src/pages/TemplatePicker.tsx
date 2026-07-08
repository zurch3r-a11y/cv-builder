import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Check } from "lucide-react";
import { Link } from "wouter";
import { useCreateResume } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { TEMPLATES, ACCENT_COLORS } from "@/lib/constants";
import { defaultResumeData } from "@/components/cv-templates/types";
import { CVPreview } from "@/components/CVPreview";

export default function TemplatePicker() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createResume = useCreateResume();
  
  const [title, setTitle] = useState("My Resume");
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id);
  const [selectedColor, setSelectedColor] = useState(ACCENT_COLORS[0].value);

  const sampleData = {
    ...defaultResumeData,
    personalInfo: {
      ...defaultResumeData.personalInfo,
      firstName: "Jane",
      lastName: "Doe",
      jobTitle: "Senior Product Designer",
      email: "jane.doe@example.com",
      phone: "+1 (555) 123-4567",
      city: "San Francisco",
      country: "USA",
      summary: "Award-winning designer with 8+ years of experience creating intuitive digital products. Specialized in design systems and user research.",
    },
    workExperience: [
      {
        id: "1",
        jobTitle: "Senior Designer",
        employer: "TechCorp",
        startDate: "Jan 2020",
        endDate: "",
        current: true,
        city: "San Francisco",
        description: "Lead designer for the core SaaS product, managing a team of 4 designers and revamping the entire design system."
      }
    ],
    skills: [
      { id: "1", name: "UI/UX Design", level: 90 },
      { id: "2", name: "Figma", level: 95 },
    ]
  };

  const handleCreate = () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your resume.",
        variant: "destructive"
      });
      return;
    }

    createResume.mutate(
      {
        data: {
          title,
          template: selectedTemplate,
          accentColor: selectedColor,
          data: defaultResumeData
        }
      },
      {
        onSuccess: (resume) => {
          toast({
            title: "Resume created",
            description: "Your new resume is ready to edit.",
          });
          setLocation(`/editor/${resume.id}`);
        },
        onError: () => {
          toast({
            title: "Creation failed",
            description: "There was a problem creating your resume. Please try again.",
            variant: "destructive"
          });
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold tracking-tight">Choose Template</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-64 hidden md:block">
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Resume Title"
                className="bg-gray-50 border-transparent focus-visible:bg-white"
                data-testid="input-resume-title"
              />
            </div>
            <Button 
              onClick={handleCreate} 
              disabled={createResume.isPending}
              className="rounded-full px-6 shadow-sm"
              data-testid="button-create-resume"
            >
              {createResume.isPending ? "Creating..." : "Start Editing"}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Controls */}
        <div className="w-full lg:w-1/3 flex flex-col gap-8">
          <div className="md:hidden">
            <Label htmlFor="mobile-title" className="mb-2 block text-sm font-semibold">Resume Title</Label>
            <Input 
              id="mobile-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Resume Title"
            />
          </div>

          <div>
            <Label className="mb-4 block text-sm font-semibold uppercase tracking-wider text-gray-500">
              Select Template
            </Label>
            <div className="grid grid-cols-2 gap-4">
              {TEMPLATES.map((t) => (
                <Card 
                  key={t.id}
                  className={`cursor-pointer p-4 transition-all duration-200 ${
                    selectedTemplate === t.id 
                      ? 'border-primary ring-2 ring-primary/20 shadow-md' 
                      : 'hover:border-gray-300 hover:shadow-sm'
                  }`}
                  onClick={() => setSelectedTemplate(t.id)}
                  data-testid={`template-${t.id}`}
                >
                  <h3 className="font-semibold text-gray-900">{t.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.description}</p>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-4 block text-sm font-semibold uppercase tracking-wider text-gray-500">
              Accent Color
            </Label>
            <div className="flex flex-wrap gap-3">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color.value}
                  className={`w-10 h-10 rounded-full transition-transform duration-200 flex items-center justify-center ${
                    selectedColor === color.value ? 'scale-110 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setSelectedColor(color.value)}
                  title={color.name}
                  data-testid={`color-${color.name.toLowerCase()}`}
                >
                  {selectedColor === color.value && <Check className="h-5 w-5 text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="w-full lg:w-2/3 h-[600px] lg:h-[calc(100vh-8rem)] rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
          <div className="h-full scale-[0.6] sm:scale-[0.8] lg:scale-[0.9] origin-top flex justify-center">
            <CVPreview 
              data={sampleData} 
              template={selectedTemplate} 
              accentColor={selectedColor} 
            />
          </div>
        </div>
      </main>
    </div>
  );
}
