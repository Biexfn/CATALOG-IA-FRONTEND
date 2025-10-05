'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Star,
  ExternalLink,
  Download,
  Trash2,
  MoreVertical,
  Package,
} from 'lucide-react';

import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { productService } from '@/services/product.service';
import { Product, ProductFilters } from '@/types';

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

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<ProductFilters>({
    catalog_id: searchParams.get('catalog') || undefined,
    search: '',
  });

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const response = await productService.getProducts(filters);
      setProducts(response.products);
    } catch (error: any) {
      toast.error('Erro ao carregar produtos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const handleToggleFavorite = async (productId: string, isFavorite: boolean) => {
    try {
      await productService.toggleFavorite(productId, !isFavorite);
      loadProducts();
    } catch (error: any) {
      toast.error('Erro ao atualizar favorito');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return;

    try {
      await productService.deleteProduct(productId);
      toast.success('Produto deletado');
      loadProducts();
    } catch (error: any) {
      toast.error('Erro ao deletar produto');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    if (!confirm(`Deletar ${selectedProducts.length} produtos?`)) return;

    try {
      await productService.deleteProducts(selectedProducts);
      toast.success('Produtos deletados');
      setSelectedProducts([]);
      loadProducts();
    } catch (error: any) {
      toast.error('Erro ao deletar produtos');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await productService.exportProducts(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `produtos_${Date.now()}.csv`;
      a.click();
      toast.success('Produtos exportados');
    } catch (error: any) {
      toast.error('Erro ao exportar produtos');
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
            <h1 className="text-3xl font-bold">Produtos</h1>
            <p className="text-muted-foreground mt-1">
              {products.length} produtos encontrados
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedProducts.length > 0 && (
              <Button variant="destructive" onClick={handleBulkDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar ({selectedProducts.length})
              </Button>
            )}
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Buscar por nome, SKU..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />

              <Select
                value={filters.recommendation || 'all'}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    recommendation: value === 'all' ? undefined : value as any,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Recomendação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="buy">Comprar</SelectItem>
                  <SelectItem value="observe">Observar</SelectItem>
                  <SelectItem value="discard">Descartar</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.competition_level || 'all'}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    competition_level: value === 'all' ? undefined : value as any,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Concorrência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setFilters({ ...filters, favorites_only: !filters.favorites_only })}
              >
                <Star className={`w-4 h-4 mr-2 ${filters.favorites_only ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                {filters.favorites_only ? 'Todos' : 'Favoritos'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        {products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Package className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                Tente ajustar os filtros ou faça upload de um catálogo
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {/* Favorite Star */}
                    <button
                      onClick={() => handleToggleFavorite(product.id, product.is_favorite)}
                      className="mt-1"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          product.is_favorite
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>

                    {/* Product Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span>SKU: {product.sku}</span>
                            {product.brand && (
                              <>
                                <span>•</span>
                                <span>{product.brand}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {product.ml_link && (
                              <DropdownMenuItem
                                onClick={() => window.open(product.ml_link, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Ver no ML
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Deletar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2">
                        {product.recommendation && (
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                recommendationConfig[product.recommendation].color
                              }`}
                            />
                            <span className="text-sm font-medium">
                              {recommendationConfig[product.recommendation].label}
                            </span>
                          </div>
                        )}
                        {product.competition_level && (
                          <Badge
                            variant={competitionConfig[product.competition_level].variant}
                          >
                            {competitionConfig[product.competition_level].label}
                          </Badge>
                        )}
                      </div>

                      {/* Financial Data */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Custo</p>
                          <p className="text-lg font-bold">
                            R$ {product.supplier_cost.toFixed(2)}
                          </p>
                        </div>
                        {product.market_price && (
                          <div>
                            <p className="text-xs text-muted-foreground">Preço ML</p>
                            <p className="text-lg font-bold">
                              R$ {product.market_price.toFixed(2)}
                            </p>
                          </div>
                        )}
                        {product.suggested_price && (
                          <div>
                            <p className="text-xs text-muted-foreground">Sugerido</p>
                            <p className="text-lg font-bold">
                              R$ {product.suggested_price.toFixed(2)}
                            </p>
                          </div>
                        )}
                        {product.net_margin !== null && product.net_margin !== undefined && (
                          <div>
                            <p className="text-xs text-muted-foreground">Margem</p>
                            <p className="text-lg font-bold text-green-600">
                              {product.net_margin.toFixed(1)}%
                            </p>
                          </div>
                        )}
                        {product.roi !== null && product.roi !== undefined && (
                          <div>
                            <p className="text-xs text-muted-foreground">ROI</p>
                            <p className="text-lg font-bold text-blue-600">
                              {product.roi.toFixed(1)}%
                            </p>
                          </div>
                        )}
                      </div>

                      {/* AI Justification */}
                      {product.ai_justification && (
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm">{product.ai_justification}</p>
                        </div>
                      )}
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