import { Injectable } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly notifications: NotificationsService,
  ) {}

  createOrder(orderDto: any) {
    this.notifications.notify('order_created', {
      order: orderDto,
    });

    return { status: 'Order accepted', order: orderDto };
  }
}
