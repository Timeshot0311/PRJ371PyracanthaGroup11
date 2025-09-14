import { env } from "@/env";
import { createServerFn } from "@tanstack/react-start";

export type APIRequestBody = {
    user_id: string;
    image_data: string;
    latitude: number;
    longitude: number;
    address: string;
};

export type APIResponseBody = {
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

const BACKEND_API_URL = env.BACKEND_API_URL;

export const $analyzeImage = createServerFn({ method: "POST" })
    .validator((img: string) => img)
    .handler(async ({ data }): Promise<APIResponseBody> => {
        try {
            //TODO should pass in the actual auth details eventually.
            const requestBody: APIRequestBody = {
                user_id: "2b9d35f8-97e6-47f0-a033-d5675d6344b6",
                image_data: data,
                latitude: 0,
                longitude: 0,
                address: "",
            };

            const request = await fetch(`${BACKEND_API_URL}/api/engine/investigate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            const response: APIResponseBody = await request.json();

            if (response.statusCode !== 200 || !response.dynamicModel) {
                return {
                    status: response.status,
                    statusCode: response.statusCode,
                    statusMessage: response.statusMessage,
                    dynamicModel: null,
                };
            }

            return {
                status: response.status,
                statusCode: response.statusCode,
                statusMessage: response.statusMessage,
                dynamicModel: response.dynamicModel,
            };
        } catch (error) {
            console.error(error);
            return {
                status: false,
                statusCode: 500,
                statusMessage: "Internal Server Error",
                dynamicModel: null,
            };
        }
    });
