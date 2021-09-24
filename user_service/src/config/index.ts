import { config } from "dotenv";
import { resolve as Resolve } from "path";

export const Config = async () => {
    if (process.env.NODE_ENV === "dev") {
        console.log(":: YOU ARE ON DEV MODE ::");
        config({ path: Resolve(__dirname, './dev.env') });
    } else if (process.env.NODE_ENV === "stage") {
        console.log(":: YOU ARE ON STAGE MODE ::");
        config({ path: Resolve(__dirname, './stage.env') });
    }

    return true;
}
