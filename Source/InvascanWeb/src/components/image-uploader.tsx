// src/components/image-uploader.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type APIResponse = {
  status: boolean;
  statusCode: number;
  statusMessage: string;
  dynamicModel: {
    speciesName: string;
    confidenceScore: number;
    imageData: string;  // may be empty
    imageUrl: string;   // may be base64 OR a URL (/images/... or http...)
  } | null;
};

const API_URL = "http://localhost:8000"; // nginx proxy

// ------- helpers to detect & format image sources -------
const isProbablyDataUrl = (s: string) => s.startsWith("data:image/");
const isProbablyHttpUrl = (s: string) => /^https?:\/\//i.test(s);
const isProbablyBase64 = (s: string) => /^[A-Za-z0-9+/=\r\n]+$/.test(s) && s.length > 100;

function toDisplaySrc(fromApiUrl: string | undefined, fromApiData: string | undefined): string | undefined {
  // Highest confidence: explicit data URL
  if (fromApiUrl && isProbablyDataUrl(fromApiUrl)) return fromApiUrl;

  // Base64 provided either in imageUrl or imageData -> build data URL
  const b64 = fromApiUrl && isProbablyBase64(fromApiUrl) ? fromApiUrl
            : fromApiData && isProbablyBase64(fromApiData) ? fromApiData
            : undefined;
  if (b64) return `data:image/jpeg;base64,${b64}`;

  // Absolute URL returned by API
  if (fromApiUrl && isProbablyHttpUrl(fromApiUrl)) return fromApiUrl;

  // Relative path like /images/abc.jpg -> route via nginx
  if (fromApiUrl && fromApiUrl.startsWith("/")) return `${API_URL}${fromApiUrl}`;

  return undefined;
}

// ------- resize/compress to keep payloads small & fast -------
const fileToDataURL = (f: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => (typeof r.result === "string" ? resolve(r.result) : reject(new Error("read error")));
    r.onerror = reject;
    r.readAsDataURL(f);
  });

const loadImage = (dataUrl: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });

// More aggressive defaults to help large images succeed
async function downscaleToLimit(
  f: File,
  maxDim = 1280,           // ↓ from 1800 to reduce pixel count
  startQ = 0.9,
  targetBytes = 2_000_000  // ~2 MB target
) {
  let dataUrl = await fileToDataURL(f);
  const img = await loadImage(dataUrl);

  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  let w = Math.max(1, Math.round(img.width * scale));
  let h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D not available");

  const byteLen = (du: string) => {
    const s = du.split(",")[1] ?? "";
    const padding = s.endsWith("==") ? 2 : s.endsWith("=") ? 1 : 0;
    return Math.floor((s.length * 3) / 4) - padding;
  };

  let q = startQ;
  let out: string;

  // up to 10 iterations: reduce quality, then dimensions further
  for (let i = 0; i < 10; i++) {
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    out = canvas.toDataURL("image/jpeg", q);

    if (byteLen(out) <= targetBytes) return out;

    // step down
    if (q > 0.6) q = Math.max(0.6, q - 0.1);
    else {
      w = Math.max(720, Math.floor(w * 0.85));
      h = Math.max(720, Math.floor(h * 0.85));
    }
  }
  // best-effort result
  return out!;
}

const dataUrlToBase64 = (dataUrl: string) => (dataUrl.startsWith("data:") ? dataUrl.split(",")[1] : dataUrl);

export function ImageUploader() {
  const [file, setFile] = useState<File | undefined>();
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState("");
  const [score, setScore] = useState(0);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setImageUrl(URL.createObjectURL(f));
  };

  const submitImage = async () => {
    if (!file) return toast.error("No image selected.");
    setLoading(true);
    try {
      const compressed = await downscaleToLimit(file, 1280, 0.9, 2_000_000);
      const base64 = dataUrlToBase64(compressed);

      const payload = {
        user_id: "2b9d35f8-97e6-47f0-a033-d5675d6344b6",
        image_data: base64,
        latitude: 0,
        longitude: 0,
        address: "",
      };

      const res = await fetch(`${API_URL}/api/engine/investigate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let json: APIResponse;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(`Invalid JSON (HTTP ${res.status}): ${text}`);
      }

      if (!res.ok || !json.status || !json.dynamicModel) {
        throw new Error(json.statusMessage || `Request failed (${res.status})`);
      }

      const display = toDisplaySrc(json.dynamicModel.imageUrl, json.dynamicModel.imageData);
      if (display) setImageUrl(display);

      setLabel(json.dynamicModel.speciesName || "");
      setScore(json.dynamicModel.confidenceScore || 0);
      toast.success(json.statusMessage, { duration: 3000 });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error(msg);
      console.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pyracantha Image Analyzer</CardTitle>
        <CardDescription>Upload an image to start analyzing</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col justify-between gap-4 min-h-60">
          <label
            htmlFor="file-upload"
            className="flex-1 w-full flex p-4 border-dashed border-2 border-primary rounded-md text-muted-foreground items-center justify-center cursor-pointer"
          >
            <input
              id="file-upload"
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              className="sr-only"
              onChange={handleImageChange}
            />
            <div className="flex flex-col gap-2 items-center text-center">
              <Camera className="size-10 text-primary" />
              <div className="text-base">{file ? file.name : "Select an image to get started"}</div>
            </div>
          </label>
          <Button className="w-full" disabled={!file || loading} onClick={submitImage}>
            {loading ? "Analyzing..." : "Analyze image"}
          </Button>
        </div>

        <div className="relative min-h-60 flex flex-col gap-2">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Image preview"
              className="rounded-md border border-muted shadow-sm max-h-80 object-contain"
            />
          ) : (
            <div className="flex justify-center items-center text-muted-foreground text-center min-h-60 border border-dashed rounded-md">
              <div>No image selected</div>
            </div>
          )}
          {imageUrl && (
            <Button
              className="absolute top-2 right-2"
              variant="ghost"
              size="icon"
              onClick={() => {
                setFile(undefined);
                setImageUrl(undefined);
                setLabel("");
                setScore(0);
              }}
              title="Clear"
            >
              <Trash className="text-destructive" />
            </Button>
          )}
          {!!label && (
            <div className="text-sm">
              <div><b>Label:</b> {label}</div>
              <div><b>Score:</b> {score.toFixed(3)}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
