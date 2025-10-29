
export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  isLoading = true;
  // Attempt to load pdfjs using a couple of known paths. Keep this in an async
  // IIFE so we can use await and properly set pdfjsLib.
  loadPromise = (async () => {
    try {
      // Try the legacy build first (works with pdfjs-dist v3+ in browser bundles)
      // @ts-expect-error dynamic import of package without types
      const legacy = await import('pdfjs-dist/legacy/build/pdf');
      legacy.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      pdfjsLib = legacy;
      return legacy;
    } catch (e1) {
      try {
        // Fallback to ESM build
        // @ts-expect-error dynamic import of .mjs
        const esm = await import('pdfjs-dist/build/pdf.mjs');
        esm.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        pdfjsLib = esm;
        return esm;
      } catch (e2) {
        throw new Error(
          'Could not load pdfjs-dist. Please install it: `npm install pdfjs-dist` and restart the dev server.'
        );
      }
    } finally {
      isLoading = false;
    }
  })();

  return loadPromise;
}

export async function convertPdfToImage(
  file: File
): Promise<PdfConversionResult> {
  try {
    const lib = await loadPdfJs();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 4 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (context) {
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
    }

    await page.render({ canvasContext: context!, viewport }).promise;

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create a File from the blob with the same name as the pdf
            const originalName = file.name.replace(/\.pdf$/i, "");
            const imageFile = new File([blob], `${originalName}.png`, {
              type: "image/png",
            });

            resolve({
              imageUrl: URL.createObjectURL(blob),
              file: imageFile,
            });
          } else {
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to create image blob",
            });
          }
        },
        "image/png",
        1.0
      ); // Set quality to maximum (1.0)
    });
  } catch (err) {
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${err}`,
    };
  }
}