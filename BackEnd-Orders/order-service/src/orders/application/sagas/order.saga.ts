import { Injectable, Logger } from "@nestjs/common"
import { ICommand, ofType, Saga } from "@nestjs/cqrs"
import { Observable, map, catchError, of } from "rxjs"
import { OrderCreatedEvent } from "../../domain/events/order-created.event"
import { OrderStatusChangedEvent } from "../../domain/events/order-status-changed.event"

@Injectable()
export class OrderSaga {
  private readonly logger = new Logger(OrderSaga.name)

  @Saga()
  orderCreated = (events$: Observable<any>): Observable<ICommand | null> => {
    return events$.pipe(
      ofType(OrderCreatedEvent),
      map((event) => {
        this.logger.log(`Saga: Order created with ID ${event.orderId}`)

        // Here you would typically return a command to be executed
        // For example, to update inventory or process payment
        // For now, we'll just log and not return a command
        return null
      }),
      // Handle any errors in the saga
      catchError((error) => {
        this.logger.error(`Error in orderCreated saga: ${error.message}`)
        // If there's an error, we could return a command to cancel the order
        // return new CancelOrderCommand(event.orderId);
        return of(null)
      }),
    )
  }

  @Saga()
  orderStatusChanged = (events$: Observable<any>): Observable<ICommand | null> => {
    return events$.pipe(
      ofType(OrderStatusChangedEvent),
      map((event) => {
        this.logger.log(`Saga: Order ${event.orderId} status changed from ${event.oldStatus} to ${event.newStatus}`)

        // Here you would typically return a command to be executed based on the status change
        // For example, if status changed to SHIPPED, you might want to notify the user
        // For now, we'll just log and not return a command
        return null
      }),
      // Handle any errors in the saga
      catchError((error) => {
        this.logger.error(`Error in orderStatusChanged saga: ${error.message}`)
        return of(null)
      }),
    )
  }
}

