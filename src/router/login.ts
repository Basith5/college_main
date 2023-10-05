import express, { NextFunction, Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { ValidationError } from "zod-validation-error";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserRegistrationType, loginSchema, loginTokenType, loginType, userRegistrationSchema } from '../model/login';

const secretKey = 'basith@jayaprakash_salman-siraj';
const encryptKey = '"9y/B?E(H+MbQeThWmZq4t7w!z%C&F)J@NcRfUjXn2r5u8x/A?D(G-KaPdSgVkYp3"';

const prisma = new PrismaClient();

export const loginRouter = express.Router();

loginRouter.post("/login", login);
loginRouter.post("/signup", createUser);

//#region
export function encrypt(password: string, key: string): string {
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(password);
    return hmac.digest('hex');
}

export function generateSignInToken(data: any, secret: string):string {
    return jwt.sign(data, secret, { expiresIn: '1d' });
}

export function allowAdminOnly(req: Request, res: Response, next: NextFunction) {

    const xLoginToken = req.headers['token'];
    
        if(!xLoginToken) {
            return res.status(401).json({
                error: {
                    message: "The request was missing a login token",
                }
            })
        }

        if (typeof xLoginToken !== "string") {
            return res.status(401).json({
                error: {
                    message: "The TOKEN header must be a string",
                },
            });
        }

    try {

      var tokenData = jwt.verify(xLoginToken, secretKey) as loginTokenType

      if (tokenData && (tokenData.role == "Admin" )) {
          req.user = tokenData
          next()
      } else {
        return res.status(403).json({
            error: {
              message: "You are Staff not authorized to access this request",
            },
        });
      }
    } catch (e) {
        return res.status(403).json({
            error: {
              message: "You are not authorized to access this request",
            },
        });
    }
} 

export function allowStaffOnly(req: Request, res: Response, next: NextFunction) {

  const xLoginToken = req.headers['token'];
  
      if(!xLoginToken) {
          return res.status(401).json({
              error: {
                  message: "The request was missing a login token",
              }
          })
      }

      if (typeof xLoginToken !== "string") {
          return res.status(401).json({
              error: {
                  message: "The TOKEN header must be a string",
              },
          });
      }

  try {

    var tokenData = jwt.verify(xLoginToken, secretKey) as loginTokenType

    if (tokenData && (tokenData.role == "Admin" || tokenData.role == "Staff" )) {
        req.user = tokenData
        next()
    } else {
      return res.status(403).json({
          error: {
            message: "You are Staff not authorized to access this request",
          },
      });
    }
  } catch (e) {
      return res.status(403).json({
          error: {
            message: "You are not authorized to access this request",
          },
      });
  }
} 

async function login(req: Request, res: Response) {
    
    const validationResult = loginSchema.safeParse(req.body);

    if (!validationResult.success) {
        return res.status(400).json({
            error: {
                message: "The request was missing required parameters ",
            }
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
            role: true
        }
    });

    if (!user) {
        return res.status(409).json({
            warning: {
                message: "Invalid username or password"
            }
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

async function createUser(req: Request, res: Response) {
    const userRegistrationData: UserRegistrationType = userRegistrationSchema.parse(req.body);
  
    const { email, password, role } = userRegistrationData; 

    if(!userRegistrationData) {
        return res.status(400).json({
            error: {
                message: "The request was missing required parameters ",
            }
        });
    }
  
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email
      }
    });
  
    if (existingUser) {
      return res.status(409).json({
        error: {
          message: "Email already exists",
        }
      });
    }
  
    try {
      const encryptedPassword = encrypt(password, encryptKey);
  
      await prisma.user.create({
        data: {
          email: email,
          password: password,
          role: role as Role, 
        }
      });
  
      return res.status(201).json({
        success: {
          message: "User created successfully"
        }
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          error: {
            message: "Validation error",
          }
        });
      }
      
      return res.status(500).json({
        error: {
          message: "An error occurred while creating the user",
        }
      });
    }
}
//#endregion