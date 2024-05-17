import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { EmailsService } from '../services/emails.service';
import { CurrentUser } from '@src/common/decorators/current-user.decorator';
import { AuthUser } from '@src/common/interfaces/current-user.interface';
import { CreateEmailDto } from '../dto/create-email.dto';
import { AccessTokenGuard } from '@src/common/guards/access-token.guard';
import { AuthGuard } from '@nestjs/passport';
import { UpdateEmailDto } from '../dto/update-email.dto';

@Controller('emails')
@UseGuards(AccessTokenGuard)
@UseGuards(AuthGuard('jwt'))
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  @Post()
  async createEmail(
    @CurrentUser() user: AuthUser,
    @Body() createEmailDto: CreateEmailDto,
  ) {
    return await this.emailsService.createEmail(user, createEmailDto);
  }

  @Get()
  async getAllEmails(@CurrentUser() user: AuthUser) {
    return await this.emailsService.getAllEmails(user);
  }

  @Get()
  async getAllSendedEmails(@CurrentUser() user: AuthUser) {
    return await this.emailsService.getAllSendedEmails(user);
  }

  @Get()
  async getAllReceivedEmails(@CurrentUser() user: AuthUser) {
    return await this.emailsService.getAllReceivedEmails(user);
  }

  @Get('/:emailId')
  async getById(
    @CurrentUser() user: AuthUser,
    @Param('emailId') emailId: string,
  ) {
    return await this.emailsService.getEmailById(user, emailId);
  }

  @Put('/:emailId')
  async updateEmail(
    @CurrentUser() user: AuthUser,
    @Param('emailId') emailId: string,
    @Body() updateEmailDto: UpdateEmailDto,
  ) {
    return await this.emailsService.updateEmail(user, emailId, updateEmailDto);
  }

  @Delete('/:emailId')
  async deleteEmail(
    @CurrentUser() user: AuthUser,
    @Param('emailId') emailId: string,
  ) {
    return await this.emailsService.deleteEmail(user, emailId);
  }
}
