"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Baby,
  Pill,
  Thermometer,
  FileText,
  Bell,
  Wifi,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Check if running as PWA
    const isPWA =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;

    if (isPWA) {
      // Redirect PWA users automatically
      if (!loading) {
        if (user) {
          router.push("/");
        } else {
          router.push("/login");
        }
      }
    }
  }, [user, loading, router]);

  // Check if running as PWA
  const isPWA =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone);

  // Don't render landing for PWA users (they'll be redirected)
  if (isPWA) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navbar */}
      <nav className="border-b bg-card/80 dark:bg-card/60 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo className="text-primary" />
              <span className="text-2xl font-bold text-foreground">Cubbi</span>
            </div>
            <div className="flex gap-3">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="hover:text-white hover:bg-primary"
                >
                  Entrar
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary text-white hover:bg-primary/90 dark:bg-muted-foreground dark:hover:bg-primary/90">
                  Começar Grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-hero-gradient dark:bg-gradient-to-b dark:from-background dark:to-background">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/30 dark:bg-secondary/20 text-secondary-foreground dark:text-secondary rounded-full mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">
                Funciona 100% Offline!
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Registre os cuidados do seu bebê de forma{" "}
              <span className="text-primary">simples e segura</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Acompanhe sintomas, medicações e gere relatórios profissionais
              para o pediatra. Tudo salvo automaticamente, mesmo sem internet.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-primary text-white hover:bg-primary/90 dark:bg-muted-foreground dark:hover:bg-primary/90 text-lg px-8 py-6"
                >
                  Começar Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 text-foreground hover:text-white"
                >
                  Já tenho conta
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mt-6 flex-wrap">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Dados criptografados</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Funciona offline</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-background dark:bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-lg text-muted-foreground">
              Recursos pensados para facilitar o cuidado do seu bebê
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl border border-border/60 bg-card hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-secondary/30 dark:bg-secondary/20 rounded-lg flex items-center justify-center mb-4">
                <Thermometer className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Registro de Sintomas
              </h3>
              <p className="text-muted-foreground">
                Registre febre, tosse, vômito e outros sintomas com data e hora
                precisas.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl border border-border/60 bg-card dark:bg-card hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-accent/20 dark:bg-accent/20 rounded-lg flex items-center justify-center mb-4">
                <Pill className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Controle de Medicações
              </h3>
              <p className="text-muted-foreground">
                Acompanhe doses, horários e configure lembretes para não
                esquecer.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl border border-border/60 bg-card dark:bg-card hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-success/10 dark:bg-success/15 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Relatórios Profissionais
              </h3>
              <p className="text-muted-foreground">
                Gere relatórios em PDF para levar ao pediatra com todas as
                informações.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-xl border border-border/60 bg-card dark:bg-card hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-secondary/25 dark:bg-secondary/15 rounded-lg flex items-center justify-center mb-4">
                <Wifi className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Funciona Offline
              </h3>
              <p className="text-muted-foreground">
                Registre tudo mesmo sem internet. Sincroniza automaticamente
                depois.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-xl border border-border/60 bg-card dark:bg-card hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-warning/20 dark:bg-warning/20 rounded-lg flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-warning-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Lembretes Inteligentes
              </h3>
              <p className="text-muted-foreground">
                Receba notificações para não esquecer os horários das
                medicações.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-xl border border-border/60 bg-card dark:bg-card hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-accent/25 dark:bg-accent/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Seguro e Privado
              </h3>
              <p className="text-muted-foreground">
                Seus dados são criptografados e armazenados com segurança total.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Como funciona?
            </h2>
            <p className="text-lg text-muted-foreground">
              Simples e rápido em 3 passos
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 bg-secondary/30 dark:bg-secondary/20 text-primary rounded-full border border-secondary/50 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Cadastre-se Grátis
              </h3>
              <p className="text-muted-foreground">
                Crie sua conta em menos de 1 minuto, sem cartão de crédito
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-secondary/30 dark:bg-secondary/20 text-primary rounded-full border border-secondary/50 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Adicione seu Bebê
              </h3>
              <p className="text-muted-foreground">
                Cadastre as informações básicas do seu filho ou filha
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-secondary/30 dark:bg-secondary/20 text-primary rounded-full border border-secondary/50 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Comece a Registrar
              </h3>
              <p className="text-muted-foreground">
                Anote sintomas, medicações e gere relatórios quando precisar
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary/30 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto dark:text-foreground">
            Junte-se a milhares de pais que já usam o Cubbi para cuidar melhor
            de seus filhos
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-primary text-white hover:bg-card/90 hover:text-primary-foreground text-lg px-8 py-6 dark:bg-muted-foreground dark:hover:bg-muted-foreground dark:text-primary-foreground"
            >
              Criar Conta Gratuita
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card dark:bg-background text-muted py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Logo size="sm" className="text-primary" />
              <span className="text-xl font-bold text-foreground">Cubbi</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">
                © 2025 Cubbi. Todos os direitos reservados.
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                Feito com ❤️ para pais e mães cuidadosos
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
