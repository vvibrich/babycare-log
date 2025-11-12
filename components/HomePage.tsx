"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Record, Child } from "@/types/record";
import { RecordList } from "@/components/RecordList";
import { TemperatureChart } from "@/components/TemperatureChart";
import { ChildSelector } from "@/components/ChildSelector";
import { MedicationReminders } from "@/components/MedicationReminders";
import { HealthMeter } from "@/components/HealthMeter";
import { IncidentsPanel } from "@/components/IncidentsPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { PendingInvites } from "@/components/PendingInvites";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import Link from "next/link";

type ChildAccessRole = "owner" | "editor" | "viewer";
type ChildWithAccess = Child & { access_role: ChildAccessRole };

export function HomePage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [children, setChildren] = useState<ChildWithAccess[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchChildren = async () => {
    try {
      // Verificar se há usuário autenticado antes de fazer a query
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setChildren([]);
        return;
      }

      const { data: childrenRows, error: childrenError } = await supabase
        .rpc("get_accessible_children");

      if (childrenError) throw childrenError;

      const childrenData = (childrenRows ?? []) as ChildWithAccess[];

      if (!childrenData.length) {
        setChildren([]);
        setIsLoading(false);
        localStorage.removeItem("selectedChildId");
        return;
      }

      setChildren(childrenData);

      const savedChildId = localStorage.getItem("selectedChildId");
      const currentChildExists = savedChildId
        ? childrenData.some((child) => child.id === savedChildId)
        : false;

      const nextChildId =
        (currentChildExists && savedChildId) ||
        childrenData.find((child) => child.is_active)?.id ||
        childrenData[0]?.id ||
        null;

      if (nextChildId) {
        if (selectedChildId !== nextChildId) {
          setSelectedChildId(nextChildId);
        }
        localStorage.setItem("selectedChildId", nextChildId);
      } else {
        if (selectedChildId !== null) {
          setSelectedChildId(null);
        }
        localStorage.removeItem("selectedChildId");
      }

      if (childrenData.length === 0) {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching children:", error);
    }
  };

  const fetchRecords = async (
    showRefreshing = false,
    childId: string | null = selectedChildId
  ) => {
    if (showRefreshing) setIsRefreshing(true);

    try {
      // Verificar se há usuário autenticado antes de fazer a query
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setRecords([]);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      let query = supabase.from("records_with_user").select("*");

      // Filter by child if selected
      if (childId) {
        query = query.eq("child_id", childId);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;

      // Filtrar apenas registros de hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayRecords = (data || []).filter((record) => {
        const recordDate = new Date(record.created_at);
        return recordDate >= today && recordDate < tomorrow;
      });

      setRecords(todayRecords);
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchRecords(true);
  };

  const handleChildChange = (childId: string) => {
    setSelectedChildId(childId);
    localStorage.setItem("selectedChildId", childId);
    fetchRecords(false, childId);
  };

  useEffect(() => {
    // Load selected child from localStorage
    const savedChildId = localStorage.getItem("selectedChildId");
    if (savedChildId) {
      setSelectedChildId(savedChildId);
    }

    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId !== null || children.length > 0) {
      fetchRecords();
    }

    // Subscribe to changes in the records table
    const recordsChannel = supabase
      .channel("records-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "records",
        },
        () => {
          fetchRecords();
        }
      )
      .subscribe();

    // Subscribe to children changes
    const childrenChannel = supabase
      .channel("children-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "children",
        },
        () => {
          fetchChildren();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(recordsChannel);
      supabase.removeChannel(childrenChannel);
    };
  }, [selectedChildId, children.length]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              Início
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Acompanhe os cuidados com seu filho
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <UserMenu />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Atualizar"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        {/* Child Selector */}
        <ChildSelector
          children={children}
          selectedChildId={selectedChildId}
          onChildChange={handleChildChange}
        />

        {/* Pending Invites */}
        <PendingInvites />

        {/* Action Buttons */}
        {selectedChildId && (
          <div className="grid grid-cols-2 gap-3">
            <Link href="/add/symptom" className="w-full">
              <Button className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90">
                <Plus className="mr-1 sm:mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Sintoma</span>
              </Button>
            </Link>
            <Link href="/add/medication" className="w-full">
              <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
                <Plus className="mr-1 sm:mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Medicação</span>
              </Button>
            </Link>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando registros...</p>
          </div>
        ) : (
          <>
            {/* Medication Reminders */}
            {selectedChildId && (
              <MedicationReminders childId={selectedChildId} />
            )}

            {/* Health Meter - Saúdometro IA */}
            {selectedChildId && (
              <HealthMeter
                records={records}
                child={children.find((c) => c.id === selectedChildId)}
              />
            )}

            {/* Incidents Panel */}
            {selectedChildId && (
              <IncidentsPanel childId={selectedChildId} records={records} />
            )}

            {/* Records List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">Registros de Hoje</span>
                  <span className="text-xs">({records.length})</span>
                </div>
                <Link href="/records">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Ver todos os registros →
                  </Button>
                </Link>
              </div>
              {records.length > 0 ? (
                <RecordList records={records} />
              ) : (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <p className="text-sm">Nenhum registro hoje</p>
                  <p className="text-xs mt-1">
                    <Link href="/records" className="underline">
                      Ver registros anteriores
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
