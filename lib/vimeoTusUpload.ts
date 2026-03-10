import * as tus from "tus-js-client";

export function uploadVideoTus(
  file: File,
  uploadLink: string,
  onProgress?: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const upload = new tus.Upload(file, {
      uploadUrl: uploadLink, // 🔥 IMPORTANT
      chunkSize: 5 * 1024 * 1024, // 5 MB
      retryDelays: [0, 1000, 3000, 5000],
      metadata: {
        filename: file.name,
        filetype: file.type,
      },
      onError(error) {
        reject(error);
      },
      onProgress(bytesUploaded, bytesTotal) {
        const pct = Math.round((bytesUploaded / bytesTotal) * 100);
        onProgress?.(pct);
      },
      onSuccess() {
        resolve();
      },
    });

    upload.start();
  });
}
