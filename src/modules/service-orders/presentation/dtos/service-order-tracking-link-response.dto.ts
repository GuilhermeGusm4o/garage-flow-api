import { ApiProperty } from '@nestjs/swagger';

export class ServiceOrderTrackingLinkResponseDto {
  constructor(trackingLink: string) {
    this.trackingLink = trackingLink;
  }

  @ApiProperty({ description: "Public link for the client to track the service order's status" })
  trackingLink!: string;
}
