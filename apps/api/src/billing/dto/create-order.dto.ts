import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: 'client_123', description: 'The ID of the tenant/client' })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({ example: 'Pro', description: 'The name of the subscription plan' })
  @IsString()
  @IsNotEmpty()
  planName: string;

  @ApiProperty({ example: 2999, description: 'The amount in INR' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
