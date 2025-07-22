"use client";

import { analyzeImage } from "@/actions/analyze-image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

export default function ImageUploader() {
    const [imageUrl, setImageUrl] = useState<string | undefined>();
    const [file, setFile] = useState<File | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [label, setLabel] = useState<string>("");
    const [score, setScore] = useState<number>(0);
    const [isAnalyzed, setIsAnalyzed] = useState(false);

    const maxFileSize = 5 * 1024 * 1024; // 5MB

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            if (selectedFile.size > maxFileSize) {
                toast.error("File too large. Maximum size is 5MB.");
                return;
            }

            setFile(selectedFile);
            setImageUrl(URL.createObjectURL(selectedFile));
            setIsAnalyzed(false);
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

            toast.promise(analyzeImage(base64Image), {
                loading: "Analyzing image...",
                success: (result) => {
                    if (!result.success || !result.imgUrl) {
                        throw new Error("API error occurred");
                    }
                    setImageUrl(result.imgUrl);
                    setLabel(result.label);
                    setScore(result.score);
                    setIsAnalyzed(true);
                    return result.message;
                },
                error: (error) => {
                    const errorMessage = error instanceof Error ? error.message : "Unknown error";
                    setIsAnalyzed(true); // Still mark as analyzed to show "Nothing detected" if appropriate
                    return errorMessage;
                },
                duration: 3000,
                finally: () => setLoading(false), // Move setLoading(false) here
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            toast.error(errorMessage);
            setLoading(false); // Ensure loading is reset for errors outside the promise
        }
    };

    return (
        <>
            <div className='flex flex-col justify-between gap-4 min-h-60'>
                <label
                    htmlFor='file-upload'
                    className='flex-1 w-full flex p-4 border-dashed border rounded-lg text-muted-foreground items-center justify-center cursor-pointer'
                >
                    <Input
                        id='file-upload'
                        type='file'
                        accept='image/jpeg'
                        className='sr-only'
                        onChange={handleImageChange}
                    />
                    <div className='flex flex-col gap-2 items-center text-center'>
                        <div>Upload Image</div>
                        <span className='text-xs'>JPEG (Max 5MB)</span>
                    </div>
                </label>
                <Button className='w-full' disabled={!file || loading} onClick={submitImage}>
                    {loading ? "Analyzing..." : "Analyze image"}
                </Button>
            </div>

            {imageUrl ? (
                <div className='max-w-3xl w-full'>
                    <AspectRatio ratio={4 / 3} className='w-full overflow-hidden rounded-md'>
                        <Image
                            src={imageUrl}
                            alt='Image preview'
                            className='rounded-md object-cover'
                            fill
                            priority
                        />
                    </AspectRatio>
                </div>
            ) : (
                <div className='flex justify-center items-center text-muted-foreground text-center h-48'>
                    <div>No image selected</div>
                </div>
            )}

            {isAnalyzed && (
                <div className='mt-4 text-lg col-span-2'>
                    {label && score > 0 ? (
                        <Alert variant='destructive'>
                            <AlertTitle className='text-lg'>Detected Pyracantha</AlertTitle>
                            <AlertDescription className='flex flex-col gap-1'>
                                <div>Type: {label}</div>
                                <div>Confidence: {score * 100}%</div>
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Alert>
                            <AlertTitle className='text-lg'>No pyracantha detected</AlertTitle>
                        </Alert>
                    )}
                </div>
            )}
        </>
    );
}
