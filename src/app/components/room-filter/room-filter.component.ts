import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Room, RoomFilters } from '../../models/room.model';
import { debounce, Subject } from 'rxjs';

@Component({
  selector: 'app-room-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-filter.component.html',
  styleUrls: ['./room-filter.component.css']
})
export class RoomFilterComponent implements OnInit {
  @Input() rooms: Room[] = [];
  @Output() filtersChanged = new EventEmitter<RoomFilters>();


  ngOnInit(): void {
      if(this.searchTerm){
        this.filteredRooms.set(this.rooms.filter(room => room.name.toLowerCase().includes(this.searchTerm().toLowerCase())));
      }
      else{
        this.filteredRooms.set(this.rooms);
      }
      this.debounceSearchTerm();
  }

  selectedRoomIds = signal<string[]>([]);
  isDropdownOpen = signal<boolean>(false);
  searchTerm = signal<string>('');
  searchTermSubject = signal<Subject<string>>(new Subject<string>());
  filteredRooms = signal<Room[]>([]);

  onRoomSelectionChange(roomId: string, event: any): void {
    const currentSelection = this.selectedRoomIds();
    let newSelection: string[];

    if (event.target.checked) {
      newSelection = [...currentSelection, roomId];
    } else {
      newSelection = currentSelection.filter(id => id !== roomId);
    }

    this.selectedRoomIds.set(newSelection);
    this.emitFiltersChanged(newSelection);
  }

  selectAll(): void {
    const allRoomIds = this.rooms.map(room => room.id);
    this.selectedRoomIds.set(allRoomIds);
    this.emitFiltersChanged(allRoomIds);
  }

  clearAll(): void {
    this.selectedRoomIds.set([]);
    this.emitFiltersChanged([]);
  }

  toggleDropdown(): void {
    this.isDropdownOpen.set(!this.isDropdownOpen());
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  isRoomSelected(roomId: string): boolean {
    return this.selectedRoomIds().includes(roomId);
  }

  allSelected(): boolean {
    return this.selectedRoomIds().length === this.rooms.length && this.rooms.length > 0;
  }

  noneSelected(): boolean {
    return this.selectedRoomIds().length === 0;
  }

  getSelectedCount(): number {
    return this.selectedRoomIds().length;
  }

  getDropdownDisplayText(): string {
    const selectedCount = this.getSelectedCount();
    if (selectedCount === 0) {
      return 'All rooms selected';
    } else if (selectedCount === 1) {
      const selectedRoom = this.rooms.find(room => this.isRoomSelected(room.id));
      return selectedRoom ? selectedRoom.name : '1 room selected';
    } else if (selectedCount === this.rooms.length) {
      return 'All rooms selected';
    } else {
      return `${selectedCount} rooms selected`;
    }
  }

  debounceSearchTerm(): void {
    this.searchTermSubject().pipe(
      debounce(() => new Promise(resolve => setTimeout(resolve, 300)))
    ).subscribe(term => {
      this.searchTerm.set(term);
      this.onSearchChange();
    });
  }

  onSearchChange(): void {

    const term = this.searchTerm().toLowerCase();
    if (term) {
      this.filteredRooms.set( this.rooms.filter(room => room.name.toLowerCase().includes(term)));
    } else {
      this.filteredRooms.set(this.rooms);
    }
  }

  getRoomStatus(room: Room): string {
    if (room.quotaRemaining === 0) return 'Full';
    if (room.quotaRemaining < 20) return 'High';
    if (room.apiCalls === 0) return 'Idle';
    return 'Active';
  }

  getStatusClasses(room: Room): string {
    const baseClasses = 'status-indicator';
    if (room.quotaRemaining === 0) return `${baseClasses} status-critical`;
    if (room.quotaRemaining < 20) return `${baseClasses} status-warning`;
    if (room.apiCalls === 0) return `${baseClasses} status-idle`;
    return `${baseClasses} status-active`;
  }

  formatLastLogin(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  }

  trackByRoomId(index: number, room: Room): string {
    return room.id;
  }

  private emitFiltersChanged(selectedIds: string[]): void {
    this.filtersChanged.emit({ selectedRoomIds: selectedIds });
  }
}