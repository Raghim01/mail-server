import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { JwtHelper } from '@src/common/jwt/token-helper.function';
import { CreateUserDto } from '@src/users/dto/create-user.dto';
import { AuthDto } from '../dto/auth.dto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private jwtHelper: JwtHelper) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return await this.authService.signUp(createUserDto);
  }

  @Post('signin')
  async signin(@Body() authDto: AuthDto) {
    return await this.authService.signAIn(authDto);
  }

  @Post('signinCookie')
  async signinCookie(
    @Res({ passthrough: true }) res: Response,
    @Body() authDto: AuthDto,
  ) {
    const user = await this.authService.signAIn(authDto);
    res
      .cookie('access_token', user.tokens.accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        expires: new Date(Date.now() + 1 * 24 * 60 * 1000),
      })
      .send({ status: 'ok' });
  }
}
