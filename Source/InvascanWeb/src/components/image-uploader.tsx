import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type APIResponse = {
    status: boolean;
    statusCode: number;
    statusMessage: string;
    dynamicModel: { speciesName: string; confidenceScore: number; imageData: string; imageUrl: string } | null;
};

export function ImageUploader() {
    const [file, setFile] = useState<File | undefined>(undefined);
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);
    const [label, setLabel] = useState<string>("");
    const [score, setScore] = useState<number>(0);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            const maxFileSize = 5 * 1024 * 1024; // 5MB

            if (selectedFile.size > maxFileSize) {
                toast.error("File too large. Maximum size is 5MB.");
                return;
            }

            setFile(selectedFile);

            const imageUrl = URL.createObjectURL(selectedFile);
            setImageUrl(imageUrl);
        }
    };

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                if (typeof reader.result === "string") {
                    const base64String = reader.result.split(",")[1];
                    resolve(base64String);
                } else {
                    reject(new Error("Failed to convert image to base64"));
                }
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const submitImage = async () => {
        if (!file) {
            toast.error("No image selected.");
            return;
        }

        setLoading(true);

        try {
            const base64Image = await convertToBase64(file);

            const payload = {
                fileData: base64Image,
                user_id: "2b9d35f8-97e6-47f0-a033-d5675d6344b6",
                latitude: "0",
                longitude: "0",
            };

            const response = await fetch("http://localhost:8080/api/engine/investigate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result: APIResponse = await response.json();

            if (!result.status || !result.dynamicModel) {
                toast.error(result.statusMessage || "API error");
                return;
            }

            setImageUrl(result.dynamicModel.imageUrl ? `data:image/jpeg;base64,${result.dynamicModel.imageUrl}` : "");
            setLabel(result.dynamicModel.speciesName || "");
            setScore(result.dynamicModel.confidenceScore || 0);

            toast.success(result.statusMessage, { duration: 3000 });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            toast.error(errorMessage);
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
            <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='flex flex-col justify-between gap-4 min-h-60'>
                    <label
                        htmlFor='file-upload'
                        className='flex-1 w-full flex p-4 border-dashed border-2 border-primary rounded-sm text-muted-foreground items-center justify-center cursor-pointer'
                    >
                        <input
                            id='file-upload'
                            type='file'
                            accept='image/jpeg, image/jpg, image/png'
                            className='sr-only'
                            onChange={handleImageChange}
                        />
                        <div className='flex flex-col gap-2 items-center text-center'>
                            <Camera className='size-10 text-primary' />
                            <div className='text-base'>{file ? file.name : "Select an image to get started"}</div>
                        </div>
                    </label>
                    <Button className='w-full' disabled={!file || loading} onClick={submitImage}>
                        {loading ? "Analyzing..." : "Analyze image"}
                    </Button>
                </div>

                {imageUrl ?
                    <div className='relative'>
                        <img src={imageUrl} alt='Image preview' className='rounded-sm' />
                        <Button
                            className='absolute top-2 right-2'
                            variant='ghost'
                            size='icon'
                            onClick={() => {
                                setFile(undefined);
                                setImageUrl(undefined);
                            }}
                        >
                            <Trash className='text-destructive' />
                        </Button>
                    </div>
                :   <div className='flex justify-center items-center text-muted-foreground text-center min-h-60'>
                        <div>No image selected</div>
                    </div>
                }
            </CardContent>
        </Card>
    );
}
