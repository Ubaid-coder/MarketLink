import { User } from '../models/user.model.js';
import {
    comparePassword,
    hashPassword
} from '../utils/password.js';
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
} from '../utils/jwt.js';
import { Types } from "mongoose";
import { createSession, revokeSession, findSessionByToken, revokeAllUserSessions } from "./session.service.js";
import { createAuthSession } from "../utils/token.js";

interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

interface LoginInput {
    email: string;
    password: string;
    userAgent?: string;
    ipAddress?: string;
}

export const registerUser = async ({
    name, email, password
}: RegisterInput) => {
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
        email: normalizedEmail,
    });

    if (existingUser) {
        throw new Error("User already exists");
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    const sessionId = new Types.ObjectId();

    const accessToken = generateAccessToken({
        userId: user._id.toString(),
        role: user.role,
    });

    const refreshToken = generateRefreshToken({
        userId: user._id.toString(),
        sessionId: sessionId.toString(),
    });

    return {
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
        },
        accessToken,
        refreshToken,
    };
};

export const loginUser = async ({
    email,
    password,
    userAgent,
    ipAddress,
}: LoginInput) => {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
        email: normalizedEmail,
    }).select("+password");

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const passwordMatches = await comparePassword(
        password,
        user.password
    );

    if (!passwordMatches) {
        throw new Error("Invalid email or password");
    }

    const { accessToken, refreshToken } =
        await createAuthSession({
            userId: user._id.toString(),
            role: user.role,
            userAgent,
            ipAddress,
        });
    return {
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
        },
        accessToken,
        refreshToken,
    };
};

export const getCurrentUser = async (userId: string) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
    };
};

export const refreshAccessToken = async (
    refreshToken: string
) => {
    const payload = verifyRefreshToken(refreshToken);

    const session = await findSessionByToken(refreshToken);

    if (!session) {
        throw new Error("Invalid refresh token");
    }

    // if (session.revokedAt) {
    //     // Possible token reuse.
    //     await revokeAllUserSessions(
    //         session.userId.toString()
    //     );

    //     throw new Error("Refresh token reuse detected");
    // }

    if (session.expiresAt < new Date()) {
        throw new Error("Refresh token expired");
    }

    if (
        session._id.toString() !== payload.sessionId
    ) {
        throw new Error("Invalid refresh session");
    }

    const user = await User.findById(session.userId);

    if (!user) {
        throw new Error("User not found");
    }

    // Rotate the old session.
    await revokeSession(session._id.toString());

    const newSessionId = new Types.ObjectId();

    const newRefreshToken = generateRefreshToken({
        userId: user._id.toString(),
        sessionId: newSessionId.toString(),
    });

    const newAccessToken = generateAccessToken({
        userId: user._id.toString(),
        role: user.role,
    });

    await createSession({
        sessionId: newSessionId,
        userId: user._id.toString(),
        refreshToken: newRefreshToken,
        expiresAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        ),
    });

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};