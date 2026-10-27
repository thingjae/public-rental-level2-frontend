export type Category = 'TOOL' | 'CAMPING' | 'LIVING' | 'EVENT';
export type RentalType = 'HOURLY' | 'DAILY';
export type ItemStatus = 'AVAILABLE' | 'NEEDS_CHECK' | 'REPAIRING';
export type ItemNowState = 'AVAILABLE' | 'IN_USE' | 'OVERDUE' | 'NEEDS_CHECK' | 'REPAIRING';
export type ReservationState = 'UPCOMING' | 'ACTIVE' | 'OVERDUE' | 'RETURNED' | 'CANCELED';

export type Location = {
  id: number;
  name: string;
  address: string;
  phone: string;
  code: string;
  openHours: string;
  itemCount: number;
};

export type Item = {
  id: number;
  locationId: number;
  location: { id: number; name: string; code: string };
  name: string;
  category: Category;
  description: string;
  caution: string;
  imageUrl: string | null;
  rentalType: RentalType;
  maxDuration: number;
  status: ItemStatus;
  nowState: ItemNowState;
  nowStateLabel: string;
  upcomingCount: number;
};

export type ScheduleEntry = {
  startAt: string;
  endAt: string;
  state: ReservationState;
  stateLabel: string;
};

export type ItemDetail = Omit<Item, 'location' | 'upcomingCount'> & {
  location: Omit<Location, 'itemCount'>;
  hasOverdue: boolean;
  schedule: ScheduleEntry[];
  booking: { today: string; lastDate: string; slotStartHours: number[]; now: string };
};

export type Reservation = {
  id: number;
  itemId: number;
  itemName: string;
  rentalType: RentalType;
  locationName: string;
  locationCode: string;
  startAt: string;
  endAt: string;
  state: ReservationState;
  stateLabel: string;
  canCancel: boolean;
  canReturn: boolean;
  returnedAt: string | null;
  canceledAt: string | null;
};

export type AdminReservation = Reservation & { renterName: string; renterPhone: string };

export type DamageReport = {
  id: number;
  itemId: number;
  reporterName: string;
  content: string;
  status: 'RECEIVED' | 'RESOLVED';
  createdAt: string;
  resolvedAt: string | null;
  item: { id: number; name: string; status: ItemStatus; location: { name: string } };
};

export type StatNumbers = {
  inUse: number;
  reserved: number;
  available: number;
  overdue: number;
  needsCheck: number;
  todayStarts: number;
  totalItems: number;
};

export type Stats = StatNumbers & {
  today: string;
  locationId: number | null;
  byLocation: (StatNumbers & { locationId: number; locationName: string })[];
};
