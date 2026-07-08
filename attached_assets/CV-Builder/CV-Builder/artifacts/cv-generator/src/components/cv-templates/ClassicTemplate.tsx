import { TemplateProps } from "./types";

export function ClassicTemplate({ data, accentColor }: TemplateProps) {
  const { personalInfo, workExperience, education, skills, languages } = data;

  return (
    <div className="w-full h-full bg-white text-gray-900 font-serif p-10 text-[14px] leading-relaxed">
      {/* Header */}
      <div className="border-b-4 pb-6 mb-6" style={{ borderColor: accentColor }}>
        {personalInfo?.photoUrl && (
          <div className="flex justify-center mb-4">
            <img
              src={personalInfo.photoUrl}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4"
              style={{ borderColor: accentColor }}
            />
          </div>
        )}
        <h1 className="text-4xl font-bold uppercase text-center mb-2 tracking-widest text-gray-900">
          {personalInfo?.firstName} {personalInfo?.lastName}
        </h1>
        <p className="text-lg text-center italic text-gray-600 mb-4">
          {personalInfo?.jobTitle}
        </p>
        
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-gray-700 font-sans">
          {personalInfo?.email && <span>{personalInfo.email}</span>}
          {personalInfo?.phone && <><span className="text-gray-300">•</span><span>{personalInfo.phone}</span></>}
          {(personalInfo?.locality || personalInfo?.city || personalInfo?.country) && (
            <><span className="text-gray-300">•</span><span>{[personalInfo.locality, personalInfo.city, personalInfo.country].filter(Boolean).join(", ")}</span></>
          )}
          {personalInfo?.birthDate && <><span className="text-gray-300">•</span><span>{personalInfo.birthDate}</span></>}
          {personalInfo?.nationality && <><span className="text-gray-300">•</span><span>{personalInfo.nationality}</span></>}
          {personalInfo?.maritalStatus && <><span className="text-gray-300">•</span><span>{personalInfo.maritalStatus}</span></>}
          {personalInfo?.idNumber && <><span className="text-gray-300">•</span><span>C.I: {personalInfo.idNumber}</span></>}
          {personalInfo?.linkedin && <><span className="text-gray-300">•</span><span>{personalInfo.linkedin}</span></>}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-6 font-sans">
        {personalInfo?.summary && (
          <div>
            <h2 className="text-lg font-bold uppercase tracking-widest border-b pb-1 mb-3" style={{ color: accentColor, borderColor: '#e5e7eb' }}>
              Resumen Profesional
            </h2>
            <p className="text-gray-700 text-justify font-serif">{personalInfo.summary}</p>
          </div>
        )}

        {education && education.length > 0 && (
          <div>
            <h2 className="text-lg font-bold uppercase tracking-widest border-b pb-1 mb-4" style={{ color: accentColor, borderColor: '#e5e7eb' }}>
              Educación
            </h2>
            <div className="flex flex-col gap-4">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-gray-900 text-base">{edu.degree} {edu.fieldOfStudy && `en ${edu.fieldOfStudy}`}</h3>
                    <span className="text-gray-600 font-medium italic font-serif">
                      {edu.startDate} - {edu.current ? "Actual" : edu.endDate}
                    </span>
                  </div>
                  <div className="text-gray-800 font-medium mb-1 uppercase text-xs tracking-wider">
                    {edu.school} {edu.city && `• ${edu.city}`}
                  </div>
                  {edu.description && (
                    <p className="text-gray-700 whitespace-pre-wrap font-serif">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {workExperience && workExperience.length > 0 && (
          <div>
            <h2 className="text-lg font-bold uppercase tracking-widest border-b pb-1 mb-4" style={{ color: accentColor, borderColor: '#e5e7eb' }}>
              Experiencia
            </h2>
            <div className="flex flex-col gap-5">
              {workExperience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-gray-900 text-base">{exp.jobTitle}</h3>
                    <span className="text-gray-600 font-medium italic font-serif">
                      {exp.startDate} - {exp.current ? "Actual" : exp.endDate}
                    </span>
                  </div>
                  <div className="text-gray-800 font-medium mb-2 uppercase text-xs tracking-wider">
                    {exp.employer} {exp.city && `• ${exp.city}`}
                  </div>
                  {exp.description && (
                    <p className="text-gray-700 whitespace-pre-wrap font-serif">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-row gap-8">
          {skills && skills.length > 0 && (
            <div className="flex-1">
              <h2 className="text-lg font-bold uppercase tracking-widest border-b pb-1 mb-3" style={{ color: accentColor, borderColor: '#e5e7eb' }}>
                Habilidades
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {skills.map((skill) => (
                  <div key={skill.id} className="text-gray-800 font-serif">
                    • {skill.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {languages && languages.length > 0 && (
            <div className="flex-1">
              <h2 className="text-lg font-bold uppercase tracking-widest border-b pb-1 mb-3" style={{ color: accentColor, borderColor: '#e5e7eb' }}>
                Idiomas
              </h2>
              <div className="flex flex-col gap-1 text-gray-800 font-serif">
                {languages.map((lang) => (
                  <div key={lang.id}>
                    <strong>{lang.language}:</strong> {lang.proficiency}
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
