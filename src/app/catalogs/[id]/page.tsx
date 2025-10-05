'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Play,
  Pause,
  XCircle,
  RefreshCw,
  Package,
  AlertCircle,
  Info,
  AlertTriangle,
} from 'lucide-react';

import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { catalogService } from '@/services/catalog.service';
import { Catalog, CatalogLog } from '@/types';

const logLevelConfig = {
  info: { icon: Info, color: 'text-blue-500' },
  warning: { icon: AlertTriangle, color: 'text-yellow-500' },
  error: { icon: AlertCircle, color: 'text-red-500' },
};

export default function CatalogDetailPage() {
  const router = useRouter();
  const params = useParams();
  const catalogId = params.id as string;

  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [logs, setLogs] = useState<CatalogLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCatalog = async () => {
    try {
      const data = await catalogService.getCatalog(catalogId);
      setCatalog(data);
    } catch (error: any) {
      toast.error('Erro ao carregar catálogo');
    }
  };

  const loadLogs = async () => {
    try {
      const data = await catalogService.getLogs(catalogId);
      setLogs(data);
    } catch (error: any) {
      console.error('Erro ao carregar logs');
    }
  };

  const loadData = async () => {
    await Promise.all([loadCatalog(), loadLogs()]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [catalogId]);

  // Polling a cada 5 segundos se estiver processando
  useEffect(() => {
    if (!catalog) return;

    const isProcessing =
      catalog.status === 'pending' ||
      catalog.status === 'extracting' ||
      catalog.status === 'analyzing';

    if (!isProcessing) return;

    const interval = setInterval(() => {
      loadData();
    }, 5000);

    return () => clearInterval(interval);
  }, [catalog?.status]);

  const handlePause = async () => {
    try {
      await catalogService.pauseAnalysis(catalogId);
      toast.success('Análise pausada');
      loadCatalog();
    } catch (error: any) {
      toast.error('Erro ao pausar análise');
    }
  };

  const handleResume = async () => {
    try {
      await catalogService.resumeAnalysis(catalogId);
      toast.success('Análise retomada');
      loadCatalog();
    } catch (error: any) {
      toast.error('Erro ao retomar análise');
    }
  };

  const handleCancel = async () => {
    if (!confirm('Tem certeza que deseja cancelar esta análise?')) return;

    try {
      await catalogService.cancelAnalysis(catalogId);
      toast.success('Análise cancelada');
      loadCatalog();
    } catch (error: any) {
      toast.error('Erro ao cancelar análise');
    }
  };

  const handleReanalyze = async () => {
    if (!confirm('Tem certeza que deseja reanalisar este catálogo?')) return;

    try {
      await catalogService.reanalyze(catalogId);
      toast.success('Reanálise iniciada');
      loadCatalog();
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

  if (!catalog) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Catálogo não encontrado</h2>
          <Button className="mt-4" onClick={() => router.push('/catalogs')}>
            Voltar para Catálogos
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/catalogs')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{catalog.name}</h1>
              <p className="text-muted-foreground mt-1">{catalog.file_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {catalog.status === 'analyzing' && (
              <Button variant="outline" onClick={handlePause}>
                <Pause className="w-4 h-4 mr-2" />
                Pausar
              </Button>
            )}
            {catalog.status === 'paused' && (
              <Button onClick={handleResume}>
                <Play className="w-4 h-4 mr-2" />
                Retomar
              </Button>
            )}
            {(catalog.status === 'analyzing' || catalog.status === 'paused') && (
              <Button variant="destructive" onClick={handleCancel}>
                <XCircle className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            )}
            {catalog.status === 'completed' && (
              <Button variant="outline" onClick={handleReanalyze}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reanalisar
              </Button>
            )}
            {catalog.status === 'completed' && (
              <Button onClick={() => router.push(`/products?catalog=${catalogId}`)}>
                <Package className="w-4 h-4 mr-2" />
                Ver Produtos
              </Button>
            )}
          </div>
        </div>

        {/* Progress Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Progresso da Análise</CardTitle>
              <Badge>{catalog.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso Geral</span>
                <span className="font-medium">{catalog.progress_percentage}%</span>
              </div>
              <Progress value={catalog.progress_percentage} />
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total de Produtos</p>
                <p className="text-3xl font-bold">{catalog.total_products}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Extraídos</p>
                <p className="text-3xl font-bold">{catalog.products_extracted}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Analisados</p>
                <p className="text-3xl font-bold">{catalog.products_analyzed}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Taxa de Impostos</p>
                <p className="font-medium">{catalog.tax_rate}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Custos Extras</p>
                <p className="font-medium">
                  R$ {catalog.extra_costs.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Criado em</p>
                <p className="font-medium">
                  {format(new Date(catalog.created_at), 'dd/MM/yyyy HH:mm', {
                    locale: ptBR,
                  })}
                </p>
              </div>
              {catalog.completed_at && (
                <div>
                  <p className="text-muted-foreground">Concluído em</p>
                  <p className="font-medium">
                    {format(new Date(catalog.completed_at), 'dd/MM/yyyy HH:mm', {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Logs Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum evento registrado ainda
              </p>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => {
                  const LogIcon = logLevelConfig[log.level].icon;
                  const iconColor = logLevelConfig[log.level].color;

                  return (
                    <div key={log.id} className="flex gap-3">
                      <LogIcon className={`w-5 h-5 mt-0.5 ${iconColor}`} />
                      <div className="flex-1">
                        <p className="text-sm">{log.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss', {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}