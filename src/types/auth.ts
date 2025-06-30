import type { ObjectId } from 'mongoose';

export interface IAuthenJWT {
  id: ObjectId;
  create: number;
  expired: number;
}
