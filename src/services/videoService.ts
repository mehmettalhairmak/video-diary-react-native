/**
 * File & media helpers for persisting trimmed clips and generating thumbnails.
 *
 * Contract:
 * - persistClip(tempUri, id) -> final mp4 uri (moves/copies and cleans temp)
 * - generateAndPersistThumb(videoUri, id) -> jpg uri | undefined (best-effort)
 */
import * as FileSystem from "expo-file-system";
import * as VideoThumbnails from "expo-video-thumbnails";

const CLIPS_DIR = FileSystem.documentDirectory + "clips";
const THUMBS_DIR = FileSystem.documentDirectory + "thumbs";

/** Ensure application directories exist (idempotent). */
export async function ensureDirs() {
  await FileSystem.makeDirectoryAsync(CLIPS_DIR, { intermediates: true }).catch(
    () => {}
  );
  await FileSystem.makeDirectoryAsync(THUMBS_DIR, {
    intermediates: true,
  }).catch(() => {});
}

export async function persistClip(tempUri: string, id: string) {
  await ensureDirs();
  const dest = `${CLIPS_DIR}/${id}.mp4`;
  await FileSystem.copyAsync({ from: tempUri, to: dest });
  // Best-effort cleanup of temp file to save space
  try {
    await FileSystem.deleteAsync(tempUri, { idempotent: true });
  } catch {}
  return dest;
}

export async function generateAndPersistThumb(videoUri: string, id: string) {
  try {
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: 0,
    });
    await ensureDirs();
    const finalThumb = `${THUMBS_DIR}/${id}.jpg`;
    await FileSystem.copyAsync({ from: uri, to: finalThumb });
    return finalThumb;
  } catch (e) {
    console.error("Failed to generate thumbnail:", e);
    return undefined;
  }
}
