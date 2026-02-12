export type TripStyle = 'SOLO' | 'COUPLE' | 'FAMILY' | 'FRIENDS' | 'BUSINESS';
export type TripDensity = 'RELAXED' | 'BALANCED' | 'INTENSIVE';
export type BudgetLevel = 'ECONOMY' | 'MEDIUM' | 'LUXURY' | 'UNLIMITED';
export type TripStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type ItemType = 'VISIT' | 'STAY';
export type InterestType = 'HISTORICAL' | 'SHOPPING' | 'RECREATIONAL' | 'RELIGIOUS' | 'NATURAL' | 'DINING' | 'STUDY' | 'EVENTS';

export interface TripItem {
  id: string;
  type: ItemType;
  title: string;
  category: string
  start_time: string;
  end_time: string;
  summery: string;
  cost: number;
  address: string;
  url: string | null;
}

export interface TripDay {
  day_number: number;
  date: string;
  items: TripItem[];
}

export interface Trip {
  id: string;
  title: string;
  province: string;
  city: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  style: TripStyle;
  budget_level: BudgetLevel;
  density: string;
  status: TripStatus;
  total_cost: number;
  days: TripDay[];
  created_at: string;
}

export interface CreateTripPayload {
  province: string;
  city?: string | null;
  startDate: string;
  endDate?: string;
  style?: TripStyle;
  density?: TripDensity;
  interests?: InterestType[];
  budget_level?: BudgetLevel;
}

export interface UpdateTripItemPayload {
  start_time?: string;
  end_time?: string;
}

export interface TripItemWithDay extends TripItem {
  day_number: number;
  date: string;
}
