"use client";

import { analyzeImage } from "@/actions/analyze-image";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

export default function ImageUploader() {
    const [imageUrl, setImageUrl] = useState<string | undefined>();
    const [file, setFile] = useState<File | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [responseMessage, setResponseMessage] = useState<string>("");

    const maxFileSize = 5 * 1024 * 1024; // 5MB

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

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
            const result = await analyzeImage(base64Image);

            if (!result.success || !result.imgUrl) {
                toast.error("API error occured", {
                    duration: 3000,
                });
                return;
            }

            setImageUrl(result.imgUrl);
            setResponseMessage(result.message);

            toast.success("Successfully analyzed image", {
                duration: 3000,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className='h-48 md:h-60 flex flex-col gap-4'>
                <label
                    htmlFor='file-upload'
                    className='h-full w-full flex p-4 border-dashed border rounded-lg text-muted-foreground items-center justify-center cursor-pointer'
                >
                    <input
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
                <div className='w-full h-48 md:h-60 relative rounded-lg overflow-hidden'>
                    <Image src={imageUrl} alt='Plant image' fill className='object-cover' />
                </div>
            ) : (
                <div className='w-full h-48 md:h-60 relative rounded-lg overflow-hidden flex flex-col justify-center items-center gap-2 text-muted-foreground text-center px-4'>
                    <div>No image selected</div>
                </div>
            )}

            {responseMessage && <div className='mt-4 text-center text-lg col-span-2'>{responseMessage}</div>}
        </>
    );
}
