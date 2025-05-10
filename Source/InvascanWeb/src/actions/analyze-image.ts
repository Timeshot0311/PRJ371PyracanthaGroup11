"use server";

export const analyzeImage = async (base64Image: string) => {
    try {
        const apiUrl = "http://localhost:8006";

        const response = await fetch(`${apiUrl}/identifyasync`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userid: "12345",
                imagedata: base64Image,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            return {
                success: true,
                message: data.message,
                imgUrl: data.img ? `data:image/jpeg;base64,${data.img}` : undefined,
            };
        } else {
            return {
                success: false,
                message: data.message,
                imgUrl: undefined,
            };
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return { success: false, message: errorMessage, imgUrl: undefined };
    }
};
