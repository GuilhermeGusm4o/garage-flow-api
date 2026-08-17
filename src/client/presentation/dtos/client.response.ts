import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { type ClientEntity } from '@client/domain/entities/client.entity';

export class ClientResponse {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: '529.982.247-25' })
  cpfCnpj!: string;

  @ApiProperty({ example: 'CPF', enum: ['CPF', 'CNPJ'] })
  documentType!: string;

  @ApiProperty({ example: 'João da Silva' })
  name!: string;

  @ApiProperty({ example: '11999998888' })
  phone!: string;

  @ApiProperty({ example: 'Rua das Flores, 123 - São Paulo/SP' })
  address!: string;

  @ApiPropertyOptional({ example: 'joao@email.com', nullable: true })
  email!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional({ nullable: true })
  deletedAt!: Date | null;

  static fromEntity(entity: ClientEntity): ClientResponse {
    const response = new ClientResponse();
    response.id = entity.id;
    response.cpfCnpj = entity.cpfCnpj.format();
    response.documentType = entity.cpfCnpj.type;
    response.name = entity.name;
    response.phone = entity.phone;
    response.address = entity.address;
    response.email = entity.email;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    response.deletedAt = entity.deletedAt;
    return response;
  }
}
