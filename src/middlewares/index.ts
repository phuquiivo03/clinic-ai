import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import type { IAuthenJWT } from '../types/auth';

declare global {
  namespace Express {
    interface Request {
      userId?: any;
      authenToken?: string;
    }
  }
}
const userAuthen: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization?.split('Bearer ')[1];
  if (!authHeader) {
    res.status(400).send({ error: 'Authorization header is missing' });
    return;
  }
  try {
    console.log(process.env.JWT_SECRET || 'default_secret')
    const decoded = jwt.verify(
      authHeader,
      process.env.JWT_SECRET || 'default_secret'

    ) as IAuthenJWT;
    // if (decoded.expired < Date.now()) {
    //   res.status(400).send({ error: 'Token has expired' });
    //   return;
    // }
    req.authenToken = authHeader;
    req.userId = decoded.id;
    next();
  } catch (error) {
    res
      .status(400)
      .send({
        error: `Internal Error:  ${(error as unknown as Error).message}`,
      });
  }
};

export const middlewares = {
  userAuthen,
};
