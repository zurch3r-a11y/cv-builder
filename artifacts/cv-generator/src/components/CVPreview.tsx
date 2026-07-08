import React from "react";
import { ResumeData } from "@workspace/api-client-react";
import { ModernTemplate, ClassicTemplate, MinimalTemplate, ExecutiveTemplate } from "./cv-templates";

interface CVPreviewProps {
  data: ResumeData;
  template: string;
  accentColor: string;
  textColor?: string;
}

export function CVPreview({ data, template, accentColor, textColor }: CVPreviewProps) {
  const getTemplate = () => {
    switch (template) {
      case "classic":
        return <ClassicTemplate data={data} accentColor={accentColor} textColor={textColor} />;
      case "minimal":
        return <MinimalTemplate data={data} accentColor={accentColor} textColor={textColor} />;
      case "executive":
        return <ExecutiveTemplate data={data} accentColor={accentColor} textColor={textColor} />;
      case "modern":
      default:
        return <ModernTemplate data={data} accentColor={accentColor} textColor={textColor} />;
    }
  };

  return (
    <div className="cv-preview-wrapper w-full h-full flex justify-center bg-gray-100 overflow-y-auto p-8">
      {/* A4 Paper aspect ratio and shadow */}
      <div
        id="cv-print-area"
        className="bg-white shadow-xl overflow-hidden shrink-0"
        style={{
          width: "210mm",
          minHeight: "297mm",
          height: "max-content",
        }}
      >
        {getTemplate()}
      </div>
    </div>
  );
}
