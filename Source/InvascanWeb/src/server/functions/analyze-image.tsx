import { createServerFn } from "@tanstack/react-start";

type ClientPayload = {
    success: boolean;
    message: string;
    imgUrl: string;
    label: string;
    score: number;
};

type APIResponse = {
    status: boolean;
    statuscode: number;
    message: string;
    img: string;
    labelname: string;
    score: number;
};

export const $analyzeImage = createServerFn()
    .validator((base64Image: string) => base64Image)
    .handler(async ({ data }): Promise<ClientPayload> => {
        try {
            const apiUrl = "http://localhost:8006";
            console.log(`calling api ${apiUrl}`);

            const response = await fetch(`${apiUrl}/identifyasync`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userid: "12345",
                    imagedata: data,
                }),
            });

            const result: APIResponse = await response.json();

            if (!response.ok) {
                return {
                    success: result.status,
                    message: result.message,
                    imgUrl: "",
                    label: "",
                    score: 0,
                };
            }

            return {
                success: result.status,
                message: result.message,
                imgUrl: result.img ? `data:image/jpeg;base64,${result.img}` : "",
                label: result.labelname,
                score: result.score,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            return { success: false, message: errorMessage, imgUrl: "", label: "", score: 0 };
        }
    });
