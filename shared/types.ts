export enum EventType {
  RIDE_REQUESTED = 'RIDE_REQUESTED',
  DRIVER_AVAILABLE = 'DRIVER_AVAILABLE',
}

// Create a Base interface for shared fields
interface BasePayload {
  from: string;
  to: string;
}

export interface RideRequestedPayload extends BasePayload {
  passengers: number;
}

export interface DriverAvailablePayload extends BasePayload {
  capacity: number;
}

export type TransportEvent = 
  | { type: EventType.RIDE_REQUESTED; payload: RideRequestedPayload; timestamp: number }
  | { type: EventType.DRIVER_AVAILABLE; payload: DriverAvailablePayload; timestamp: number };
