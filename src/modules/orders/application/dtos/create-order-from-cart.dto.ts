import { IsObject, IsNotEmpty } from 'class-validator';

export class CreateOrderFromCartDto {
  @IsObject()
  @IsNotEmpty()
  shippingAddress: any; // { street, city, postalCode, lat, lng }
}
