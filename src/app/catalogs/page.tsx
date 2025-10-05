'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  FileText,
  Upload,
  MoreVertical,
  Eye,
  Trash2,
  RefreshCw,
  Play,
  Pause,
} from 'lucide-react';

import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { catalogService } from '@/services/catalog.service';
import { Catalog, CatalogStatus } from '@/types';

const statusConfig: Record<
  CatalogStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  pending: { label: 'Aguardando', variant: 'secondary' },
  extracting: { label: 'Extraindo', variant: 'default' },
  analyzing: { label: 'Analisando', variant: 'default' },
  completed: { label: 'Concluído', variant: 'outline' },
  paused: { label: 'Pausado', variant: 'secondary' },
  failed: { label: 'Erro', variant: 'destructive' },
};

export default function CatalogsPage() {
  const router = useRouter();
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCatalogs = async () => {
    try {
      const response = await catalogService.getCatalogs();
      setCatalogs(response.data);
    } catch (error: any) {
      toast.error('Erro ao carregar catálogos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este catálogo?')) return;

    try {
      await catalogService.deleteCatalog(id);
      toast.success('Catálogo deletado com sucesso');
      loadCatalogs();
    } catch (error: any) {
      toast.error('Erro ao deletar catálogo');
    }
  };

  const handlePause = async (id: string) => {
    try {
      await catalogService.pauseAnalysis(id);
      toast.success('Análise pausada');
      loadCatalogs();
    } catch (error: any) {
      toast.error('Erro ao pausar análise');
    }
  };

  const handleResume = async (id: string) => {
    try {
      await catalogService.resumeAnalysis(id);
      toast.success('Análise retomada');
      loadCatalogs();
    } catch (error: any) {
      toast.error('Erro ao retomar análise');
    }
  };

  const handleReanalyze = async (id: string) => {
    if (!confirm('Tem certeza que deseja reanalisar este catálogo?')) return;

    try {
      await catalogService.reanalyze(id);
      toast.success('Reanálise iniciada');
      loadCatalogs();
    } catch (error: any) {
      toast.error('Erro ao iniciar reanálise');
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Meus Catálogos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seus catálogos e análises
            </p>
          </div>
          <Button onClick={() => router.push('/catalogs/upload')}>
            <Upload className="w-4 h-4 mr-2" />
            Novo Catálogo
          </Button>
        </div>

        {/* Lista de Catálogos */}
        {catalogs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Nenhum catálogo encontrado
              </h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Comece fazendo upload do seu primeiro catálogo para análise
              </p>
              <Button onClick={() => router.push('/catalogs/upload')}>
                <Upload className="w-4 h-4 mr-2" />
                Upload de Catálogo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {catalogs.map((catalog) => (
              <Card key={catalog.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{catalog.name}</CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{catalog.file_name}</span>
                        <span>•</span>
                        <span className="uppercase">{catalog.file_type}</span>
                        <span>•</span>
                        <span>
                          {format(new Date(catalog.created_at), 'dd/MM/yyyy HH:mm', {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusConfig[catalog.status].variant}>
                        {statusConfig[catalog.status].label}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => router.push(`/catalogs/${catalog.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          {catalog.status === 'analyzing' && (
                            <DropdownMenuItem onClick={() => handlePause(catalog.id)}>
                              <Pause className="w-4 h-4 mr-2" />
                              Pausar
                            </DropdownMenuItem>
                          )}
                          {catalog.status === 'paused' && (
                            <DropdownMenuItem onClick={() => handleResume(catalog.id)}>
                              <Play className="w-4 h-4 mr-2" />
                              Retomar
                            </DropdownMenuItem>
                          )}
                          {catalog.status === 'completed' && (
                            <DropdownMenuItem
                              onClick={() => handleReanalyze(catalog.id)}
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Reanalisar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(catalog.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Deletar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Progress */}
                    {catalog.status !== 'completed' && catalog.status !== 'failed' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">
                            {catalog.progress_percentage}%
                          </span>
                        </div>
                        <Progress value={catalog.progress_percentage} />
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total de Produtos
                        </p>
                        <p className="text-2xl font-bold">{catalog.total_products}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Extraídos</p>
                        <p className="text-2xl font-bold">
                          {catalog.products_extracted}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Analisados</p>
                        <p className="text-2xl font-bold">
                          {catalog.products_analyzed}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}