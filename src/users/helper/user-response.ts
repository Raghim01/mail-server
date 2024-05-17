import { Expose } from 'class-transformer';

export class UserResponse {
  id: string;
  @Expose({ name: 'username' })
  name: string;
  email: string;
}
