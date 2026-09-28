import { Request, Response, NextFunction } from "express";

export const errorHandler = (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error(error);

    const message =
        error instanceof Error
            ? error.message
            : "Internal server error";

    res.status(500).json({
        success: false,
        message,
    });
};