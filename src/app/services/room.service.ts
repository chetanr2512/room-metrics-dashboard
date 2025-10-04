import { Injectable, signal } from '@angular/core';
import { Observable, of, BehaviorSubject, interval } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { Room, RoomFilters } from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private rooms: Room[] = [
    {
      "id": "room-1",
      "name": "Room A",
      "apiCalls": 1200,
      "quotaRemaining": 65,
      "lastLogin": "2025-09-20",
      "dailyUsage": [12, 15, 8, 20, 10, 18, 14]
    },
    {
      "id": "room-2",
      "name": "Room B",
      "apiCalls": 950,
      "quotaRemaining": 10,
      "lastLogin": "2025-09-22",
      "dailyUsage": [20, 22, 19, 25, 28, 26, 30]
    },
    {
      "id": "room-3",
      "name": "Room C",
      "apiCalls": 300,
      "quotaRemaining": 95,
      "lastLogin": "2025-09-10",
      "dailyUsage": [2, 1, 0, 0, 3, 0, 0]
    },
    {
      "id": "room-4",
      "name": "Room D",
      "apiCalls": 0,
      "quotaRemaining": 100,
      "lastLogin": "2025-08-15",
      "dailyUsage": [0, 0, 0, 0, 0, 0, 0]
    },
    {
      "id": "room-5",
      "name": "Room E",
      "apiCalls": 5000,
      "quotaRemaining": 5,
      "lastLogin": "2025-09-24",
      "dailyUsage": [700, 600, 650, 500, 550, 800, 900]
    },
    {
      "id": "room-6",
      "name": "Room F",
      "apiCalls": 1800,
      "quotaRemaining": 50,
      "lastLogin": "2025-09-23",
      "dailyUsage": [100, 120, 150, 110, 130, 140, 160]
    },
    {
      "id": "room-7",
      "name": "Room G",
      "apiCalls": 230,
      "quotaRemaining": 75,
      "lastLogin": "2025-09-19",
      "dailyUsage": [10, 12, 8, 7, 6, 9, 10]
    },
    {
      "id": "room-8",
      "name": "Room H",
      "apiCalls": 3200,
      "quotaRemaining": 0,
      "lastLogin": "2025-09-25",
      "dailyUsage": [400, 350, 300, 500, 450, 480, 420]
    },
    {
      "id": "room-9",
      "name": "Room I",
      "apiCalls": 870,
      "quotaRemaining": 40,
      "lastLogin": "2025-09-21",
      "dailyUsage": [80, 70, 60, 90, 100, 85, 95]
    },
    {
      "id": "room-10",
      "name": "Room J",
      "apiCalls": 150,
      "quotaRemaining": 85,
      "lastLogin": "2025-09-18",
      "dailyUsage": [5, 10, 7, 12, 9, 6, 8]
    }
  ];

  // Using Angular Signals for state management
  private roomsSignal = signal<Room[]>(this.rooms);
  private filtersSignal = signal<RoomFilters>({ selectedRoomIds: [] });
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Expose signals as readonly
  readonly rooms$ = this.roomsSignal.asReadonly();
  readonly filters$ = this.filtersSignal.asReadonly();
  readonly loading$ = this.loadingSignal.asReadonly();
  readonly error$ = this.errorSignal.asReadonly();

  constructor() {
    // Real-time simulation - update data every 10 seconds
    // interval(10000).subscribe(() => {
    //   this.simulateDataUpdate();
    // });
  }

  getRooms(): Observable<Room[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    // Simulate network delay and potential errors
    return of(this.rooms).pipe(
      delay(1000),
      map(rooms => {
        // Simulate random error (5% chance)
        if (Math.random() < 0.05) {
          throw new Error('Failed to fetch room data');
        }
        this.loadingSignal.set(false);
        this.roomsSignal.set(rooms);
        return rooms;
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error.message);
        return of([]);
      })
    );
  }

  getFilteredRooms(): Room[] {
    const filters = this.filtersSignal();
    const rooms = this.roomsSignal();

    if (filters.selectedRoomIds.length === 0) {
      return rooms;
    }

    return rooms.filter(room => filters.selectedRoomIds.includes(room.id));
  }

  updateFilters(filters: RoomFilters): void {
    this.filtersSignal.set(filters);
  }

  getRoomById(id: string): Room | undefined {
    return this.roomsSignal().find(room => room.id === id);
  }

  private simulateDataUpdate(): void {
    const rooms = this.roomsSignal();
    const updatedRooms = rooms.map(room => ({
      ...room,
      apiCalls: room.apiCalls + Math.floor(Math.random() * 50),
      quotaRemaining: Math.max(0, room.quotaRemaining - Math.floor(Math.random() * 2)),
      dailyUsage: room.dailyUsage.map(usage => 
        Math.max(0, usage + Math.floor(Math.random() * 10 - 5))
      )
    }));

    this.roomsSignal.set(updatedRooms);
  }
}