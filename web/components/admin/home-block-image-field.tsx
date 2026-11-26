"use client";

import { useEffect, useRef, useState } from "react";
import { sniffImage } from "@/lib/admin/file-sniff";
import { interpolate } from "@/lib/i18n/dictionaries";
import { useDictionary } from "@/lib/i18n/provider";

type HomeBlockImageFieldProps = {
  nameUrl?: string;
  nameFile?: string;
  defaultUrl: string;
  maxBytes: number;
  required?: boolean;
};

export function HomeBlockImageField({
  nameUrl = "image_url",
  nameFile = "image",
  defaultUrl,
  maxBytes,
  required = false,
}: HomeBlockImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(defaultUrl);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const maxMb = Math.max(1, Math.round(maxBytes / (1024 * 1024)));
  const dictionary = useDictionary();
  const t = dictionary.admin.home;
  const common = dictionary.admin.common;

  useEffect(() => {
    setPreview(defaultUrl);
  }, [defaultUrl]);

  async function onPick(file: File | null) {
    setError("");
    if (!file) {
      setFileName("");
      setPreview(defaultUrl);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (file.size > maxBytes) {
      setError(interpolate(t.imageTooHeavy, { maxMb }));
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (!(await sniffImage(file))) {
      setError(t.notRealImage);
      if (inputRef.current) inputRef.current.value = "";
      setFileName("");
      setPreview(defaultUrl);
      return;
    }
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
  }

  return (
    <div className="space-y-2">
      <span className="text-xs text-[var(--admin-muted)]">{t.image}</span>
      <div className="flex gap-3">
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded border border-[var(--admin-border)] bg-[var(--admin-soft)]">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-[0.65rem] text-[var(--admin-muted)]">
              {common.preview}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <label className="admin-btn admin-btn-ghost block w-full cursor-pointer py-2 text-center text-xs">
            {t.chooseFile}
            <input
              ref={inputRef}
              type="file"
              name={nameFile}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(e) => void onPick(e.target.files?.[0] ?? null)}
            />
          </label>
          {fileName ? (
            <p className="truncate text-[0.7rem] text-[var(--admin-muted)]">
              {fileName}
            </p>
          ) : null}
          <input
            className="admin-field py-1.5 text-xs"
            name={nameUrl}
            defaultValue={defaultUrl}
            placeholder="/images/… ou https://…"
            required={required && !fileName}
            onChange={(e) => {
              if (!fileName) setPreview(e.target.value);
            }}
          />
        </div>
      </div>
      {error ? (
        <p className="text-xs font-medium text-[var(--admin-danger)]">{error}</p>
      ) : (
        <p className="text-[0.65rem] leading-snug text-[var(--admin-muted)]">
          {interpolate(t.imageHint, { maxMb })}
        </p>
      )}
    </div>
  );
}
