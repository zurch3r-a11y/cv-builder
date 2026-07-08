import { TemplateProps } from "./types";

export function MinimalTemplate({ data, accentColor }: TemplateProps) {
  const { personalInfo, workExperience, education, skills, languages } = data;

  return (
    <div className="w-full h-full bg-white text-gray-800 font-sans p-12 text-[13px] leading-relaxed">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-6 mb-4">
          {personalInfo?.photoUrl && (
            <img
              src={personalInfo.photoUrl}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border border-gray-200 shrink-0"
            />
          )}
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-gray-900 mb-1">
              {personalInfo?.firstName} <span style={{ color: accentColor }}>{personalInfo?.lastName}</span>
            </h1>
            <p className="text-gray-500 text-sm tracking-wide uppercase">
              {personalInfo?.jobTitle}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
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

      <div className="flex flex-col gap-8">
        {personalInfo?.summary && (
          <div className="grid grid-cols-[120px_1fr] gap-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mt-1">Perfil</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{personalInfo.summary}</p>
          </div>
        )}

        {education && education.length > 0 && (
          <div className="grid grid-cols-[120px_1fr] gap-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mt-1">Educación</h2>
            <div className="flex flex-col gap-6">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-medium text-gray-900 text-base">{edu.degree} {edu.fieldOfStudy && `en ${edu.fieldOfStudy}`}</h3>
                    <span className="text-gray-400 text-xs">
                      {edu.startDate} - {edu.current ? "Actual" : edu.endDate}
                    </span>
                  </div>
                  <div className="text-gray-500 mb-2">
                    {edu.school} {edu.city && `, ${edu.city}`}
                  </div>
                  {edu.description && (
                    <p className="text-gray-600 whitespace-pre-wrap">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {workExperience && workExperience.length > 0 && (
          <div className="grid grid-cols-[120px_1fr] gap-4 border-t border-gray-100 pt-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mt-1">Experiencia</h2>
            <div className="flex flex-col gap-6">
              {workExperience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-medium text-gray-900 text-base">{exp.jobTitle}</h3>
                    <span className="text-gray-400 text-xs">
                      {exp.startDate} - {exp.current ? "Actual" : exp.endDate}
                    </span>
                  </div>
                  <div className="text-gray-500 mb-2">
                    {exp.employer} {exp.city && `, ${exp.city}`}
                  </div>
                  {exp.description && (
                    <p className="text-gray-600 whitespace-pre-wrap">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-[120px_1fr] gap-4 border-t border-gray-100 pt-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mt-1">Habilidades</h2>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {skills?.map((skill) => (
              <span key={skill.id} className="text-gray-700">{skill.name}</span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
