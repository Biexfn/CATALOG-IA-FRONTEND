'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Check, Crown, Zap, Loader2 } from 'lucide-react';

import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { subscriptionService } from '@/services/subscription.service';
import { Plan, Subscription } from '@/types';

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [plansData, subData] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getCurrentSubscription(),
      ]);
      setPlans(plansData);
      setCurrentSubscription(subData);
    } catch {
      toast.error('Erro ao carregar dados da assinatura');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubscribe = async (planId: string) => {
    setCheckoutLoading(planId);
    try {
      const successUrl = `${window.location.origin}/subscription/success`;
      const cancelUrl = `${window.location.origin}/subscription`;
      
      const { checkout_url } = await subscriptionService.createCheckoutSession(
        planId,
        successUrl,
        cancelUrl
      );
      window.location.href = checkout_url;
    } catch {
      toast.error('Erro ao criar checkout');
      setCheckoutLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura?')) return;

    try {
      await subscriptionService.cancelSubscription();
      toast.success('Assinatura cancelada com sucesso');
      loadData();
    } catch {
      toast.error('Erro ao cancelar assinatura');
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

  const usagePercentage = currentSubscription && currentSubscription.catalogs_limit !== -1
    ? (currentSubscription.catalogs_used_this_month / currentSubscription.catalogs_limit) * 100
    : 0;

  const isCurrentPlanTrial = currentSubscription?.plan === 'trial';
  const isCurrentPlanPro = currentSubscription?.plan === 'pro';

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Assinatura</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seu plano e pagamentos
          </p>
        </div>

        {currentSubscription && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Plano Atual</CardTitle>
                  <CardDescription className="mt-1">
                    Status: <Badge>{currentSubscription.status}</Badge>
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {currentSubscription.plan.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentSubscription && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Catálogos este mês
                    </span>
                    <span className="font-medium">
                      {currentSubscription.catalogs_used_this_month} de{' '}
                      {currentSubscription.catalogs_limit === -1 
                        ? 'Ilimitado' 
                        : currentSubscription.catalogs_limit}
                    </span>
                  </div>
                  {currentSubscription.catalogs_limit !== -1 && (
                    <>
                      <Progress value={usagePercentage} />
                      {usagePercentage >= 80 && (
                        <p className="text-sm text-yellow-600">
                          ⚠️ Você está próximo do limite mensal
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              {currentSubscription?.current_period_start && currentSubscription?.current_period_end && (
                <div className="flex justify-between text-sm pt-4">
                  <div>
                    <p className="text-muted-foreground">Período atual</p>
                    <p className="font-medium">
                      {new Date(currentSubscription.current_period_start).toLocaleDateString('pt-BR')}
                      {' - '}
                      {new Date(currentSubscription.current_period_end).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            {currentSubscription.plan !== 'trial' && (
              <CardFooter>
                <Button
                  variant="outline"
                  onClick={handleCancelSubscription}
                  className="w-full"
                >
                  Cancelar Assinatura
                </Button>
              </CardFooter>
            )}
          </Card>
        )}

        <div>
          <h2 className="text-2xl font-bold mb-4">Planos Disponíveis</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="relative">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4">
                  <Zap className="w-12 h-12 text-blue-500" />
                </div>
                <CardTitle className="text-2xl">Trial</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">Grátis</span>
                  <p className="text-sm text-muted-foreground mt-2">2 dias de teste</p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>10 catálogos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>50 produtos por catálogo</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Análise com IA</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Relatórios básicos</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                {isCurrentPlanTrial ? (
                  <Button disabled className="w-full">
                    Plano Atual
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubscribe('trial')}
                    disabled={checkoutLoading !== null}
                    className="w-full"
                    variant="outline"
                  >
                    {checkoutLoading === 'trial' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Começar Grátis'
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>

            <Card className="relative border-primary shadow-lg">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary">Mais Popular</Badge>
              </div>

              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4">
                  <Crown className="w-12 h-12 text-yellow-500" />
                </div>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="mt-4">
                  <div className="text-4xl font-bold">€1.500</div>
                  <div className="text-muted-foreground">/mês</div>
                  <p className="text-sm text-muted-foreground mt-1">≈ R$ 9.900/mês</p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="font-semibold">Catálogos ilimitados</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="font-semibold">Produtos ilimitados</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Análise com IA avançada</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Integração Mercado Livre</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Relatórios avançados</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Suporte prioritário</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                {isCurrentPlanPro ? (
                  <Button disabled className="w-full">
                    Plano Atual
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubscribe('pro')}
                    disabled={checkoutLoading !== null}
                    className="w-full"
                  >
                    {checkoutLoading === 'pro' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Assinar Agora'
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Perguntas Frequentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-1">
                Posso cancelar a qualquer momento?
              </h4>
              <p className="text-sm text-muted-foreground">
                Sim! Você pode cancelar sua assinatura a qualquer momento. Você
                continuará tendo acesso até o fim do período pago.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Como funciona o período trial?</h4>
              <p className="text-sm text-muted-foreground">
                Você tem 2 dias para testar a plataforma com limite de 10 catálogos e 50 produtos por catálogo.
                Após esse período, faça upgrade para o plano Pro para continuar.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">
                O que acontece se eu exceder o limite no Trial?
              </h4>
              <p className="text-sm text-muted-foreground">
                Você não poderá fazer upload de novos catálogos até fazer upgrade para o plano Pro com catálogos ilimitados.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}