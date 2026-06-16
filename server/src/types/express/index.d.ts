import { IUser } from '../../models/User.model';

declare global {
  namespace Express {
    interface User extends IUser {}
  }
}
