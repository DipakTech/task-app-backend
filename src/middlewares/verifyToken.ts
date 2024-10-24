import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";
import { prisma } from "../db";

// Extend Express Request type to include Prisma User
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Interface for JWT payload
interface JWTPayload {
  id: string;
  iat?: number;
  exp?: number;
}

const { ACCESS_TOKEN_SECRET } = process.env;

if (!ACCESS_TOKEN_SECRET) {
  throw new Error(
    "ACCESS_TOKEN_SECRET is not defined in environment variables",
  );
}

export const verifyAccessToken: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Get token from cookies

    const token = req.cookies["authToken"];

    if (!token) {
      res.status(401).json({
        status: false,
        msg: "Access token not found in cookies",
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as JWTPayload;

    // Find user using Prisma
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      res.status(401).json({
        status: false,
        msg: "User not found",
      });
      return;
    }

    // Remove password from user object before attaching to request
    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword as User;

    next();
  } catch (error) {
    console.log(req.cookies);
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        status: false,
        msg: "Invalid or expired token",
      });
      return;
    }

    console.error("Auth middleware error:", error);
    res.status(500).json({
      status: false,
      msg: "Internal server error",
    });
    return;
  }
};
