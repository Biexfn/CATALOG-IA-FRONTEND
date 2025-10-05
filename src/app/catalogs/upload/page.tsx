'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Upload, FileText, Loader2, X } from 'lucide-react';

import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { catalogService } from '@/services/catalog.service';
import { Progress } from '@/components/ui/progress';

const uploadSchema = z.object({
  tax_rate: z.number().min(0).max(100),
  extra_costs: z.number().min(0),
  ml_links: z.string().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

export default function CatalogUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      tax_rate: 0,
      extra_costs: 0,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validar tipo de arquivo
    const validTypes = [
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Formato de arquivo inválido. Use PDF, CSV ou XLSX');
      return;
    }

    // Validar tamanho (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Tamanho máximo: 10MB');
      return;
    }

    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
  };

  const onSubmit = async (data: UploadFormData) => {
    if (!file) {
      toast.error('Selecione um arquivo');
      return;
    }

    setIsUploading(true);

    try {
      // Processar links ML (se houver)
      const mlLinks = data.ml_links
        ? data.ml_links.split('\n').filter((link) => link.trim())
        : [];

      const catalog = await catalogService.uploadCatalog(
        {
          file,
          tax_rate: data.tax_rate,
          extra_costs: data.extra_costs,
          ml_links: mlLinks.length > 0 ? mlLinks : undefined,
        },
        (progress) => {
          setUploadProgress(progress);
        }
      );

      toast.success('Catálogo enviado com sucesso!');
      router.push(`/catalogs/${catalog.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao enviar catálogo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Upload de Catálogo</h1>
          <p className="text-muted-foreground mt-1">
            Envie seu catálogo de produtos para análise
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Upload de Arquivo */}
          <Card>
            <CardHeader>
              <CardTitle>Arquivo do Catálogo</CardTitle>
              <CardDescription>
                Formatos aceitos: PDF, CSV, XLSX (máx. 10MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!file ? (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Clique para selecionar</span> ou
                      arraste o arquivo
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, CSV ou XLSX até 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    {!isUploading && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={removeFile}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {isUploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} />
                      <p className="text-sm text-center text-muted-foreground">
                        Enviando... {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Parâmetros de Análise */}
          <Card>
            <CardHeader>
              <CardTitle>Parâmetros de Análise</CardTitle>
              <CardDescription>
                Configure os custos para cálculo de viabilidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax_rate">Taxa de Impostos (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    disabled={isUploading}
                    {...register('tax_rate', { valueAsNumber: true })}
                  />
                  {errors.tax_rate && (
                    <p className="text-sm text-destructive">
                      {errors.tax_rate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="extra_costs">Custos Extras (R$)</Label>
                  <Input
                    id="extra_costs"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    disabled={isUploading}
                    {...register('extra_costs', { valueAsNumber: true })}
                  />
                  {errors.extra_costs && (
                    <p className="text-sm text-destructive">
                      {errors.extra_costs.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ml_links">
                  Links do Mercado Livre (opcional)
                </Label>
                <textarea
                  id="ml_links"
                  rows={4}
                  className="w-full px-3 py-2 text-sm border rounded-md resize-none"
                  placeholder="Cole os links do ML aqui (um por linha)"
                  disabled={isUploading}
                  {...register('ml_links')}
                />
                <p className="text-xs text-muted-foreground">
                  Links específicos para produtos que deseja analisar
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!file || isUploading} className="flex-1">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Enviar e Iniciar Análise
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}