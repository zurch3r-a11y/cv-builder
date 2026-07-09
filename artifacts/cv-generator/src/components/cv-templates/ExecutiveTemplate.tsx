import { TemplateProps } from "./types";
import { renderDescription, renderInline, formatDateRange, formatBirthDate } from "./render-description";

export function ExecutiveTemplate({ data, accentColor }: TemplateProps) {
  const { personalInfo, workExperience, education, skills, languages, courses } = data;

  return (
    <div className="w-full bg-white font-sans text-[13px] leading-relaxed flex flex-col text-gray-800">
      {/* Bold Header */}
      <div className="text-white p-8 flex flex-col items-center justify-center text-center" style={{ backgroundColor: accentColor }}>
        {personalInfo?.photoUrl && (
          <div className="mb-4">
            <img
              src={personalInfo.photoUrl}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-white/40 mx-auto"
            />
          </div>
        )}
        <h1 className="text-4xl font-bold tracking-wider uppercase mb-2">
          {personalInfo?.firstName} {personalInfo?.lastName}
        </h1>
        <p className="text-lg font-medium tracking-widest uppercase opacity-90 mb-4">
          {personalInfo?.jobTitle}
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm opacity-80">
          {personalInfo?.email && <span>{personalInfo.email}</span>}
          {personalInfo?.phone && <span>{personalInfo.phone}</span>}
          {(personalInfo?.locality || personalInfo?.city || personalInfo?.country) && (
            <span>{[personalInfo.locality, personalInfo.city, personalInfo.country].filter(Boolean).join(", ")}</span>
          )}
          {personalInfo?.birthDate && <span>{formatBirthDate(personalInfo.birthDate)}</span>}
          {personalInfo?.nationality && <span>{personalInfo.nationality}</span>}
          {personalInfo?.maritalStatus && <span>{personalInfo.maritalStatus}</span>}
          {personalInfo?.idNumber && <span>C.I: {personalInfo.idNumber}</span>}
          {personalInfo?.linkedin && <span>{personalInfo.linkedin}</span>}
        </div>
      </div>

      <div className="flex flex-row flex-1 p-8 gap-8 bg-gray-50">

        {/* Main Column */}
        <div className="flex-1 flex flex-col gap-5">
          {personalInfo?.summary && (
            <div>
              <h2 className="text-xl font-bold uppercase border-b-2 pb-1 mb-3" style={{ borderColor: accentColor }}>
                Resumen Ejecutivo
              </h2>
              <div className="opacity-80">
                {renderDescription(personalInfo.summary)}
              </div>
            </div>
          )}

          {workExperience && workExperience.length > 0 && (
            <div>
              <h2 className="text-xl font-bold uppercase border-b-2 pb-1 mb-4" style={{ borderColor: accentColor }}>
                Experiencia Profesional
              </h2>
              <div className="flex flex-col gap-4">
                {workExperience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-[15px]">{exp.jobTitle}</h3>
                      <span className="opacity-50 font-semibold text-xs uppercase tracking-wider">
                        {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                      </span>
                    </div>
                    <div className="font-medium mb-1 opacity-70">
                      {exp.employer} {exp.city && `| ${exp.city}`}
                    </div>
                    {exp.description && (
                      <div className="opacity-75">
                        {renderDescription(exp.description)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="w-[30%] flex flex-col gap-5">

          {education && education.length > 0 && (
            <div>
              <h2 className="text-lg font-bold uppercase border-b-2 pb-1 mb-3" style={{ borderColor: accentColor }}>
                Educación
              </h2>
              <div className="flex flex-col gap-3">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <h3 className="font-bold text-sm">{edu.degree}</h3>
                    <div className="text-xs mb-1 opacity-60">{edu.fieldOfStudy}</div>
                    <div className="text-xs mb-1 opacity-50">
                      {renderInline(edu.school)}
                    </div>
                    <span className="opacity-40 text-xs">
                      {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {skills && skills.length > 0 && (
            <div>
              <h2 className="text-lg font-bold uppercase border-b-2 pb-1 mb-3" style={{ borderColor: accentColor }}>
                Habilidades
              </h2>
              <div className="flex flex-col gap-2">
                {skills.map((skill) => (
                  <div key={skill.id} className="flex justify-between items-center text-sm">
                    <span className="font-medium opacity-80">{skill.name}</span>
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${skill.level}%`, backgroundColor: accentColor }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {languages && languages.length > 0 && (
            <div>
              <h2 className="text-lg font-bold uppercase border-b-2 pb-1 mb-3" style={{ borderColor: accentColor }}>
                Idiomas
              </h2>
              <div className="flex flex-col gap-2">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex flex-col text-sm">
                    <span className="font-bold opacity-80">{lang.language}</span>
                    <span className="opacity-50 text-xs">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {courses && courses.length > 0 && (
            <div>
              <h2 className="text-lg font-bold uppercase border-b-2 pb-1 mb-3" style={{ borderColor: accentColor }}>
                Form. Complementaria
              </h2>
              <div className="flex flex-col gap-2.5">
                {courses.map((course) => (
                  <div key={course.id}>
                    <div className="font-bold text-sm leading-tight">{course.name}</div>
                    <div className="text-[11px] opacity-50 uppercase tracking-wide">{course.modality}</div>
                    {course.description && (
                      <div className="text-xs opacity-70 leading-snug mt-0.5">{renderDescription(course.description)}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
