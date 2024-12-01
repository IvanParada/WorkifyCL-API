import { Controller, Get } from '@nestjs/common';
import { LocationsService } from './location.services';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  getAllRegionsAndCommunes() {
    return this.locationsService.getAllRegionsAndCommunes();
  }
}
