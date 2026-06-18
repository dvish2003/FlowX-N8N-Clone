import { User } from "@/models/userSchema";
import mongoose from "mongoose";

export class UserService {
  private static instance: UserService;

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }
  async findUserByEmail(email: string) {
    const user = await User.findOne({ email: email.toLowerCase() });
    return user;
  }

  async registerUser(props: {
    email: string;
    password?: string;
    verificationCode?: string;
    name?: string;
  }) {
    const { email: rawEmail, password, verificationCode, name } = props;
    const email = rawEmail.toLowerCase();
    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser.isVerified) {
      throw new Error("User already exists and is verified");
    }

    if (existingUser) {
        // Update existing unverified user
        if (password) {
            const bcrypt = require('bcryptjs');
            existingUser.password = await bcrypt.hash(password, 10);
        }
        if (verificationCode) existingUser.verificationCode = verificationCode;
        if (name) existingUser.name = name;
        await existingUser.save();
        return existingUser;
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const user = new User({
      email,
      password: hashedPassword,
      verificationCode,
      name,
      isVerified: false,
    });

    return await user.save();
  }

  async verifyUser(email: string, code: string) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new Error("User not found");
    if (user.verificationCode !== code) throw new Error("Invalid verification code");

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();
    return user;
  }

  async updateVerificationCode(email: string, code: string) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new Error("User not found");
    user.verificationCode = code;
    await user.save();
  }

  async createUser(props: {
    id: string;
    name: string;
    email: string;
    image: string;
    access_token?: string;
    refresh_token?: string;
  }) {
    const { id, name, email: rawEmail, image, access_token, refresh_token } = props;
    const email = rawEmail.toLowerCase();

    const existingUser = await User.findOne({ email: email });

    if (!existingUser) {
      const user = new User({
        name: name,
        email: email,
        image: image,
        googleId: id,
        googleAccessToken: access_token,
        googleRefreshToken: refresh_token,
        isVerified: true, // Google users are verified
      });

      const savedUser = await user.save();

      return {
        authData: {
          ...savedUser.toObject(),
        },
      };
    } else {
      const user = await User.findByIdAndUpdate(
        existingUser._id,
        {
          googleAccessToken: access_token,
          googleRefreshToken: refresh_token,
          googleId: id, // Ensure googleId is set
          isVerified: true,
        },
        { new: true, runValidators: true }
      );
      const updateUser = user?.toObject();

      return {
        authData: {
          ...updateUser,
        },
      };
    }
  }
}
