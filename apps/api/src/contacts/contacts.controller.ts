import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.contactsService.findAll(req.user.clientId);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.contactsService.findOne(req.user.clientId, id);
  }

  @Post()
  create(@Request() req: any, @Body() data: any) {
    return this.contactsService.create(req.user.clientId, data);
  }

  @Put(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    return this.contactsService.update(req.user.clientId, id, data);
  }

  @Delete(':id')
  delete(@Request() req: any, @Param('id') id: string) {
    return this.contactsService.delete(req.user.clientId, id);
  }
}
