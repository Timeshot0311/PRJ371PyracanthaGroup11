"use server";

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

export const analyzeImage = async (base64Image: string): Promise<ClientPayload> => {
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

    const data: APIResponse = await response.json();

    if (response.ok) {
      return {
        success: data.status,
        message: data.message,
        imgUrl: data.img ? `data:image/jpeg;base64,${data.img}` : "",
        label: data.labelname,
        score: data.score,
      };
    } else {
      return {
        success: data.status,
        message: data.message,
        imgUrl: "",
        label: "",
        score: 0,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: errorMessage, imgUrl: "", label: "", score: 0 };
  }
};
