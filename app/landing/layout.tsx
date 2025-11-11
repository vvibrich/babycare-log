import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cubbi - Registro de Cuidados do seu Bebê",
  description: "Acompanhe sintomas, medicações e gere relatórios profissionais para o pediatra. Funciona 100% offline. Gratuito e seguro.",
  keywords: ["bebê", "cuidados", "sintomas", "medicação", "pediatra", "registro", "offline", "pwa"],
  openGraph: {
    title: "Cubbi - Registro de Cuidados do seu Bebê",
    description: "Acompanhe sintomas, medicações e gere relatórios profissionais. Funciona offline!",
    type: "website",
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
