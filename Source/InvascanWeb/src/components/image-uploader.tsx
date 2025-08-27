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

// const API_URL = "http://localhost:8080";
const API_URL = "http://invascanapi_container:80";

// --- helpers to detect & format image sources ---
const isDataUrl = (s: string) => s.startsWith("data:image/");
const isHttpUrl = (s: string) => /^https?:\/\//i.test(s);
const isB64 = (s: string) => /^[A-Za-z0-9+/=\r\n]+$/.test(s) && s.length > 100;

function toDisplaySrc(fromApiUrl?: string, fromApiData?: string): string | undefined {
  if (fromApiUrl && isDataUrl(fromApiUrl)) return fromApiUrl;
  const b64 =
    (fromApiUrl && isB64(fromApiUrl)) ? fromApiUrl :
    (fromApiData && isB64(fromApiData)) ? fromApiData :
    undefined;
  if (b64) return `data:image/jpeg;base64,${b64}`;
  if (fromApiUrl && isHttpUrl(fromApiUrl)) return fromApiUrl;
  if (fromApiUrl && fromApiUrl.startsWith("/")) return `${API_URL}${fromApiUrl}`;
  return undefined;
}

// --- image utilities ---
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

const b64Size = (s: string) => {
  const base64 = s.startsWith("data:") ? s.split(",")[1] : s;
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
};

// downscale longest side, then quality, until under target
async function downscaleToLimit(
  f: File,
  maxDim = 1280,
  startQ = 0.9,
  targetBytes = 2_000_000
) {
  const dataUrl = await fileToDataURL(f);
  const img = await loadImage(dataUrl);

  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  let w = Math.max(1, Math.round(img.width * scale));
  let h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D not available");

  let q = startQ;
  let out = "";

  for (let i = 0; i < 10; i++) {
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    out = canvas.toDataURL("image/jpeg", q);

    if (b64Size(out) <= targetBytes) return { dataUrl: out, outW: w, outH: h };

    if (q > 0.6) q = Math.max(0.6, q - 0.1);
    else {
      w = Math.max(720, Math.floor(w * 0.85));
      h = Math.max(720, Math.floor(h * 0.85));
    }
  }
  return { dataUrl: out, outW: w, outH: h };
}

// make a 512x512 “letterboxed” square (helps strict models)
async function letterboxSquare(f: File, target = 512, quality = 0.9, bg = "#ffffff") {
  const dataUrl = await fileToDataURL(f);
  const img = await loadImage(dataUrl);

  const scale = Math.min(target / img.width, target / img.height);
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const x = Math.floor((target - w) / 2);
  const y = Math.floor((target - h) / 2);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D not available");

  canvas.width = target;
  canvas.height = target;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, target, target);
  ctx.drawImage(img, x, y, w, h);

  const out = canvas.toDataURL("image/jpeg", quality);
  return { dataUrl: out, outW: target, outH: target };
}

const dataUrlToBase64 = (dataUrl: string) => (dataUrl.startsWith("data:") ? dataUrl.split(",")[1] : dataUrl);

// --- content-type aware fetch wrapper ---
async function callEngine(base64: string) {
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

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();
  let json: APIResponse | undefined;

  if (contentType.toLowerCase().includes("application/json") && text.trim() !== "") {
    try { json = JSON.parse(text); } catch { /* fallthrough */ }
  }
  return { ok: res.ok, status: res.status, json, text, contentType };
}

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
      const original = await fileToDataURL(file);
      console.log("[Uploader] original bytes ≈", b64Size(original));

      // 1) normal compressed attempt
      const comp = await downscaleToLimit(file, 1280, 0.9, 2_000_000);
      console.log("[Uploader] compressed bytes ≈", b64Size(comp.dataUrl), "dims", comp.outW, "x", comp.outH);
      let r = await callEngine(dataUrlToBase64(comp.dataUrl));

      // 2) retry with letterboxed 512 if the server complains or returns bad JSON
      const needsRetry =
        !r.ok || !r.json || !r.json.status || !r.json.dynamicModel ||
        /internal.*engine.*error/i.test(r.json?.statusMessage || "");
      if (needsRetry) {
        console.warn("[Uploader] retrying with letterboxed 512x512");
        const sq = await letterboxSquare(file, 512, 0.9, "#ffffff");
        console.log("[Uploader] square bytes ≈", b64Size(sq.dataUrl), "dims", sq.outW, "x", sq.outH);
        r = await callEngine(dataUrlToBase64(sq.dataUrl));
      }

      // --- Web-side fallback for server’s 500 on “no detections” ---
      if (!r.ok || !r.json) {
        // Treat HTTP 500/non-JSON as NO DETECTIONS instead of an error
        setLabel("No detections found");
        setScore(0);
        toast.info("No detections found");
        return;
      }

      if (!r.json.status || !r.json.dynamicModel) {
        // API responded but has no dynamicModel – also treat as NO DETECTIONS
        const msg = r.json.statusMessage || "No detections found";
        setLabel("No detections found");
        setScore(0);
        toast.info(msg);
        return;
      }

      // success path
      const display = toDisplaySrc(r.json.dynamicModel.imageUrl, r.json.dynamicModel.imageData);
      if (display) setImageUrl(display);

      setLabel(r.json.dynamicModel.speciesName || "");
      setScore(r.json.dynamicModel.confidenceScore || 0);
      toast.success(r.json.statusMessage || "OK", { duration: 3000 });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error(msg);
      console.error("[Uploader] error:", msg);
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
