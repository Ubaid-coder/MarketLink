import app from '../src/app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { verifyEmailTransport } from "./services/email.service.js";

const startServer = async (): Promise<void> => {
    await connectDB();


    const server = app.listen(env.PORT, () => {
        console.log(`Server running on http://localhost:${env.PORT}`);
    });

    verifyEmailTransport()
        .then(() => {
            console.log("✅ SMTP connection successful");
        })
        .catch((error) => {
            console.error("❌ SMTP connection failed:", error);
        });


    const shutdown = (signal: string) => {
        console.log(`\n${signal} received. Shutting down...`);

        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
};

startServer();