import { User } from "@prisma/client";
import jwt from "jsonwebtoken";
const accessToken = process.env.ACCESS_Token_SECRET!;

export const createAccessToken = (payload: User) => {
  return jwt.sign(payload, accessToken, { expiresIn: "1D" });
};
