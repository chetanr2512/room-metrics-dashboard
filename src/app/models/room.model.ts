export interface Room {
  id: string;
  name: string;
  apiCalls: number;
  quotaRemaining: number;
  lastLogin: string;
  dailyUsage: number[];
}

export interface RoomFilters {
  selectedRoomIds: string[];
}

export interface ChartData {
  name: string;
  value: number;
  id: string;
}