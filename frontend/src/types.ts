export interface RouteInfo {
  origem?: string
  destino?: string
  origin?: string
  destination?: string
  date?: string
  data?: string
  orcamento?: string | number
}

export interface BudgetInfo {
  total?: string | number
  used?: string | number
  remaining?: string | number
  status?: string
}

export interface ClimateInfo {
  location?: string
  temperature?: string | number
  feels_like?: string | number
  conditions?: string
  summary?: string
  recommendations?: string[]
}

export interface FlightOption {
  airline?: string
  price?: string | number
  currency?: string
  departure?: string
  arrival?: string
  duration?: string
  purchase_url?: string
}

export interface HotelOption {
  name?: string
  price_per_night?: string | number
  total_price?: string | number
  distance?: string
  image?: string
  attractions?: (string | { name?: string; distance?: string })[]
  currency?: string
  booking_url?: string
}

export interface RoteiroData {
  route?: RouteInfo
  budget?: BudgetInfo
  climate?: ClimateInfo
  flights?: FlightOption[] | any
  hotels?: HotelOption[] | any
  tips?: string[]
}

// types are exported by their declarations above
