'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Package, TrendingUp, AlertCircle, BarChart3, Upload, Clock } from 'lucide-react';

import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { reportService } from '@/services/report.service';
import { DashboardStats } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await reportService.getDashboardStats();
      setStats(data);
    } catch (error: any) {
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  const hasData = stats && stats.total_catalogs > 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Visão geral da sua análise de produtos
            </p>
          </div>
          <Button onClick={() => router.push('/catalogs/upload')}>
            <Upload className="w-4 h-4 mr-2" />
            Novo Catálogo
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Catálogos
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.total_catalogs || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {hasData ? 'Catálogos analisados' : 'Nenhum catálogo ainda'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Produtos Analisados
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.total_products || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {hasData ? 'Total processados' : 'Aguardando primeiro upload'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Oportunidades
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.opportunities || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {hasData ? 'Produtos recomendados' : 'Sem dados'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Margem Média
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {hasData ? `${stats.average_margin.toFixed(1)}%` : '--%'}
              </div>
              <p className="text-xs text-muted-foreground">
                {hasData ? 'Média geral' : 'Sem dados disponíveis'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Catalogs or Welcome */}
        {hasData ? (
          <>
            {/* Active Analyses */}
            {stats.active_analyses > 0 && (
              <Card className="border-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Análises em Andamento</CardTitle>
                    <Badge variant="default">{stats.active_analyses} ativa(s)</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    Você tem análises em processamento. Acompanhe o progresso em tempo real.
                  </p>
                  <Button variant="outline" onClick={() => router.push('/catalogs')}>
                    Ver Análises
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Recent Catalogs */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Catálogos Recentes</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/catalogs')}
                  >
                    Ver Todos
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {stats.recent_catalogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum catálogo recente
                  </p>
                ) : (
                  <div className="space-y-4">
                    {stats.recent_catalogs.map((catalog) => (
                      <div
                        key={catalog.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                        onClick={() => router.push(`/catalogs/${catalog.id}`)}
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold">{catalog.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {catalog.total_products} produtos •{' '}
                            {catalog.products_analyzed} analisados
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {catalog.status === 'completed' ? (
                            <Badge variant="outline">Concluído</Badge>
                          ) : catalog.status === 'analyzing' ? (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary animate-pulse" />
                              <span className="text-sm">
                                {catalog.progress_percentage}%
                              </span>
                            </div>
                          ) : (
                            <Badge variant="secondary">{catalog.status}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push('/products')}>
                <CardContent className="pt-6">
                  <Package className="w-8 h-8 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">Ver Produtos</h3>
                  <p className="text-sm text-muted-foreground">
                    Explore todos os produtos analisados
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push('/reports')}>
                <CardContent className="pt-6">
                  <BarChart3 className="w-8 h-8 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">Relatórios</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualize gráficos e estatísticas
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push('/link-analyzer')}>
                <CardContent className="pt-6">
                  <TrendingUp className="w-8 h-8 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">Analisar Links</h3>
                  <p className="text-sm text-muted-foreground">
                    Análise rápida de produtos do ML
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          // Welcome Card for new users
          <Card>
            <CardHeader>
              <CardTitle>Bem-vindo ao CatalogAI! 🎉</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Você está a poucos passos de descobrir produtos lucrativos para vender no Mercado Livre.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold">Próximos passos:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Faça upload do seu primeiro catálogo (PDF, CSV ou XLSX)</li>
                  <li>Configure os parâmetros de análise (impostos, custos extras)</li>
                  <li>Aguarde o processamento automático</li>
                  <li>Analise os resultados e recomendações da IA</li>
                  <li>Exporte os produtos mais promissores</li>
                </ol>
              </div>
              <Button onClick={() => router.push('/catalogs/upload')} className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Começar Agora
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}