export type TripStyle = 'SOLO' | 'COUPLE' | 'FAMILY' | 'FRIENDS' | 'BUSINESS';
export type TripDensity = 'RELAXED' | 'BALANCED' | 'INTENSIVE';
export type BudgetLevel = 'ECONOMY' | 'MEDIUM' | 'LUXURY';
export type TripStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type ItemType = 'VISIT' | 'FOOD' | 'STAY' | 'TRANSPORT' | 'ACTIVITY';
export type CategoryType = 'HISTORICAL' | 'SHOPPING' | 'RECREATIONAL' | 'RELIGIOUS' | 'NATURAL' | 'DINING' | 'STUDY' | 'EVENTS';

export interface TripItem {
  id: string;
  item_id?: string;
  type: ItemType;
  item_type?: ItemType;
  place_ref_id?: string;
  title: string;
  category: CategoryType;
  start_time: string;
  end_time: string;
  duration_minutes?: number;
  summery?: string;
  cost: number;
  estimated_cost?: number;
  address?: string;
  url?: string | null;
  order_index?: number;
  is_locked?: boolean;
  created_at?: string;
}

export interface TripDay {
  day_id?: number;
  day_number: number;
  day_index?: number;
  date: string;
  specific_date?: string;
  items: TripItem[];
  trip_id?: string;
  created_at?: string;
}

export interface Trip {
  id: string;
  trip_id?: string;
  title?: string;
  province: string;
  city: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  style?: TripStyle;
  travel_style?: TripStyle;
  budget_level: BudgetLevel;
  density?: string;
  daily_available_hours?: number;
  status?: TripStatus;
  total_cost: number;
  total_estimated_cost?: number;
  days: TripDay[];
  user_id?: number | null;
  created_at?: string;
}

// API Payloads
export interface CreateTripPayload {
  province: string;
  city?: string | null;
  start_date: string;
  duration_days: number;
  travel_style?: TripStyle;
  budget_level?: BudgetLevel;
  daily_available_hours?: number;
  user_id?: number | null;
}

export interface UpdateTripPayload {
  title?: string;
  budget_level?: BudgetLevel;
  daily_available_hours?: number;
}

export interface UpdateTripItemPayload {
  start_time?: string;
  end_time?: string;
  estimated_cost?: string;
}

export interface ReplaceItemPayload {
  new_place_id: string;
  new_place_data?: {
    title: string;
    category: CategoryType;
    estimated_cost: string;
    address?: string;
  };
}

export interface BulkCreateItemPayload {
  item_type: ItemType;
  place_ref_id: string;
  title: string;
  category: CategoryType;
  start_time: string;
  end_time: string;
  estimated_cost: string;
  order_index: number;
}

// API Responses
export interface CostBreakdownResponse {
  total_estimated_cost: number;
  breakdown_by_category: {
    [key in CategoryType]?: {
      amount: number;
      percentage: number;
      count: number;
    };
  };
  breakdown_by_day: Array<{
    day_index: number;
    date: string;
    total_cost: number;
    item_count: number;
  }>;
}

export interface TripHistoryItem {
  trip_id: string;
  title: string;
  province: string;
  city: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  total_estimated_cost: string;
  created_at: string;
}

export interface TripHistoryResponse {
  count: number;
  results: TripHistoryItem[];
}

export interface TripItemWithDay extends TripItem {
  day_number: number;
  date: string;
}
