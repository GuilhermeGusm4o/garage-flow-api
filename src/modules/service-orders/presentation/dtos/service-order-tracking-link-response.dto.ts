import { ApiProperty } from '@nestjs/swagger';

export class ServiceOrderTrackingLinkResponseDto {
  constructor(trackingLink: string) {
    this.trackingLink = trackingLink;
  }

  @ApiProperty({ description: 'Link público para o cliente acompanhar o status da OS' })
  trackingLink!: string;
}
