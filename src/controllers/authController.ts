import { Request, RequestHandler, Response } from "express";
import bcrypt from "bcrypt";
import { validateEmail } from "../utils/validation";
import { prisma } from "../db";
import { createAccessToken } from "../utils/jwtToken";

export const register: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ msg: "Please fill all the fields" });
      return;
    }

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      res.status(400).json({ msg: "Please send string values only" });
      return;
    }

    if (password.length < 4) {
      res.status(400).json({
        msg: "Password length must be atleast 4 characters",
      });
      return;
    }

    if (!validateEmail(email)) {
      res.status(400).json({ msg: "Invalid Email" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      res.status(400).json({ msg: "This email is already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(200).json({
      msg: "Congratulations!! Account has been created for you..",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const login: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, password } = req.body;
    console.log(req.body, "request body..");

    if (!email || !password) {
      res.status(400).json({
        status: false,
        msg: "Please enter all details!!",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      res.status(400).json({
        status: false,
        msg: "This email is not registered!!",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(400).json({
        status: false,
        msg: "Password incorrect!!",
      });
      return;
    }

    const userWithoutPassword = {
      email: user.email,
      name: user.name,
    };

    const token = createAccessToken(user, res);

    res.status(200).json({
      token,
      user: userWithoutPassword,
      status: true,
      msg: "Login successful..",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      msg: err,
    });
  }
};

export const logout: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    res.clearCookie("token");
    res.status(200).json({ msg: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
