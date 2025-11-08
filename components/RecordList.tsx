"use client";

import { useState } from "react";
import { Record, symptomTypeLabels } from "@/types/record";
import { formatDateTime } from "@/utils/formatDate";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, Thermometer, Trash2, Edit, ImageIcon, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { EditRecordModal } from "./EditRecordModal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface RecordListProps {
  records: Record[];
}

export function RecordList({ records }: RecordListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const getUserInitials = (email?: string) => {
    if (!email) return "?";
    const parts = email.split("@")[0].split(".");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (email?: string) => {
    if (!email) return "bg-gray-400";
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-teal-500",
    ];
    const index = email
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const handleEdit = (record: Record) => {
    setEditingRecord(record);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;

    setDeletingId(id);
    try {
      const { error } = await supabase.from("records").delete().eq("id", id);

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Erro ao excluir registro. Por favor, tente novamente.");
    } finally {
      setDeletingId(null);
    }
  };

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-8">
            <p className="text-lg">Nenhum registro encontrado</p>
            <p className="text-sm mt-2">
              Comece adicionando um sintoma ou medicação
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Registros</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-4">
          {records.map((record) => (
            <Card
              key={record.id}
              className="overflow-hidden border-l-4 shadow-md hover:shadow-lg transition-all duration-200"
              style={{
                borderLeftColor:
                  record.type === "symptom" ? "#f97316" : "#3b82f6",
              }}
            >
              <CardContent className="p-0">
                {/* Header with gradient */}
                <div
                  className={`p-4 pb-3 ${
                    record.type === "symptom"
                      ? "bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20"
                      : "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Icon with background */}
                      <div
                        className={`flex-shrink-0 p-2.5 rounded-xl shadow-sm ${
                          record.type === "symptom"
                            ? "bg-orange-100 dark:bg-orange-900/30"
                            : "bg-blue-100 dark:bg-blue-900/30"
                        }`}
                      >
                        {record.type === "symptom" ? (
                          <Thermometer className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        ) : (
                          <Pill className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>

                      {/* Title and type badge */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              record.type === "symptom"
                                ? "bg-orange-200 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300"
                                : "bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                            }`}
                          >
                            {record.type === "symptom"
                              ? "🌡️ Sintoma"
                              : "💊 Medicação"}
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 leading-tight">
                          {record.symptom_type &&
                          symptomTypeLabels[record.symptom_type]
                            ? symptomTypeLabels[record.symptom_type]
                            : record.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Date with icon and user avatar */}
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="font-medium">
                        {formatDateTime(record.created_at)}
                      </span>
                    </div>
                    {/* User Avatar */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="focus:outline-none">
                          <Avatar
                            className={`h-7 w-7 cursor-pointer transition-transform hover:scale-110 ${getAvatarColor(
                              record.user_email
                            )}`}
                          >
                            <AvatarFallback className="text-black dark:text-white text-xs font-bold">
                              {getUserInitials(record.user_email)}
                            </AvatarFallback>
                          </Avatar>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2" align="end">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {record.user_email || "Usuário desconhecido"}
                          </span>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Details with icon */}
                  <div className="flex items-start gap-2">
                    <div
                      className={`flex-shrink-0 mt-0.5 w-1 h-1 rounded-full ${
                        record.type === "symptom"
                          ? "bg-orange-500"
                          : "bg-blue-500"
                      }`}
                    />
                    <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {record.temperature ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg font-bold">
                          🌡️ {record.temperature}°C
                        </span>
                      ) : (
                        record.details
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {record.notes && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border-l-2 border-amber-400 rounded-r-lg">
                      <div className="flex gap-2">
                        <span className="text-amber-600 dark:text-amber-400 flex-shrink-0">
                          📝
                        </span>
                        <p className="text-xs text-amber-900 dark:text-amber-200 italic leading-relaxed">
                          {record.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Photo */}
                  {record.photo_url && (
                    <div className="pt-2">
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity shadow-md border-2 border-gray-200 dark:border-gray-700">
                        <Image
                          src={record.photo_url}
                          alt="Foto do registro"
                          fill
                          className="object-cover"
                          unoptimized
                          onClick={() =>
                            window.open(record.photo_url!, "_blank")
                          }
                        />
                        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md">
                          <span className="text-white text-xs font-medium">
                            📷 Ver foto
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(record)}
                      className="flex-1 bg-white dark:bg-gray-800 border-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-400 transition-all"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1.5" />
                      <span className="font-medium">Editar</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(record.id)}
                      disabled={deletingId === record.id}
                      className="flex-1 bg-white dark:bg-gray-800 border-2 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-400 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      <span className="font-medium">Excluir</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Tipo</TableHead>
                <TableHead className="w-[180px]">Data/Hora</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Detalhes</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead className="w-[80px]">Foto</TableHead>
                <TableHead className="w-[180px]">Cadastrado por</TableHead>
                <TableHead className="w-[120px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {record.type === "symptom" ? (
                      <Thermometer className="h-5 w-5 text-orange-500" />
                    ) : (
                      <Pill className="h-5 w-5 text-blue-500" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatDateTime(record.created_at)}
                  </TableCell>
                  <TableCell>
                    {record.symptom_type &&
                    symptomTypeLabels[record.symptom_type] ? (
                      <div>
                        <div className="font-medium">
                          {symptomTypeLabels[record.symptom_type]}
                        </div>
                        {record.title !==
                          symptomTypeLabels[record.symptom_type].replace(
                            /^[^\s]+\s/,
                            ""
                          ) && (
                          <div className="text-sm text-muted-foreground">
                            {record.title}
                          </div>
                        )}
                      </div>
                    ) : (
                      record.title
                    )}
                  </TableCell>
                  <TableCell>
                    {record.temperature
                      ? `${record.temperature}°C`
                      : record.details}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {record.notes || "-"}
                  </TableCell>
                  <TableCell>
                    {record.photo_url ? (
                      <div className="relative w-12 h-12 rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                        <Image
                          src={record.photo_url}
                          alt="Foto do registro"
                          fill
                          className="object-cover"
                          unoptimized
                          onClick={() =>
                            window.open(record.photo_url!, "_blank")
                          }
                        />
                      </div>
                    ) : (
                      <ImageIcon className="h-5 w-5 text-gray-300" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar
                        className={`h-8 w-8 ${getAvatarColor(
                          record.user_email
                        )}`}
                      >
                        <AvatarFallback className="text-white text-xs font-semibold">
                          {getUserInitials(record.user_email)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                        {record.user_email || "Desconhecido"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(record)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(record.id)}
                        disabled={deletingId === record.id}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Edit Modal */}
      <EditRecordModal
        record={editingRecord}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
    </Card>
  );
}
