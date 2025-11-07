'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Share2, MessageCircle, Mail, Copy, Check } from 'lucide-react';
import { Record } from '@/types/record';
import { shareViaWhatsApp, shareViaEmail, copyReportToClipboard } from '@/lib/shareReport';

interface ShareDialogProps {
  records: Record[];
  childName: string;
  startDate?: Date;
  endDate?: Date;
  disabled?: boolean;
}

export function ShareDialog({ records, childName, startDate, endDate, disabled }: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareOptions = {
    records,
    childName,
    startDate,
    endDate,
  };

  const handleWhatsApp = () => {
    shareViaWhatsApp(shareOptions);
    setOpen(false);
  };

  const handleEmail = () => {
    shareViaEmail(shareOptions);
    setOpen(false);
  };

  const handleCopy = async () => {
    const success = await copyReportToClipboard(shareOptions);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          Compartilhar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhar Relatório</DialogTitle>
          <DialogDescription>
            Escolha como deseja compartilhar este relatório
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Button
            onClick={handleWhatsApp}
            className="w-full bg-green-500 hover:bg-green-600"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Compartilhar via WhatsApp
          </Button>
          <Button
            onClick={handleEmail}
            variant="outline"
            className="w-full"
          >
            <Mail className="mr-2 h-4 w-4" />
            Enviar por Email
          </Button>
          <Button
            onClick={handleCopy}
            variant="outline"
            className="w-full"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span className="text-green-500">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copiar Texto
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          {records.length} registro(s) • {childName}
          {startDate && ` • ${startDate.toLocaleDateString('pt-BR')}`}
          {endDate && startDate !== endDate && ` a ${endDate.toLocaleDateString('pt-BR')}`}
        </p>
      </DialogContent>
    </Dialog>
  );
}
