import { Component, OnInit, signal, computed, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { RoomService } from '../../services/room.service';
import { Room, ChartData } from '../../models/room.model';
import { RoomFilterComponent } from '../room-filter/room-filter.component';
import { RoomDetailComponent } from '../room-detail/room-detail.component';
import { ChartComponent } from '../chart/chart.component';
import { CounterAnimationService } from '../../services/counter-animation.service';

@Component({
  selector: 'app-room-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    NgxEchartsModule, 
    RoomFilterComponent, 
    RoomDetailComponent,
    ChartComponent
  ],
  providers: [CounterAnimationService],
  templateUrl: './room-dashboard.component.html',
  styleUrls: ['./room-dashboard.component.css']
})
export class RoomDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('totalRoomsCounter', { static: false }) totalRoomsCounter!: ElementRef;
  @ViewChild('totalApiCallsCounter', { static: false }) totalApiCallsCounter!: ElementRef;
  @ViewChild('avgQuotaCounter', { static: false }) avgQuotaCounter!: ElementRef;
  @ViewChild('activeRoomsCounter', { static: false }) activeRoomsCounter!: ElementRef;

  selectedRoom = signal<Room | null>(null);

  // Computed signals for reactive data
  filteredRooms = computed(() => this.roomService.getFilteredRooms());

  apiCallsChartData = computed(() => 
    this.filteredRooms().map(room => ({
      name: room.name,
      value: room.apiCalls,
      id: room.id
    }))
  );

  quotaUsageChartData = computed(() => 
    this.filteredRooms().map(room => ({
      name: room.name,
      value: 100 - room.quotaRemaining,
      id: room.id
    }))
  );

  // Store previous values for counter animation
  private previousTotalRooms = 0;
  private previousTotalApiCalls = 0;
  private previousAvgQuota = 0;
  private previousActiveRooms = 0;

  totalApiCalls = computed(() => 
    this.filteredRooms().reduce((sum, room) => sum + room.apiCalls, 0)
  );

  averageQuotaRemaining = computed(() => {
    const rooms = this.filteredRooms();
    if (rooms.length === 0) return 0;
    return Math.round(
      rooms.reduce((sum, room) => sum + room.quotaRemaining, 0) / rooms.length
    );
  });

  activeRooms = computed(() => 
    this.filteredRooms().filter(room => room.apiCalls > 0).length
  );

  // Enhanced chart options with better styling
  barChartOptions = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#6366f1',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      axisTick: {
        alignWithLabel: true
      },
      axisLabel: {
        color: '#6b7280'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#6b7280'
      }
    }
  };

  pieChartOptions = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c}% ({d}%)',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#6366f1',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        color: '#6b7280'
      }
    }
  };

  constructor(
    public roomService: RoomService,
    private counterAnimation: CounterAnimationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    // Set up effect to watch for changes in computed values and animate counters
    setTimeout(() => {
      this.animateCounters();
    }, 100);
  }

  private animateCounters(): void {
    const currentTotalRooms = this.filteredRooms().length;
    const currentTotalApiCalls = this.totalApiCalls();
    const currentAvgQuota = this.averageQuotaRemaining();
    const currentActiveRooms = this.activeRooms();

    if (this.totalRoomsCounter) {
      this.counterAnimation.animateValue(
        this.totalRoomsCounter.nativeElement,
        this.previousTotalRooms,
        currentTotalRooms,
        800
      );
    }

    if (this.totalApiCallsCounter) {
      this.counterAnimation.animateValue(
        this.totalApiCallsCounter.nativeElement,
        this.previousTotalApiCalls,
        currentTotalApiCalls,
        1200
      );
    }

    if (this.avgQuotaCounter) {
      this.counterAnimation.animateValue(
        this.avgQuotaCounter.nativeElement,
        this.previousAvgQuota,
        currentAvgQuota,
        900
      );
    }

    if (this.activeRoomsCounter) {
      this.counterAnimation.animateValue(
        this.activeRoomsCounter.nativeElement,
        this.previousActiveRooms,
        currentActiveRooms,
        700
      );
    }

    // Update previous values
    this.previousTotalRooms = currentTotalRooms;
    this.previousTotalApiCalls = currentTotalApiCalls;
    this.previousAvgQuota = currentAvgQuota;
    this.previousActiveRooms = currentActiveRooms;
  }

  loadData(): void {
    this.roomService.getRooms().subscribe();
  }

  retryLoad(): void {
    this.loadData();
  }

  onFiltersChanged(filters: any): void {
    this.roomService.updateFilters(filters);
    this.selectedRoom.set(null);

    // Animate counters when filters change
    setTimeout(() => {
      this.animateCounters();
    }, 100);
  }

  onChartClick(event: any): void {
    if (event.data && event.data.id) {
      const room = this.roomService.getRoomById(event.data.id);
      if (room) {
        this.selectedRoom.set(room);
      }
    }
  }

  closeDetail(): void {
    this.selectedRoom.set(null);
  }
}