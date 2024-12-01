import { Injectable } from '@nestjs/common';
import { regions } from './regions';

@Injectable()
export class LocationsService {
  getAllRegionsAndCommunes() {
    return regions; 
  }
}
