import { Mail, Phone, MapPin, Calendar, Globe, Heart, CreditCard, Link, User } from "lucide-react";
import { TemplateProps } from "./types";
import { renderDescription, renderInline, formatDateRange } from "./render-description";

function formatBirthDate(dateStr: string): string {
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  const m = parseInt(month, 10);
  if (m < 1 || m > 12) return dateStr;
  return `${parseInt(day, 10)} de ${meses[m - 1]} de ${year}`;
}

export function ModernTemplate({ data, accentColor }: TemplateProps) {
  const { personalInfo, workExperience, education, skills, languages, courses } = data;

  return (
    <div className="w-full flex flex-row bg-white font-sans text-[13px] leading-relaxed text-gray-800">
      {/* Left Sidebar */}
      <div
        className="w-[32%] text-white p-8"
        style={{ backgroundColor: accentColor }}
      >
        <div className="mb-8 text-center">
          <h1 className="text-xl font-bold tracking-wide mb-1 leading-tight">
            {personalInfo?.firstName} {personalInfo?.lastName}
          </h1>
          <p className="text-[12px] font-medium opacity-80 tracking-widest uppercase mb-4">
            {personalInfo?.jobTitle}
          </p>
          {personalInfo?.photoUrl && (
            <div className="flex justify-center">
              <img
                src={personalInfo.photoUrl}
                alt="Profile"
                className="w-36 h-36 rounded-full object-cover border-4 border-white/40 shadow-lg"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {/* Datos personales */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2 pb-1 border-b border-white/30">Datos personales</h2>
            <div className="flex flex-col gap-2 text-sm opacity-90">
            {(personalInfo?.firstName || personalInfo?.lastName) && (
              <div className="flex items-start gap-2">
                <User className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-80" />
                <span>{[personalInfo.firstName, personalInfo.lastName].filter(Boolean).join(" ")}</span>
              </div>
            )}
            {personalInfo?.email && (
              <div className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-80" />
                <span className="break-all">{personalInfo.email}</span>
              </div>
            )}
            {personalInfo?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 shrink-0 opacity-80" />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {(personalInfo?.address || personalInfo?.locality || personalInfo?.city || personalInfo?.country) && (
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-80" />
                <span>{[personalInfo.address, personalInfo.locality, personalInfo.city, personalInfo.country].filter(Boolean).join(", ")}</span>
              </div>
            )}
            {personalInfo?.birthDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 shrink-0 opacity-80" />
                <span>{formatBirthDate(personalInfo.birthDate)}</span>
              </div>
            )}
            {personalInfo?.nationality && (
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 shrink-0 opacity-80" />
                <span>{personalInfo.nationality}</span>
              </div>
            )}
            {personalInfo?.maritalStatus && (
              <div className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 shrink-0 opacity-80" />
                <span>{personalInfo.maritalStatus}</span>
              </div>
            )}
            {personalInfo?.idNumber && (
              <div className="flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 shrink-0 opacity-80" />
                <span>C.I: {personalInfo.idNumber}</span>
              </div>
            )}
            {personalInfo?.linkedin && (
              <div className="flex items-center gap-2">
                <Link className="w-3.5 h-3.5 shrink-0 opacity-80" />
                <span className="break-all">{personalInfo.linkedin}</span>
              </div>
            )}
            {personalInfo?.website && (
              <div className="flex items-center gap-2">
                <Link className="w-3.5 h-3.5 shrink-0 opacity-80" />
                <span className="break-all">{personalInfo.website}</span>
              </div>
            )}
            </div>
          </div>

          {skills && skills.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold uppercase tracking-wider mb-3 border-b border-white/20 pb-1">Habilidades</h2>
              <div className="flex flex-col gap-3">
                {skills.map((skill) => (
                  <div key={skill.id}>
                    <div className="flex justify-between mb-1 text-xs">
                      <span>{skill.name}</span>
                    </div>
                    <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-white h-full" style={{ width: `${skill.level}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {languages && languages.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold uppercase tracking-wider mb-3 border-b border-white/20 pb-1">Idiomas</h2>
              <div className="flex flex-col gap-1.5">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between text-sm">
                    <span>{lang.language}</span>
                    <span className="opacity-75">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {courses && courses.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold uppercase tracking-wider mb-3 border-b border-white/20 pb-1">Form. Complementaria</h2>
              <div className="flex flex-col gap-2.5">
                {courses.map((course) => (
                  <div key={course.id}>
                    <div className="font-semibold text-sm leading-tight">{course.name}</div>
                    <div className="text-[11px] opacity-60 uppercase tracking-wide mb-0.5">{course.modality}</div>
                    {course.description && (
                      <div className="text-xs opacity-75 leading-snug">{renderDescription(course.description)}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Content */}
      <div className="w-[68%] p-8 bg-white">
        {personalInfo?.summary && (
          <div className="mb-6">
            <h2 className="text-xl font-bold uppercase tracking-wider pb-2 mb-3 border-b border-gray-200" style={{ color: accentColor }}>Perfil</h2>
            <div>
              {renderDescription(personalInfo.summary)}
            </div>
          </div>
        )}

        {education && education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold uppercase tracking-wider pb-2 mb-4 border-b border-gray-200" style={{ color: accentColor }}>Formación</h2>
            <div className="flex flex-col gap-3">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-[15px]">{edu.degree} {edu.fieldOfStudy && `en ${edu.fieldOfStudy}`}</h3>
                    <span className="text-gray-500 text-sm whitespace-nowrap ml-4">
                      {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                    </span>
                  </div>
                  <div className="font-medium mb-1 opacity-75">
                    {renderInline(edu.school)} {edu.city && `| ${edu.city}`}
                  </div>
                  {edu.description && (
                    <div className="opacity-80">
                      {renderDescription(edu.description)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {workExperience && workExperience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold uppercase tracking-wider pb-2 mb-4 border-b border-gray-200" style={{ color: accentColor }}>Experiencia</h2>
            <div className="flex flex-col gap-4">
              {workExperience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-[15px]">{exp.jobTitle}</h3>
                    <span className="text-gray-500 text-sm whitespace-nowrap ml-4">
                      {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                    </span>
                  </div>
                  <div className="font-medium mb-1 opacity-75">
                    {exp.employer} {exp.city && `| ${exp.city}`}
                  </div>
                  {exp.description && (
                    <div className="opacity-80">
                      {renderDescription(exp.description)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
