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
    imageData: string;
    imageUrl: string;
  } | null;
};

const API_URL = "http://localhost:8000"; // via nginx proxy

export function ImageUploader() {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [label, setLabel] = useState<string>("");
  const [score, setScore] = useState<number>(0);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setImageUrl(URL.createObjectURL(f));
  };

  // --- resize/compress helpers ---
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

  const downscaleToLimit = async (f: File, maxDim = 1800, startQ = 0.9, targetBytes = 4_000_000) => {
    let dataUrl = await fileToDataURL(f);
    const img = await loadImage(dataUrl);

    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D not available");
    ctx.drawImage(img, 0, 0, w, h);

    const byteLen = (du: string) => {
      const s = du.split(",")[1] ?? "";
      const padding = s.endsWith("==") ? 2 : s.endsWith("=") ? 1 : 0;
      return Math.floor((s.length * 3) / 4) - padding;
    };

    let q = startQ;
    let out = canvas.toDataURL("image/jpeg", q);
    for (let i = 0; i < 7 && byteLen(out) > targetBytes; i++) {
      q = Math.max(0.6, q - 0.1);
      out = canvas.toDataURL("image/jpeg", q);
    }
    return out;
  };

  const dataUrlToBase64 = (dataUrl: string) => (dataUrl.startsWith("data:") ? dataUrl.split(",")[1] : dataUrl);

  const submitImage = async () => {
    if (!file) return toast.error("No image selected.");
    setLoading(true);
    try {
      const compressed = await downscaleToLimit(file, 1800, 0.9, 4_000_000);
      const base64 = dataUrlToBase64(compressed);

      // Matches /api/engine/investigate schema
      const payload = {
        user_id: "2b9d35f8-97e6-47f0-a033-d5675d6344b6",
        image_data: base64,
        latitude: 0,
        longitude: 0,
        address: ""
      };

      const res = await fetch(`${API_URL}/api/engine/investigate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Helpful debugging if backend returns non-JSON on error:
      let result: APIResponse;
      try {
        result = await res.json();
      } catch {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      if (!res.ok || !result.status || !result.dynamicModel) {
        throw new Error(result.statusMessage || `Request failed (${res.status})`);
      }

      setImageUrl(
        result.dynamicModel.imageUrl
          ? `data:image/jpeg;base64,${result.dynamicModel.imageUrl}`
          : imageUrl
      );
      setLabel(result.dynamicModel.speciesName || "");
      setScore(result.dynamicModel.confidenceScore || 0);
      toast.success(result.statusMessage, { duration: 3000 });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error(msg);
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
          <label htmlFor="file-upload"
                 className="flex-1 w-full flex p-4 border-dashed border-2 border-primary rounded-sm text-muted-foreground items-center justify-center cursor-pointer">
            <input id="file-upload" type="file" accept="image/jpeg,image/jpg,image/png"
                   className="sr-only" onChange={handleImageChange}/>
            <div className="flex flex-col gap-2 items-center text-center">
              <Camera className="size-10 text-primary" />
              <div className="text-base">{file ? file.name : "Select an image to get started"}</div>
            </div>
          </label>
          <Button className="w-full" disabled={!file || loading} onClick={submitImage}>
            {loading ? "Analyzing..." : "Analyze image"}
          </Button>
        </div>

        {imageUrl ? (
          <div className="relative">
            <img src={imageUrl} alt="Image preview" className="rounded-sm" />
            <Button className="absolute top-2 right-2" variant="ghost" size="icon"
                    onClick={() => { setFile(undefined); setImageUrl(undefined); }}>
              <Trash className="text-destructive" />
            </Button>
            {!!label && (
              <div className="mt-2 text-sm">
                <div><b>Label:</b> {label}</div>
                <div><b>Score:</b> {score.toFixed(3)}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center items-center text-muted-foreground text-center min-h-60">
            <div>No image selected</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
