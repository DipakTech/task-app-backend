import { User } from "@prisma/client";
import jwt from "jsonwebtoken";
const accessToken = process.env.ACCESS_Token_SECRET!;
import { Response } from "express";

export const createAccessToken = (payload: User, res: Response) => {
  const token = jwt.sign(payload, accessToken, { expiresIn: "7d" });

  res.cookie("authToken", token, {
    httpOnly: false,
  });
};
