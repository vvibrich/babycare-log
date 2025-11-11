"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle2,
  MapPin,
  Phone,
  RotateCcw,
  Save,
  ShieldAlert,
  User as UserIcon,
  UserCheck,
} from "lucide-react";

interface ProfileFormState {
  full_name: string;
  age: string;
  phone: string;
  city: string;
  bio: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

const emptyProfile: ProfileFormState = {
  full_name: "",
  age: "",
  phone: "",
  city: "",
  bio: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [formData, setFormData] = useState<ProfileFormState>(emptyProfile);
  const [initialSnapshot, setInitialSnapshot] =
    useState<ProfileFormState>(emptyProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialSnapshot);
  }, [formData, initialSnapshot]);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const profile: ProfileFormState = {
            full_name: data.full_name ?? "",
            age:
              data.age !== null && data.age !== undefined
                ? String(data.age)
                : "",
            phone: data.phone ?? "",
            city: data.city ?? "",
            bio: data.bio ?? "",
            emergency_contact_name: data.emergency_contact_name ?? "",
            emergency_contact_phone: data.emergency_contact_phone ?? "",
          };
          setFormData(profile);
          setInitialSnapshot(profile);
        } else {
          setFormData(emptyProfile);
          setInitialSnapshot(emptyProfile);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setErrorMessage(
          "Não foi possível carregar seu perfil. Tente novamente mais tarde."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [loading, router, user]);

  const handleChange =
    (field: keyof ProfileFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  const handleReset = () => {
    setFormData(initialSnapshot);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    if (!formData.full_name.trim()) {
      setErrorMessage("Informe seu nome completo.");
      setSuccessMessage("");
      return;
    }

    if (formData.age && Number(formData.age) < 0) {
      setErrorMessage("A idade deve ser um número positivo.");
      setSuccessMessage("");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload = {
        user_id: user.id,
        full_name: formData.full_name.trim(),
        age: formData.age ? Number(formData.age) : null,
        phone: formData.phone.trim() || null,
        city: formData.city.trim() || null,
        bio: formData.bio.trim() || null,
        emergency_contact_name: formData.emergency_contact_name.trim() || null,
        emergency_contact_phone:
          formData.emergency_contact_phone.trim() || null,
      };

      const { error } = await supabase
        .from("user_profiles")
        .upsert(payload, { onConflict: "user_id" });

      if (error) throw error;

      const snapshot: ProfileFormState = {
        full_name: payload.full_name,
        age:
          payload.age !== null && payload.age !== undefined
            ? String(payload.age)
            : "",
        phone: payload.phone ?? "",
        city: payload.city ?? "",
        bio: payload.bio ?? "",
        emergency_contact_name: payload.emergency_contact_name ?? "",
        emergency_contact_phone: payload.emergency_contact_phone ?? "",
      };

      setInitialSnapshot(snapshot);
      setFormData(snapshot);
      setSuccessMessage("Perfil atualizado com sucesso!");
    } catch (error: any) {
      console.error("Error saving profile:", error);
      setErrorMessage(
        error?.message || "Erro ao salvar perfil. Tente novamente."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <span className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p>Carregando seu perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300">
            <UserCheck className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Seu Perfil
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Complete seus dados para personalizar a experiência e facilitar o
            suporte médico.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>
              Esses dados ajudam a equipe médica a acompanhar melhor a saúde do
              seu bebê.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {successMessage && (
                <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
                  <div>{successMessage}</div>
                </div>
              )}

              {errorMessage && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                  <div>{errorMessage}</div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome completo *</Label>
                  <Input
                    id="full_name"
                    placeholder="Ex: Maria Silva"
                    value={formData.full_name}
                    onChange={handleChange("full_name")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Idade</Label>
                  <Input
                    id="age"
                    type="number"
                    min="0"
                    placeholder="Ex: 32"
                    value={formData.age}
                    onChange={handleChange("age")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" /> Telefone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 91234-5678"
                    value={formData.phone}
                    onChange={handleChange("phone")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" /> Cidade
                  </Label>
                  <Input
                    id="city"
                    placeholder="Ex: São Paulo - SP"
                    value={formData.city}
                    onChange={handleChange("city")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" /> Sobre
                  você
                </Label>
                <Textarea
                  id="bio"
                  rows={4}
                  placeholder="Compartilhe informações relevantes sobre você, sua rotina ou observações importantes."
                  value={formData.bio}
                  onChange={handleChange("bio")}
                />
              </div>

              <div className="space-y-4 rounded-lg border border-purple-100 bg-purple-50/60 p-4 dark:border-purple-900 dark:bg-purple-950/20">
                <div className="flex items-center gap-2 text-sm font-semibold text-purple-700 dark:text-purple-300">
                  <ShieldAlert className="h-4 w-4" /> Contato de Emergência
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_name">
                      Nome do contato
                    </Label>
                    <Input
                      id="emergency_contact_name"
                      placeholder="Ex: João Silva"
                      value={formData.emergency_contact_name}
                      onChange={handleChange("emergency_contact_name")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_phone">
                      Telefone do contato
                    </Label>
                    <Input
                      id="emergency_contact_phone"
                      type="tel"
                      placeholder="(11) 98765-4321"
                      value={formData.emergency_contact_phone}
                      onChange={handleChange("emergency_contact_phone")}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                  Última atualização será registrada automaticamente.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={!isDirty || isSaving}
                    className="flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restaurar alterações
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving || !isDirty}
                    className="flex items-center justify-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? "Salvando..." : "Salvar perfil"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
