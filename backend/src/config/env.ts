import "dotenv/config";
import {z} from "zod";



const envSchema = z.object({
    NODE_ENV: z
        .enum(["development","production","test"])
        .default("development"),

    PORT: z.coerce.number().default(5000),

    MONGODB_URI: z.string().min(1),

    JWT_SECRET: z.string().min(32),

    JWT_REFRESH_SECRET: z.string().min(32),

    CLIENT_URL: z.string().url(),

    SMTP_HOST: z.string().min(1),

    SMTP_PORT: z.coerce.number().min(1),

    SMTP_SECURE: z.coerce.boolean(),

    SMTP_USER: z.string().min(1),

    SMTP_PASS: z.string().min(1),

    EMAIL_FROM: z.string().email(),

    FRONTEND_URL: z.string().url(),

    GOOGLE_CLIENT_ID: z.string().min(1),

    GOOGLE_CLIENT_SECRET: z.string().min(1),

    GOOGLE_CALLBACK_URL: z.string().url(),

    

    
});

const parsedEnv = envSchema.safeParse(process.env);

if(!parsedEnv.success){
    console.error("❌ Invalid environment variables:");
    console.error(parsedEnv.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = parsedEnv.data;