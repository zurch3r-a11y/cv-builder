import React, { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Upload, X, Crop } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PhotoCropDialog } from "./PhotoCropDialog";
import { RichTextEditor } from "./RichTextEditor";

export function PersonalInfoSection({ data, onChange }: { data: any, onChange: (d: any) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const raw = ev.target?.result as string;
      setCropSrc(raw);
      setCropOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropApply = (cropped: string) => {
    onChange({ ...data, photoUrl: cropped });
    setCropOpen(false);
    setCropSrc(null);
  };

  const handleAdjust = () => {
    setCropSrc(data.photoUrl);
    setCropOpen(true);
  };

  const handleRemovePhoto = () => {
    onChange({ ...data, photoUrl: null });
    setCropSrc(null);
  };

  return (
    <>
      <PhotoCropDialog
        src={cropSrc ?? ''}
        open={cropOpen}
        onClose={() => setCropOpen(false)}
        onApply={handleCropApply}
      />
    <div className="grid grid-cols-2 gap-4">
      {/* Photo upload */}
      <div className="col-span-2 space-y-2">
        <Label>Foto de perfil</Label>
        <div className="flex items-center gap-4">
          {data?.photoUrl ? (
            <div className="relative shrink-0">
              <img
                src={data.photoUrl}
                alt="Foto de perfil"
                className="w-20 h-20 rounded-full object-cover border-2 border-border"
              />
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute -top-1 -right-1 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-destructive/80 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center shrink-0">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              {data?.photoUrl ? "Cambiar foto" : "Subir foto"}
            </Button>
            {data?.photoUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAdjust}
                className="text-muted-foreground hover:text-foreground"
              >
                <Crop className="w-3.5 h-3.5 mr-1.5" />
                Ajustar / Recortar
              </Button>
            )}
            <p className="text-[11px] text-muted-foreground">JPG, PNG o WebP.</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Nombre</Label>
        <Input name="firstName" value={data?.firstName || ''} onChange={handleChange} />
      </div>
      <div className="space-y-2">
        <Label>Apellido</Label>
        <Input name="lastName" value={data?.lastName || ''} onChange={handleChange} />
      </div>
      <div className="col-span-2 space-y-2">
        <Label>Título profesional</Label>
        <Input name="jobTitle" value={data?.jobTitle || ''} onChange={handleChange} />
      </div>
      <div className="space-y-2">
        <Label>Correo electrónico</Label>
        <Input name="email" type="email" value={data?.email || ''} onChange={handleChange} />
      </div>
      <div className="space-y-2">
        <Label>Teléfono</Label>
        <Input name="phone" value={data?.phone || ''} onChange={handleChange} />
      </div>
      <div className="col-span-2 space-y-2">
        <Label>Dirección</Label>
        <Input name="address" value={data?.address || ''} onChange={handleChange} />
      </div>
      <div className="space-y-2">
        <Label>Código postal</Label>
        <Input name="postalCode" value={data?.postalCode || ''} onChange={handleChange} />
      </div>
      <div className="space-y-2">
        <Label>Localidad</Label>
        <Input name="locality" value={data?.locality || ''} onChange={handleChange} />
      </div>
      <div className="space-y-2">
        <Label>Ciudad</Label>
        <Input name="city" value={data?.city || ''} onChange={handleChange} />
      </div>
      <div className="space-y-2">
        <Label>País</Label>
        <Input name="country" value={data?.country || ''} onChange={handleChange} />
      </div>
      <div className="space-y-2">
        <Label>Fecha de nacimiento</Label>
        <Input name="birthDate" type="date" value={data?.birthDate || ''} onChange={handleChange} />
      </div>
      <div className="space-y-2">
        <Label>Nacionalidad</Label>
        <Input name="nationality" value={data?.nationality || ''} onChange={handleChange} />
      </div>
      <div className="space-y-2">
        <Label>Estado civil</Label>
        <Input name="maritalStatus" value={data?.maritalStatus || ''} onChange={handleChange} />
      </div>
      <div className="space-y-2">
        <Label>C.I / Identificación</Label>
        <Input name="idNumber" value={data?.idNumber || ''} onChange={handleChange} />
      </div>
      <div className="space-y-2">
        <Label>LinkedIn</Label>
        <Input name="linkedin" value={data?.linkedin || ''} onChange={handleChange} />
      </div>
      <div className="space-y-2">
        <Label>Sitio web</Label>
        <Input name="website" value={data?.website || ''} onChange={handleChange} />
      </div>
      <div className="col-span-2 space-y-2">
        <Label>Resumen profesional</Label>
        <RichTextEditor
          value={data?.summary || ''}
          onChange={(val) => onChange({ ...data, summary: val })}
          placeholder="Escribe tu resumen profesional..."
          minHeight="96px"
        />
      </div>
    </div>
    </>
  );
}

export function WorkExperienceSection({ data, onChange }: { data: any[], onChange: (d: any[]) => void }) {
  const handleAdd = () => {
    onChange([...data, { id: crypto.randomUUID(), jobTitle: '', employer: '', startDate: '', endDate: '', current: false, city: '', description: '' }]);
  };

  const handleUpdate = (id: string, field: string, value: any) => {
    onChange(data.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleDelete = (id: string) => {
    onChange(data.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6">
      {data.map((item) => (
        <div key={item.id} className="p-4 border rounded-md bg-gray-50/50 relative group">
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-white border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => handleDelete(item.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">Cargo</Label>
              <Input value={item.jobTitle} onChange={e => handleUpdate(item.id, 'jobTitle', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Empresa</Label>
              <Input value={item.employer} onChange={e => handleUpdate(item.id, 'employer', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Ciudad</Label>
              <Input value={item.city || ''} onChange={e => handleUpdate(item.id, 'city', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Fecha inicio</Label>
              <Input value={item.startDate} placeholder="ej. Ene 2022" onChange={e => handleUpdate(item.id, 'startDate', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Fecha fin</Label>
              <Input
                value={item.endDate || ''}
                placeholder="ej. Actual"
                disabled={item.current}
                onChange={e => handleUpdate(item.id, 'endDate', e.target.value)}
              />
              <div className="flex items-center gap-2 mt-2">
                <Switch
                  id={`current-${item.id}`}
                  checked={item.current}
                  onCheckedChange={(checked) => handleUpdate(item.id, 'current', checked)}
                />
                <Label htmlFor={`current-${item.id}`} className="text-[10px] uppercase font-semibold text-gray-500 cursor-pointer">Trabajo aquí actualmente</Label>
              </div>
            </div>
            <div className="col-span-2 space-y-1.5 mt-2">
              <Label className="text-xs">Descripción</Label>
              <RichTextEditor
                value={item.description || ''}
                onChange={(val) => handleUpdate(item.id, 'description', val)}
                placeholder="Describe tus logros y responsabilidades..."
                minHeight="96px"
              />
            </div>
          </div>
        </div>
      ))}
      <Button variant="outline" className="w-full border-dashed" onClick={handleAdd}>
        <Plus className="mr-2 h-4 w-4" /> Agregar experiencia
      </Button>
    </div>
  );
}

export function EducationSection({ data, onChange }: { data: any[], onChange: (d: any[]) => void }) {
  const handleAdd = () => {
    onChange([...data, { id: crypto.randomUUID(), school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', current: false, city: '', description: '' }]);
  };

  const handleUpdate = (id: string, field: string, value: any) => {
    onChange(data.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleDelete = (id: string) => {
    onChange(data.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6">
      {data.map((item) => (
        <div key={item.id} className="p-4 border rounded-md bg-gray-50/50 relative group">
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-white border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => handleDelete(item.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">Escuela / Universidad</Label>
              <Input value={item.school} onChange={e => handleUpdate(item.id, 'school', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Título</Label>
              <Input value={item.degree} placeholder="ej. Licenciatura" onChange={e => handleUpdate(item.id, 'degree', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Campo de estudio</Label>
              <Input value={item.fieldOfStudy || ''} onChange={e => handleUpdate(item.id, 'fieldOfStudy', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Fecha inicio</Label>
              <Input value={item.startDate} placeholder="ej. Sep 2018" onChange={e => handleUpdate(item.id, 'startDate', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Fecha fin</Label>
              <Input
                value={item.endDate || ''}
                disabled={item.current}
                onChange={e => handleUpdate(item.id, 'endDate', e.target.value)}
              />
              <div className="flex items-center gap-2 mt-2">
                <Switch
                  id={`edu-current-${item.id}`}
                  checked={item.current}
                  onCheckedChange={(checked) => handleUpdate(item.id, 'current', checked)}
                />
                <Label htmlFor={`edu-current-${item.id}`} className="text-[10px] uppercase font-semibold text-gray-500 cursor-pointer">Estudio aquí actualmente</Label>
              </div>
            </div>
            <div className="col-span-2 space-y-1.5 mt-2">
              <Label className="text-xs">Descripción (opcional)</Label>
              <RichTextEditor
                value={item.description || ''}
                onChange={(val) => handleUpdate(item.id, 'description', val)}
                placeholder="Descripción adicional..."
                minHeight="64px"
              />
            </div>
          </div>
        </div>
      ))}
      <Button variant="outline" className="w-full border-dashed" onClick={handleAdd}>
        <Plus className="mr-2 h-4 w-4" /> Agregar educación
      </Button>
    </div>
  );
}

export function SkillsSection({ data, onChange }: { data: any[], onChange: (d: any[]) => void }) {
  const handleAdd = () => {
    onChange([...data, { id: crypto.randomUUID(), name: '', level: 50 }]);
  };

  const handleUpdate = (id: string, field: string, value: any) => {
    onChange(data.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleDelete = (id: string) => {
    onChange(data.filter(item => item.id !== id));
  };

  const getSkillLabel = (level: number) => {
    if (level < 25) return "Principiante";
    if (level < 50) return "Intermedio";
    if (level < 75) return "Avanzado";
    return "Experto";
  };

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.id} className="flex items-start gap-4 p-3 border rounded-md bg-gray-50/50">
          <div className="flex-1 space-y-3">
            <Input
              value={item.name}
              placeholder="Habilidad (ej. React, Diseño)"
              onChange={e => handleUpdate(item.id, 'name', e.target.value)}
              className="h-8 text-sm"
            />
            <div className="px-1">
              <div className="flex justify-between text-[10px] font-semibold uppercase text-gray-500 mb-2">
                <span>Nivel</span>
                <span className="text-primary">{getSkillLabel(item.level)}</span>
              </div>
              <Slider
                value={[item.level]}
                max={100}
                step={5}
                onValueChange={(vals) => handleUpdate(item.id, 'level', vals[0])}
              />
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" onClick={() => handleDelete(item.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" className="w-full border-dashed" onClick={handleAdd}>
        <Plus className="mr-2 h-4 w-4" /> Agregar habilidad
      </Button>
    </div>
  );
}

export function LanguagesSection({ data, onChange }: { data: any[], onChange: (d: any[]) => void }) {
  const handleAdd = () => {
    onChange([...data, { id: crypto.randomUUID(), language: '', proficiency: 'Básico' }]);
  };

  const handleUpdate = (id: string, field: string, value: any) => {
    onChange(data.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleDelete = (id: string) => {
    onChange(data.filter(item => item.id !== id));
  };

  const proficiencies = ["Básico", "Intermedio", "Avanzado", "Fluido", "Nativo"];

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.id} className="flex gap-2 items-center">
          <Input
            value={item.language}
            placeholder="Idioma (ej. Francés)"
            onChange={e => handleUpdate(item.id, 'language', e.target.value)}
            className="flex-1"
          />
          <Select value={item.proficiency} onValueChange={(val) => handleUpdate(item.id, 'proficiency', val)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {proficiencies.map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0" onClick={() => handleDelete(item.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" className="w-full border-dashed mt-2" onClick={handleAdd}>
        <Plus className="mr-2 h-4 w-4" /> Agregar idioma
      </Button>
    </div>
  );
}
