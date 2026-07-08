import { useState } from "react";
import { useListResumes, useDeleteResume, getListResumesQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeCard, ResumeCardSkeleton } from "@/components/ResumeCard";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { data: resumes, isLoading } = useListResumes();
  const deleteResume = useDeleteResume();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = () => {
    if (!deleteId) return;
    
    deleteResume.mutate(
      { id: deleteId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListResumesQueryKey() });
          toast({
            title: "CV eliminado",
            description: "Tu CV ha sido eliminado permanentemente.",
          });
          setDeleteId(null);
        },
        onError: () => {
          toast({
            title: "Error",
            description: "No se pudo eliminar el CV. Inténtalo de nuevo.",
            variant: "destructive",
          });
          setDeleteId(null);
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-md flex items-center justify-center font-serif font-bold text-lg">
              C
            </div>
            <h1 className="text-xl font-bold tracking-tight">CVCraft</h1>
          </div>
          
          <Link href="/templates">
            <Button data-testid="button-new-resume" className="rounded-full shadow-sm hover-elevate">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo CV
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-semibold text-foreground tracking-tight">Tus CVs</h2>
          <p className="text-muted-foreground mt-1">Gestiona y edita tus CVs profesionales.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <ResumeCardSkeleton key={i} />
            ))}
          </div>
        ) : resumes && resumes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {resumes.map((resume) => (
              <ResumeCard 
                key={resume.id} 
                resume={resume} 
                onDelete={(id) => setDeleteId(id)} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
            <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
              <FileText className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold font-serif mb-2">Aún no tienes CVs</h3>
            <p className="text-muted-foreground mb-8">
              Crea tu primer CV profesional para empezar a postularte. CVCraft te ayuda a construir un CV destacado en minutos.
            </p>
            <Link href="/templates">
              <Button size="lg" className="rounded-full h-12 px-8" data-testid="button-create-first">
                Crear mi primer CV
              </Button>
            </Link>
          </div>
        )}
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Tu CV será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteResume.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
