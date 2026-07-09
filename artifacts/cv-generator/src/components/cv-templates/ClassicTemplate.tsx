import { TemplateProps } from "./types";
import { renderDescription } from "./render-description";

export function ClassicTemplate({ data, accentColor }: TemplateProps) {
  const { personalInfo, workExperience, education, skills, languages, courses } = data;

  return (
    <div className="w-full bg-white font-serif p-10 text-[14px] leading-relaxed text-gray-800">
      {/* Header */}
      <div className="border-b-4 pb-5 mb-5" style={{ borderColor: accentColor }}>
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
        <h1 className="text-4xl font-bold uppercase text-center mb-2 tracking-widest">
          {personalInfo?.firstName} {personalInfo?.lastName}
        </h1>
        <p className="text-lg text-center italic opacity-60 mb-3">
          {personalInfo?.jobTitle}
        </p>

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-sans opacity-75">
          {personalInfo?.email && <span>{personalInfo.email}</span>}
          {personalInfo?.phone && <><span className="opacity-40">•</span><span>{personalInfo.phone}</span></>}
          {(personalInfo?.locality || personalInfo?.city || personalInfo?.country) && (
            <><span className="opacity-40">•</span><span>{[personalInfo.locality, personalInfo.city, personalInfo.country].filter(Boolean).join(", ")}</span></>
          )}
          {personalInfo?.birthDate && <><span className="opacity-40">•</span><span>{personalInfo.birthDate}</span></>}
          {personalInfo?.nationality && <><span className="opacity-40">•</span><span>{personalInfo.nationality}</span></>}
          {personalInfo?.maritalStatus && <><span className="opacity-40">•</span><span>{personalInfo.maritalStatus}</span></>}
          {personalInfo?.idNumber && <><span className="opacity-40">•</span><span>C.I: {personalInfo.idNumber}</span></>}
          {personalInfo?.linkedin && <><span className="opacity-40">•</span><span>{personalInfo.linkedin}</span></>}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-5 font-sans">
        {personalInfo?.summary && (
          <div>
            <h2 className="text-lg font-bold uppercase tracking-widest border-b pb-1 mb-3" style={{ color: accentColor, borderColor: '#e5e7eb' }}>
              Resumen Profesional
            </h2>
            <div className="opacity-80 font-serif">
              {renderDescription(personalInfo.summary)}
            </div>
          </div>
        )}

        {education && education.length > 0 && (
          <div>
            <h2 className="text-lg font-bold uppercase tracking-widest border-b pb-1 mb-3" style={{ color: accentColor, borderColor: '#e5e7eb' }}>
              Educación
            </h2>
            <div className="flex flex-col gap-3">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-[15px]">{edu.degree} {edu.fieldOfStudy && `en ${edu.fieldOfStudy}`}</h3>
                    <span className="opacity-60 font-medium italic font-serif">
                      {edu.startDate} - {edu.current ? "Actual" : edu.endDate}
                    </span>
                  </div>
                  <div className="font-medium mb-1 uppercase text-xs tracking-wider opacity-60">
                    {edu.school} {edu.city && `• ${edu.city}`}
                  </div>
                  {edu.description && (
                    <div className="opacity-75 font-serif">
                      {renderDescription(edu.description)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {workExperience && workExperience.length > 0 && (
          <div>
            <h2 className="text-lg font-bold uppercase tracking-widest border-b pb-1 mb-3" style={{ color: accentColor, borderColor: '#e5e7eb' }}>
              Experiencia
            </h2>
            <div className="flex flex-col gap-4">
              {workExperience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-[15px]">{exp.jobTitle}</h3>
                    <span className="opacity-60 font-medium italic font-serif">
                      {exp.startDate} - {exp.current ? "Actual" : exp.endDate}
                    </span>
                  </div>
                  <div className="font-medium mb-1 uppercase text-xs tracking-wider opacity-60">
                    {exp.employer} {exp.city && `• ${exp.city}`}
                  </div>
                  {exp.description && (
                    <div className="opacity-75 font-serif">
                      {renderDescription(exp.description)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {courses && courses.length > 0 && (
          <div className="mb-5">
            <h2 className="text-lg font-bold uppercase tracking-widest border-b pb-1 mb-3" style={{ color: accentColor, borderColor: '#e5e7eb' }}>
              Formación Complementaria
            </h2>
            <div className="flex flex-col gap-2">
              {courses.map((course) => (
                <div key={course.id}>
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold">{course.name}</span>
                    <span className="opacity-50">·</span>
                    <span className="italic opacity-60 text-sm">{course.modality}</span>
                  </div>
                  {course.description && (
                    <div className="opacity-70 text-sm">{renderDescription(course.description)}</div>
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
                  <div key={skill.id} className="opacity-80 font-serif">
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
              <div className="flex flex-col gap-1 opacity-80 font-serif">
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
