'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Link2, Download, AlertCircle } from 'lucide-react';

import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import api from '@/lib/api';
import { LinkAnalysisResult } from '@/types';

const batchSchema = z.object({
  links: z.string().min(1, 'Adicione pelo menos um link'),
  cost: z.number().min(0, 'Custo deve ser positivo'),
  tax_rate: z.number().min(0).max(100),
  extra_costs: z.number().min(0),
});

type BatchFormData = z.infer<typeof batchSchema>;

const recommendationConfig = {
  buy: { label: 'Comprar', color: 'bg-green-500' },
  observe: { label: 'Observar', color: 'bg-yellow-500' },
  discard: { label: 'Descartar', color: 'bg-red-500' },
};

const competitionConfig = {
  low: { label: 'Baixa', variant: 'outline' as const },
  medium: { label: 'Média', variant: 'secondary' as const },
  high: { label: 'Alta', variant: 'destructive' as const },
};

export default function LinkAnalyzerPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<LinkAnalysisResult[]>([]);

  const batchForm = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      links: '',
      cost: 0,
      tax_rate: 0,
      extra_costs: 0,
    },
  });

  const onAnalyzeBatch = async (data: BatchFormData) => {
    setIsAnalyzing(true);
    setResults([]);

    try {
      const links = data.links.split('\n').filter((link) => link.trim());

      if (links.length === 0) {
        toast.error('Adicione pelo menos um link válido');
        return;
      }

      const response = await api.post('/link-analyzer/analyze', {
        links,
        cost: data.cost,
        tax_rate: data.tax_rate,
        extra_costs: data.extra_costs,
      });

      setResults(response.data.data);
      toast.success(`${links.length} produtos analisados!`);
    } catch (error: any) {
      toast.error('Erro ao analisar links');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExport = () => {
    if (results.length === 0) {
      toast.error('Nenhum resultado para exportar');
      return;
    }

    // Criar CSV
    const headers = [
      'Link',
      'Produto',
      'Custo',
      'Preço ML',
      'Preço Sugerido',
      'Margem %',
      'ROI %',
      'Concorrência',
      'Recomendação',
      'Justificativa',
    ].join(',');

    const rows = results.map((r) =>
      [
        r.link,
        `"${r.product_name}"`,
        r.cost,
        r.market_price,
        r.suggested_price,
        r.net_margin.toFixed(2),
        r.roi.toFixed(2),
        r.competition_level,
        r.recommendation,
        `"${r.ai_justification}"`,
      ].join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analise_links_${Date.now()}.csv`;
    a.click();

    toast.success('Resultados exportados!');
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Analisador de Links</h1>
          <p className="text-muted-foreground mt-1">
            Análise rápida de produtos direto do Mercado Livre
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Cole os links de produtos do Mercado Livre abaixo. A análise pode levar
            alguns minutos dependendo da quantidade de produtos.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="batch" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="batch">Modo Lote</TabsTrigger>
            <TabsTrigger value="individual">Modo Individual</TabsTrigger>
          </TabsList>

          {/* Batch Mode */}
          <TabsContent value="batch" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise em Lote</CardTitle>
                <CardDescription>
                  Todos os produtos terão o mesmo custo base
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={batchForm.handleSubmit(onAnalyzeBatch)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="links">Links do Mercado Livre</Label>
                    <textarea
                      id="links"
                      rows={8}
                      className="w-full px-3 py-2 text-sm border rounded-md resize-none"
                      placeholder="Cole os links aqui, um por linha&#10;https://produto.mercadolivre.com.br/...&#10;https://produto.mercadolivre.com.br/..."
                      disabled={isAnalyzing}
                      {...batchForm.register('links')}
                    />
                    {batchForm.formState.errors.links && (
                      <p className="text-sm text-destructive">
                        {batchForm.formState.errors.links.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cost">Custo do Produto (R$)</Label>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        disabled={isAnalyzing}
                        {...batchForm.register('cost', { valueAsNumber: true })}
                      />
                      {batchForm.formState.errors.cost && (
                        <p className="text-sm text-destructive">
                          {batchForm.formState.errors.cost.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tax_rate">Taxa de Impostos (%)</Label>
                      <Input
                        id="tax_rate"
                        type="number"
                        step="0.01"
                        disabled={isAnalyzing}
                        {...batchForm.register('tax_rate', { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="extra_costs">Custos Extras (R$)</Label>
                      <Input
                        id="extra_costs"
                        type="number"
                        step="0.01"
                        disabled={isAnalyzing}
                        {...batchForm.register('extra_costs', {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isAnalyzing} className="w-full">
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      <>
                        <Link2 className="mr-2 h-4 w-4" />
                        Analisar Produtos
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Individual Mode */}
          <TabsContent value="individual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise Individual</CardTitle>
                <CardDescription>
                  Defina o custo específico para cada produto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Funcionalidade em desenvolvimento. Por enquanto, use o modo lote.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Resultados da Análise</CardTitle>
                  <CardDescription>
                    {results.length} produtos analisados
                  </CardDescription>
                </div>
                <Button onClick={handleExport} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg space-y-3 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{result.product_name}</h4>
                        <a
                          href={result.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                        >
                          Ver no Mercado Livre
                          <Link2 className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              recommendationConfig[result.recommendation].color
                            }`}
                          />
                          <span className="text-sm font-medium">
                            {recommendationConfig[result.recommendation].label}
                          </span>
                        </div>
                        <Badge variant={competitionConfig[result.competition_level].variant}>
                          {competitionConfig[result.competition_level].label}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Custo</p>
                        <p className="text-lg font-bold">
                          R$ {result.cost.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Preço ML</p>
                        <p className="text-lg font-bold">
                          R$ {result.market_price.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Sugerido</p>
                        <p className="text-lg font-bold">
                          R$ {result.suggested_price.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Margem</p>
                        <p className="text-lg font-bold text-green-600">
                          {result.net_margin.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">ROI</p>
                        <p className="text-lg font-bold text-blue-600">
                          {result.roi.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm">{result.ai_justification}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}