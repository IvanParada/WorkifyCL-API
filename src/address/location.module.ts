import { Module } from '@nestjs/common';
import { LocationsService } from './location.services';
import { LocationsController } from './location.controller';

@Module({
  controllers: [LocationsController],
  providers: [LocationsService],
})
export class LocationsModule {}
