import { TemplateProps } from "./types";
import { renderDescription } from "./render-description";

export function MinimalTemplate({ data, accentColor }: TemplateProps) {
  const { personalInfo, workExperience, education, skills, languages } = data;

  return (
    <div className="w-full bg-white font-sans p-12 text-[13px] leading-relaxed text-gray-800">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-6 mb-4">
          {personalInfo?.photoUrl && (
            <img
              src={personalInfo.photoUrl}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border border-gray-200 shrink-0"
            />
          )}
          <div>
            <h1 className="text-3xl font-medium tracking-tight mb-1">
              {personalInfo?.firstName} <span style={{ color: accentColor }}>{personalInfo?.lastName}</span>
            </h1>
            <p className="text-sm tracking-wide uppercase opacity-50">
              {personalInfo?.jobTitle}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-xs opacity-50">
          {personalInfo?.email && <span>{personalInfo.email}</span>}
          {personalInfo?.phone && <span>{personalInfo.phone}</span>}
          {(personalInfo?.locality || personalInfo?.city || personalInfo?.country) && (
            <span>{[personalInfo.locality, personalInfo.city, personalInfo.country].filter(Boolean).join(", ")}</span>
          )}
          {personalInfo?.birthDate && <span>{personalInfo.birthDate}</span>}
          {personalInfo?.nationality && <span>{personalInfo.nationality}</span>}
          {personalInfo?.maritalStatus && <span>{personalInfo.maritalStatus}</span>}
          {personalInfo?.idNumber && <span>C.I: {personalInfo.idNumber}</span>}
          {personalInfo?.linkedin && <span>{personalInfo.linkedin}</span>}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {personalInfo?.summary && (
          <div className="grid grid-cols-[120px_1fr] gap-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest opacity-40 mt-1">Perfil</h2>
            <div className="opacity-80">
              {renderDescription(personalInfo.summary)}
            </div>
          </div>
        )}

        {education && education.length > 0 && (
          <div className="grid grid-cols-[120px_1fr] gap-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest opacity-40 mt-1">Educación</h2>
            <div className="flex flex-col gap-4">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-medium text-[15px]">{edu.degree} {edu.fieldOfStudy && `en ${edu.fieldOfStudy}`}</h3>
                    <span className="opacity-40 text-xs">
                      {edu.startDate} - {edu.current ? "Actual" : edu.endDate}
                    </span>
                  </div>
                  <div className="opacity-50 mb-1">
                    {edu.school} {edu.city && `, ${edu.city}`}
                  </div>
                  {edu.description && (
                    <div className="opacity-70">
                      {renderDescription(edu.description)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {workExperience && workExperience.length > 0 && (
          <div className="grid grid-cols-[120px_1fr] gap-4 border-t border-gray-100 pt-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest opacity-40 mt-1">Experiencia</h2>
            <div className="flex flex-col gap-4">
              {workExperience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-medium text-[15px]">{exp.jobTitle}</h3>
                    <span className="opacity-40 text-xs">
                      {exp.startDate} - {exp.current ? "Actual" : exp.endDate}
                    </span>
                  </div>
                  <div className="opacity-50 mb-1">
                    {exp.employer} {exp.city && `, ${exp.city}`}
                  </div>
                  {exp.description && (
                    <div className="opacity-70">
                      {renderDescription(exp.description)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {skills && skills.length > 0 && (
          <div className="grid grid-cols-[120px_1fr] gap-4 border-t border-gray-100 pt-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest opacity-40 mt-1">Habilidades</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {skills.map((skill) => (
                <span key={skill.id} className="opacity-80">{skill.name}</span>
              ))}
            </div>
          </div>
        )}

        {languages && languages.length > 0 && (
          <div className="grid grid-cols-[120px_1fr] gap-4 border-t border-gray-100 pt-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest opacity-40 mt-1">Idiomas</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {languages.map((lang) => (
                <span key={lang.id} className="opacity-80">{lang.language} <span className="opacity-60">({lang.proficiency})</span></span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
