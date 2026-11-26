"use client";

import { useId, useRef, useState, type DragEvent, type ReactNode } from "react";
import { sniffAudio, sniffImage } from "@/lib/admin/file-sniff";
import { interpolate } from "@/lib/i18n/dictionaries";
import { useDictionary } from "@/lib/i18n/provider";

type FileDropZoneProps = {
  name: string;
  accept: string;
  kind: "audio" | "image";
  /** Plafond en octets (vient des réglages admin). */
  maxBytes: number;
  required?: boolean;
  label: string;
  hint?: string;
  preview?: ReactNode;
  onFile?: (file: File | null) => void;
};

export function FileDropZone({
  name,
  accept,
  kind,
  maxBytes,
  required,
  label,
  hint,
  preview,
  onFile,
}: FileDropZoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const dictionary = useDictionary();
  const t = dictionary.admin.dropzone;

  const maxMb = Math.max(1, Math.round(maxBytes / (1024 * 1024)));
  const defaultHint =
    kind === "audio"
      ? interpolate(t.audioHint, { maxMb })
      : interpolate(t.imageHint, { maxMb });

  async function applyFile(file: File | null) {
    setError("");
    if (!file) {
      setFileName("");
      onFile?.(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (file.size > maxBytes) {
      setError(interpolate(t.tooHeavy, { maxMb }));
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const sniffed =
      kind === "image" ? await sniffImage(file) : await sniffAudio(file);
    if (!sniffed) {
      setError(kind === "image" ? t.notImage : t.notAudio);
      if (inputRef.current) inputRef.current.value = "";
      setFileName("");
      onFile?.(null);
      return;
    }

    const dt = new DataTransfer();
    dt.items.add(file);
    if (inputRef.current) {
      inputRef.current.files = dt.files;
    }
    setFileName(file.name);
    onFile?.(file);
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }

  function onDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    void applyFile(e.dataTransfer.files?.[0] ?? null);
  }

  return (
    <div className="space-y-1.5">
      <span className="text-sm text-[var(--admin-muted)]">{label}</span>
      <div className="flex gap-3">
        {preview ? (
          <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded border border-[var(--admin-border)] bg-[var(--admin-soft)]">
            {preview}
          </div>
        ) : null}
        <label
          htmlFor={inputId}
          onDragOver={onDragOver}
          onDragEnter={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`admin-dropzone flex min-h-20 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed px-3 py-4 text-center ${
            dragging
              ? "border-[var(--admin-accent)] bg-white ring-2 ring-[var(--admin-accent)]"
              : "border-[var(--admin-border)] bg-[var(--admin-soft)]"
          }`}
        >
          <input
            ref={inputRef}
            id={inputId}
            className="sr-only"
            name={name}
            type="file"
            accept={accept}
            required={required}
            onChange={(e) => void applyFile(e.target.files?.[0] ?? null)}
          />
          <span className="text-sm font-semibold text-[var(--admin-ink)]">
            {fileName
              ? fileName
              : dragging
                ? t.dropHere
                : t.dragOrClick}
          </span>
          <span className="mt-1 text-xs text-[var(--admin-muted)]">
            {hint ?? defaultHint}
          </span>
        </label>
      </div>
      {error ? (
        <p className="text-xs font-medium text-[var(--admin-danger)]">{error}</p>
      ) : null}
    </div>
  );
}
