import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { AuthUser } from '../interfaces/current-user.interface';

export const CurrentUser = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const { sub: id, email, name: username } = req.user;
    return { id, email, username };
  },
);
