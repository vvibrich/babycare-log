'use client';

import { Child } from '@/types/record';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings, Plus } from 'lucide-react';
import Link from 'next/link';

interface ChildSelectorProps {
  children: Child[];
  selectedChildId: string | null;
  onChildChange: (childId: string) => void;
}

export function ChildSelector({ children, selectedChildId, onChildChange }: ChildSelectorProps) {
  const activeChildren = children.filter(child => child.is_active);

  if (activeChildren.length === 0) {
    return (
      <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-800">
            Nenhuma criança cadastrada
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            Adicione uma criança para começar a registrar
          </p>
        </div>
        <Link href="/children/new">
          <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <Select value={selectedChildId || undefined} onValueChange={onChildChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione uma criança" />
          </SelectTrigger>
          <SelectContent>
            {activeChildren.map((child) => (
              <SelectItem key={child.id} value={child.id}>
                👶 {child.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Link href="/children">
        <Button variant="outline" size="icon" title="Gerenciar crianças">
          <Settings className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
