// Discreet owner access for the "Espace Agence" dashboard.
// NOTE: this is a client-side gate for a demo app with no backend — it is not
// cryptographically secure. Replace AGENCY_PIN with your own value and, for a
// production build, move verification server-side.
export const AGENCY_PIN = '1962';

export function checkPin(input: string): boolean {
  return input.trim() === AGENCY_PIN;
}

/**
 * Reads an image File, downscales it to fit within `maxDim` on its longest edge
 * and returns a compressed JPEG data URL suitable for localStorage storage.
 */
export function fileToDataUrl(file: File, maxDim = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Lecture du fichier impossible.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Image illisible.'));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas indisponible.')); return; }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
