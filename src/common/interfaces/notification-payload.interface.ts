import { CreateEmailDto } from '@src/emails/dto/create-email.dto';
import { AuthUser } from './current-user.interface';

export interface IPayload {
  user: AuthUser;
  createEmailDto: CreateEmailDto;
}
