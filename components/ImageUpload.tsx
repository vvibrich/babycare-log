'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Upload, X, Camera } from 'lucide-react';
import { Button } from './ui/button';
import Image from 'next/image';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string | null;
  onImageRemoved?: () => void;
}

export function ImageUpload({ onImageUploaded, currentImageUrl, onImageRemoved }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB');
      return;
    }

    try {
      setUploading(true);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('record-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('record-photos')
        .getPublicUrl(data.path);

      onImageUploaded(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erro ao fazer upload da imagem');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (onImageRemoved) {
      onImageRemoved();
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Foto (opcional)
      </label>

      {preview ? (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-gray-50 dark:bg-gray-800"
          >
            {uploading ? (
              <div className="flex flex-col items-center">
                <Upload className="h-10 w-10 text-blue-500 animate-pulse" />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Enviando...
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Camera className="h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Clique para adicionar foto
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  PNG, JPG até 5MB
                </p>
              </div>
            )}
          </label>
        </div>
      )}
    </div>
  );
}
