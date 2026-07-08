import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { FileText, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ResumeSummary } from "@workspace/api-client-react";

interface ResumeCardProps {
  resume: ResumeSummary;
  onDelete: (id: number) => void;
}

export function ResumeCard({ resume, onDelete }: ResumeCardProps) {
  const name = [resume.firstName, resume.lastName].filter(Boolean).join(" ");
  
  return (
    <Card className="flex flex-col hover-elevate overflow-hidden border transition-all duration-200 hover:border-primary/20 hover:shadow-md">
      <CardHeader className="p-0 border-b border-border/50 h-32 relative group" style={{ backgroundColor: `${resume.accentColor}15` }}>
        {/* Abstract design element based on accent color */}
        <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 rounded-full blur-2xl opacity-40" style={{ backgroundColor: resume.accentColor }} />
        
        <div className="p-5 relative z-10 flex justify-between items-start h-full">
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground line-clamp-1">{resume.title}</h3>
            <p className="text-sm text-muted-foreground capitalize tracking-wider mt-1">{resume.template}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/50 hover:bg-white/80 backdrop-blur-sm -mr-2">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/editor/${resume.id}`} className="cursor-pointer flex items-center w-full">
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Editar</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(resume.id)}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Eliminar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="p-5 flex-1 flex flex-col justify-center">
        {name ? (
          <p className="font-medium text-foreground">{name}</p>
        ) : (
          <p className="text-muted-foreground italic text-sm">Sin nombre</p>
        )}
        
        {resume.jobTitle && (
          <p className="text-sm text-muted-foreground mt-1">{resume.jobTitle}</p>
        )}
      </CardContent>
      
      <CardFooter className="p-5 pt-0 flex justify-between items-center text-xs text-muted-foreground">
        <span>Actualizado {format(new Date(resume.updatedAt), "d MMM yyyy")}</span>
        <Link href={`/editor/${resume.id}`}>
          <Button variant="outline" size="sm" className="h-8 rounded-full px-4 text-xs font-medium">
            Editar
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export function ResumeCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="p-0 h-32 bg-muted/50 border-b">
        <div className="p-5">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </CardHeader>
      <CardContent className="p-5 flex-1">
        <Skeleton className="h-5 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
      <CardFooter className="p-5 pt-0 justify-between">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </CardFooter>
    </Card>
  );
}
