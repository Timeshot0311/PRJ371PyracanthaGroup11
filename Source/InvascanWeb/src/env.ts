import { createEnv } from "@t3-oss/env-core";

export const env = createEnv({
    server: {},
    clientPrefix: "VITE_",
    client: {},
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
});
