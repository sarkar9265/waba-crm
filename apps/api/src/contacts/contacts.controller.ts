import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, Query, Patch, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionLimitGuard } from '../billing/subscription-limit.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@UseGuards(JwtAuthGuard, SubscriptionLimitGuard)
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  findAll(@Request() req: any, @Query() query: any) {
    return this.contactsService.findAll(req.user.clientId, query);
  }

  @Get('export')
  async exportContacts(@Request() req: any) {
    const csvData = await this.contactsService.exportContacts(req.user.clientId);
    return { data: csvData };
  }

  @Patch('bulk')
  bulkUpdate(@Request() req: any, @Body() data: { ids: string[], action: string, tags?: string[], status?: any }) {
    return this.contactsService.bulkUpdate(req.user.clientId, data);
  }

  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  importContacts(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    return this.contactsService.importContacts(req.user.clientId, file.path);
  }

  @Post('merge')
  mergeContacts(@Request() req: any, @Body() data: { primaryId: string, secondaryId: string }) {
    return this.contactsService.mergeContacts(req.user.clientId, data.primaryId, data.secondaryId);
  }

  @Get('duplicates')
  findDuplicates(@Request() req: any) {
    return this.contactsService.findDuplicates(req.user.clientId);
  }

  @Get(':id/activity')
  getActivity(@Request() req: any, @Param('id') id: string) {
    return this.contactsService.getTimeline(req.user.clientId, id);
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
