import { Component, Input, Output, EventEmitter, computed, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { Room } from '../../models/room.model';
import { ChartComponent } from '../chart/chart.component';

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule, ChartComponent],
  templateUrl: './room-detail.component.html',
  styleUrls: ['./room-detail.component.css']
})
export class RoomDetailComponent implements OnInit, OnChanges {
  @Input() room!: Room;
  @Output() close = new EventEmitter<void>();

  ngOnInit(): void {
    console.log('Room detail component initialized with room:', this.room);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['room']) {
       this.totalDailyUsage = computed(() => 
        this.room.dailyUsage.reduce((sum, usage) => sum + usage, 0)
      );

      this.averageDailyUsage = computed(() => 
        Math.round(this.totalDailyUsage() / this.room.dailyUsage.length)
      );

      this.peakUsage = computed(() => 
        Math.max(...this.room.dailyUsage)
      );

      this.peakDay = computed(() => 
        this.room.dailyUsage.findIndex(usage => usage === this.peakUsage()) + 1
      );

      this.dailyUsageChartData = computed(() => 
        this.room.dailyUsage.map((usage, index) => ({
          name: `Day ${index + 1}`,
          value: usage,
          id: `day-${index + 1}`
        }))
      );
    }
  }

  // Computed values for analytics
  totalDailyUsage = computed(() => 
    this.room.dailyUsage.reduce((sum, usage) => sum + usage, 0)
  );

  averageDailyUsage = computed(() => 
    Math.round(this.totalDailyUsage() / this.room.dailyUsage.length)
  );

  peakUsage = computed(() => 
    Math.max(...this.room.dailyUsage)
  );

  peakDay = computed(() => 
    this.room.dailyUsage.findIndex(usage => usage === this.peakUsage()) + 1
  );

  dailyUsageChartData = computed(() => 
    this.room.dailyUsage.map((usage, index) => ({
      name: `Day ${index + 1}`,
      value: usage,
      id: `day-${index + 1}`
    }))
  );

  lineChartOptions = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0];
        return `${data.name}<br/>Usage: ${data.value}`;
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
      boundaryGap: false,
      axisLabel: {
        fontSize: 12,
        color: '#6b7280'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 12,
        color: '#6b7280'
      }
    }
  };

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

  getTrend(): string {
    const usage = this.room.dailyUsage;
    const firstHalf = usage.slice(0, Math.ceil(usage.length / 2));
    const secondHalf = usage.slice(Math.floor(usage.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    if (secondAvg > firstAvg * 1.1) return '↗️ Increasing';
    if (secondAvg < firstAvg * 0.9) return '↘️ Decreasing';
    return '➡️ Stable';
  }

  getTrendClass(): string {
    const trend = this.getTrend();
    if (trend.includes('Increasing')) return 'text-green-600';
    if (trend.includes('Decreasing')) return 'text-red-600';
    return 'text-blue-600';
  }

  getConsistencyScore(): number {
    const usage = this.room.dailyUsage;
    const avg = this.averageDailyUsage();
    const variance = usage.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / usage.length;
    const standardDeviation = Math.sqrt(variance);

    const consistencyScore = Math.max(0, 100 - (standardDeviation / avg) * 50);
    return Math.round(consistencyScore);
  }

  getStatusText(): string {
    if (this.room.quotaRemaining === 0) return 'Quota Exhausted';
    if (this.room.quotaRemaining < 20) return 'High Usage Alert';
    if (this.room.apiCalls === 0) return 'Inactive Room';
    return 'Operating Normally';
  }

  getStatusDescription(): string {
    if (this.room.quotaRemaining === 0) return 'This room has reached its quota limit and cannot make more API calls.';
    if (this.room.quotaRemaining < 20) return 'This room is approaching its quota limit. Monitor usage closely.';
    if (this.room.apiCalls === 0) return 'This room has not made any API calls recently.';
    return 'This room is operating within normal parameters with healthy usage patterns.';
  }

  getStatusBgClass(): string {
    if (this.room.quotaRemaining === 0) return 'bg-red-50 border border-red-200';
    if (this.room.quotaRemaining < 20) return 'bg-yellow-50 border border-yellow-200';
    if (this.room.apiCalls === 0) return 'bg-gray-50 border border-gray-200';
    return 'bg-green-50 border border-green-200';
  }

  getStatusDotClass(): string {
    if (this.room.quotaRemaining === 0) return 'bg-red-500';
    if (this.room.quotaRemaining < 20) return 'bg-yellow-500';
    if (this.room.apiCalls === 0) return 'bg-gray-500';
    return 'bg-green-500';
  }

  getStatusTextClass(): string {
    if (this.room.quotaRemaining === 0) return 'text-red-700';
    if (this.room.quotaRemaining < 20) return 'text-yellow-700';
    if (this.room.apiCalls === 0) return 'text-gray-700';
    return 'text-green-700';
  }

  getRecommendationBorderClass(): string {
    if (this.room.quotaRemaining === 0) return 'border-red-400';
    if (this.room.quotaRemaining < 20) return 'border-yellow-400';
    if (this.room.apiCalls === 0) return 'border-gray-400';
    return 'border-green-400';
  }

  getRecommendations(): string {
    if (this.room.quotaRemaining === 0) {
      return 'Consider upgrading quota limits or optimizing API usage. Review call patterns to identify inefficiencies.';
    }
    if (this.room.quotaRemaining < 20) {
      return 'Monitor usage closely and consider optimizing API calls. Set up alerts for quota thresholds.';
    }
    if (this.room.apiCalls === 0) {
      return 'Room appears inactive. Review integration status or consider archiving if no longer needed.';
    }
    return 'Usage patterns look healthy. Continue monitoring for any unusual spikes or drops in activity.';
  }

  onClose(): void {
    this.close.emit();
  }
}