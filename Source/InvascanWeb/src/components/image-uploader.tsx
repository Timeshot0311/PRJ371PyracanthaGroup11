import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { $analyzeImage } from "@/server/functions/analyze-image";
import { Camera, Trash } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { toast } from "sonner";

export function ImageUploader() {
    const [uploadedImage, setUploadedImage] = useState<File | undefined>();
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | undefined>();
    const [isPending, setIsPending] = useState(false);
    const [speciesLabel, setSpeciesLabel] = useState("");
    const [confidenceScore, setConfidenceScore] = useState(0);

    const convertToBase64 = async (file: File): Promise<string> => {
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

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const uploadedFile = e.target.files[0];
            setUploadedImage(uploadedFile);

            const imageUrl = URL.createObjectURL(uploadedFile);
            setUploadedImageUrl(imageUrl);

            setSpeciesLabel("");
            setConfidenceScore(0);
        }
    };

    const submitImage = async () => {
        if (!uploadedImage) {
            return toast.info("Please select an image");
        }

        setIsPending(true);

        try {
            const base64Image = await convertToBase64(uploadedImage);
            const apiResponse = await $analyzeImage({ data: base64Image });

            if (apiResponse.statusCode !== 200) {
                return toast.error("An API error occurred. Please try again", {
                    duration: 4000,
                });
            }

            if (!apiResponse.dynamicModel) {
                toast.info("No pyracantha detected!");
                setSpeciesLabel("No pyracantha detected!");
                setConfidenceScore(0);
                return;
            }

            const { imageUrl, speciesName, confidenceScore } = apiResponse.dynamicModel;

            setUploadedImageUrl(imageUrl);
            setSpeciesLabel(speciesName);
            setConfidenceScore(confidenceScore);

            toast.success("Success", {
                duration: 4000,
            });
        } catch (error) {
            console.error(error);
            toast.error("Internal Server Error");
        } finally {
            setIsPending(false);
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
                        className='flex-1 w-full flex p-4 border-dashed border-2 border-primary rounded-md text-muted-foreground items-center justify-center cursor-pointer'
                    >
                        <input
                            id='file-upload'
                            type='file'
                            accept='image/jpeg,image/jpg,image/png'
                            className='sr-only'
                            onChange={handleImageChange}
                        />
                        <div className='flex flex-col gap-2 items-center text-center'>
                            <Camera className='size-10 text-primary' />
                            <div className='text-base'>
                                {uploadedImage ? uploadedImage.name : "Select an image to get started"}
                            </div>
                        </div>
                    </label>
                    <Button className='w-full' disabled={!uploadedImage || isPending} onClick={submitImage}>
                        {isPending ? "Analyzing..." : "Analyze image"}
                    </Button>
                </div>

                <div className='relative flex flex-col gap-2'>
                    {uploadedImageUrl ?
                        <img
                            src={uploadedImageUrl}
                            alt='Image preview'
                            className='rounded-md border border-muted shadow-sm'
                        />
                    :   <div className='flex justify-center items-center text-muted-foreground text-center min-h-60 border border-dashed rounded-md'>
                            <div>No image selected</div>
                        </div>
                    }
                    {uploadedImageUrl && (
                        <Button
                            className='absolute top-2 right-2 bg-white'
                            size='icon'
                            onClick={() => {
                                setUploadedImage(undefined);
                                setUploadedImageUrl(undefined);
                                setSpeciesLabel("");
                                setConfidenceScore(0);
                            }}
                            title='Clear Image'
                        >
                            <Trash className='text-destructive' />
                        </Button>
                    )}
                    {!!speciesLabel && (
                        <div className='text-sm flex flex-col gap-y-2'>
                            <div>
                                <b>Species:</b> {speciesLabel}
                            </div>
                            {confidenceScore > 0 && (
                                <div>
                                    <b>Confidence:</b> {(confidenceScore * 100).toFixed(2)}%
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
