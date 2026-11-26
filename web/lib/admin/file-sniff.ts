export type SniffedImage = "jpeg" | "png" | "webp" | "gif";
export type SniffedAudio =
  | "mp3"
  | "wav"
  | "ogg"
  | "flac"
  | "m4a"
  | "aac"
  | "webm";

function startsWith(bytes: Uint8Array, sig: number[], offset = 0) {
  if (bytes.length < offset + sig.length) return false;
  return sig.every((b, i) => bytes[offset + i] === b);
}

/** Lit le contenu réel — ignore l’extension / MIME spoofés (ex. pdf renommé .png). */
export async function sniffImage(
  file: Blob,
): Promise<SniffedImage | null> {
  const buf = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (startsWith(buf, [0xff, 0xd8, 0xff])) return "jpeg";
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "png";
  }
  if (
    startsWith(buf, [0x47, 0x49, 0x46, 0x38, 0x37]) ||
    startsWith(buf, [0x47, 0x49, 0x46, 0x38, 0x39])
  ) {
    return "gif";
  }
  if (
    startsWith(buf, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(buf, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return "webp";
  }
  return null;
}

export async function sniffAudio(
  file: Blob,
): Promise<SniffedAudio | null> {
  const buf = new Uint8Array(await file.slice(0, 16).arrayBuffer());

  if (startsWith(buf, [0x49, 0x44, 0x33])) return "mp3";
  if (buf[0] === 0xff && (buf[1]! & 0xe0) === 0xe0) return "mp3";

  if (
    startsWith(buf, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(buf, [0x57, 0x41, 0x56, 0x45], 8)
  ) {
    return "wav";
  }

  if (startsWith(buf, [0x4f, 0x67, 0x67, 0x53])) return "ogg";
  if (startsWith(buf, [0x66, 0x4c, 0x61, 0x43])) return "flac";
  if (startsWith(buf, [0x1a, 0x45, 0xdf, 0xa3])) return "webm";

  if (startsWith(buf, [0x66, 0x74, 0x79, 0x70], 4)) {
    return "m4a";
  }

  if (buf[0] === 0xff && (buf[1]! & 0xf6) === 0xf0) return "aac";

  return null;
}

export function imageMime(kind: SniffedImage) {
  if (kind === "jpeg") return "image/jpeg";
  if (kind === "png") return "image/png";
  if (kind === "webp") return "image/webp";
  return "image/gif";
}

export function audioMime(kind: SniffedAudio) {
  if (kind === "mp3") return "audio/mpeg";
  if (kind === "wav") return "audio/wav";
  if (kind === "ogg") return "audio/ogg";
  if (kind === "flac") return "audio/flac";
  if (kind === "webm") return "audio/webm";
  if (kind === "aac") return "audio/aac";
  return "audio/mp4";
}
