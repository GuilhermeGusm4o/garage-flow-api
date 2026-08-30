import { ApiProperty } from '@nestjs/swagger';

export class ServiceOrderTrackingLinkResponseDto {
  constructor(trackingLink: string) {
    this.trackingLink = trackingLink;
  }

  @ApiProperty({
    description: "Public link for the client to track the service order's status",
    example: 'https://garage-flow.example.com/service-orders/track/eyJhbGciOiJIUzI1NiJ9',
  })
  trackingLink!: string;
}
