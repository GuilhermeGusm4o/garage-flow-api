import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { type ClientEntity } from '@client/domain/entities/client.entity';

export class ClientResponse {
  @ApiProperty({ description: 'Client ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ description: "Client's formatted CPF or CNPJ", example: '529.982.247-25' })
  cpfCnpj!: string;

  @ApiProperty({ description: 'Document type', example: 'CPF', enum: ['CPF', 'CNPJ'] })
  documentType!: string;

  @ApiProperty({ description: "Client's name", example: 'João da Silva' })
  name!: string;

  @ApiProperty({ description: "Client's phone number", example: '11999998888' })
  phone!: string;

  @ApiProperty({ description: 'Address', example: 'Rua das Flores, 123 - São Paulo/SP' })
  address!: string;

  @ApiPropertyOptional({
    description: "Client's email",
    example: 'joao@email.com',
    nullable: true,
  })
  email!: string | null;

  @ApiProperty({ description: 'Record creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Record last-update timestamp' })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'Soft-delete timestamp, null while the record is active',
    nullable: true,
  })
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
