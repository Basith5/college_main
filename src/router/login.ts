import express, { NextFunction, Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { ValidationError } from "zod-validation-error";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { userChangePasswordSchemaType, loginSchema, loginTokenType, loginType, userChangePasswordSchema } from '../model/login';

const secretKey = 'basith@jayaprakash_salman-siraj';
const encryptKey = '"9y/B?E(H+MbQeThWmZq4t7w!z%C&F)J@NcRfUjXn2r5u8x/A?D(G-KaPdSgVkYp3"';

const prisma = new PrismaClient();

export const loginRouter = express.Router();

loginRouter.post("/login", login);
loginRouter.get("/changePassword", changePass);

//#region
export function encrypt(password: string, key: string): string {
  const hmac = crypto.createHmac('sha256', key);
  hmac.update(password);
  return hmac.digest('hex');
}

export function generateSignInToken(data: any, secret: string): string {
  return jwt.sign(data, secret, { expiresIn: '1d' });
}

export function allowAdminOnly(req: Request, res: Response, next: NextFunction) {

  const xLoginToken = req.headers['token'];

  if (!xLoginToken) {
    return res.status(401).json({
      msg: "The request was missing a login token",
    
    })
  }

  if (typeof xLoginToken !== "string") {
    return res.status(401).json({
      msg: "The TOKEN header must be a string",
      
    });
  }

  try {

    var tokenData = jwt.verify(xLoginToken, secretKey) as loginTokenType

    if (tokenData && (tokenData.role == "Admin")) {
      req.user = tokenData
      next()
    } else {
      return res.status(403).json({
        msg: "You are Staff not authorized to access this request",
    
      });
    }
  } catch (e) {
    return res.status(403).json({
      msg: "You are not authorized to access this request",
      
    });
  }
}

export function allowStaffOnly(req: Request, res: Response, next: NextFunction) {

  const xLoginToken = req.headers['token'];

  if (!xLoginToken) {
    return res.status(401).json({
      msg: "The request was missing a login token",
    
    })
  }

  if (typeof xLoginToken !== "string") {
    return res.status(401).json({
      msg: "The TOKEN header must be a string",
      
    });
  }

  try {

    var tokenData = jwt.verify(xLoginToken, secretKey) as loginTokenType

    if (tokenData && (tokenData.role == "Admin" || tokenData.role == "Staff")) {
      req.user = tokenData
      next()
    } else {
      return res.status(403).json({
        msg: "You are Staff not authorized to access this request",
    
      });
    }
  } catch (e) {
    return res.status(403).json({
      msg: "You are not authorized to access this request",
      
    });
  }
}

async function login(req: Request, res: Response) {

  const validationResult = loginSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      msg: "The request was missing required parameters ",
    
    });
  }

  const requestBody: loginType = validationResult.data;

  const encryptedPassword: string = encrypt(requestBody.password, encryptKey);

  const user = await prisma.user.findFirst({
    where: {
      email: requestBody.email,
      password: requestBody.password,
    },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
      uname: true
    }
  });

  if (!user) {
    return res.status(409).json({
      msg: "Invalid username or password"
      
    });
  }

  const loginTokenData: loginTokenType = { ...user, role: user.role };
  const loginToken = generateSignInToken(loginTokenData, secretKey);

  return res.status(200).json({
    success: {
      message: "Logged in successfully",
      data: {
        token: loginToken,
        expiry: '1d'
      }
    }
  });
}

async function changePass(req: Request, res: Response) {


  const { email, password } = req.query;


  try {

    if (email && password) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: String(email)
        }
      });

      if (existingUser) {
        const updatePass = await prisma.user.update({
          data: {
            password: String(password)
          },
          where: {
            id: existingUser.id
          }
        })

        return res.status(200).json({
          success: {
            message: "Password changed successfully"
          }
        });

      }

      return res.status(200).json({
        msg: `${email} Not Found`
  
      });
    }
    else {
      return res.status(400).json({
        msg: "Validation error",
  
      });
    }


  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        msg: "Validation error",
  
      });
    }

    return res.status(500).json({
      msg: "An error occurred while creating the user",
    
    });
  }
}
//#endregion