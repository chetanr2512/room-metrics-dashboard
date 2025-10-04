import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { ChartData } from '../../models/room.model';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [NgxEchartsModule],
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnChanges {
  @Input() data: ChartData[] = [];
  @Input() options: any = {};
  @Input() type: 'bar' | 'pie' | 'line' = 'bar';
  @Output() chartClick = new EventEmitter<any>();

  chartOptions: EChartsOption = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['options'] || changes['type']) {
      this.updateChartOptions();
    }
  }

  private updateChartOptions(): void {
    const gradientColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];

    switch (this.type) {
      case 'bar':
        this.chartOptions = {
          ...this.options,
          series: [{
            name: 'API Calls',
            type: 'bar',
            data: this.data.map((item, index) => ({
              name: item.name,
              value: item.value,
              id: item.id,
              itemStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: gradientColors[index % gradientColors.length] },
                    { offset: 1, color: this.lightenColor(gradientColors[index % gradientColors.length], 20) }
                  ]
                }
              }
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.3)'
              }
            },
            animationDelay: (idx: number) => idx * 100,
            animationEasing: 'cubicOut'
          }],
          xAxis: {
            ...this.options.xAxis,
            data: this.data.map(item => item.name)
          }
        };
        break;

      case 'pie':
        this.chartOptions = {
          ...this.options,
          series: [{
            name: 'Quota Usage',
            type: 'pie',
            radius: ['30%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 8,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold'
              },
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            labelLine: {
              show: false
            },
            data: this.data.map((item, index) => ({
              name: item.name,
              value: item.value,
              id: item.id,
              itemStyle: {
                color: {
                  type: 'radial',
                  x: 0.5,
                  y: 0.5,
                  r: 0.5,
                  colorStops: [
                    { offset: 0, color: this.lightenColor(gradientColors[index % gradientColors.length], 30) },
                    { offset: 1, color: gradientColors[index % gradientColors.length] }
                  ]
                }
              }
            })),
            animationType: 'scale',
            animationEasing: 'elasticOut',
            animationDelay: (idx: number) => idx * 100
          }]
        };
        break;

      case 'line':
        this.chartOptions = {
          ...this.options,
          series: [{
            name: 'Daily Usage',
            type: 'line',
            data: this.data.map(item => item.value),
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: {
              width: 3,
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  { offset: 0, color: '#6366f1' },
                  { offset: 1, color: '#8b5cf6' }
                ]
              }
            },
            itemStyle: {
              color: '#6366f1',
              borderColor: '#fff',
              borderWidth: 2
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(99, 102, 241, 0.3)' },
                  { offset: 1, color: 'rgba(99, 102, 241, 0.05)' }
                ]
              }
            },
            animationDelay: (idx: number) => idx * 50
          }],
          xAxis: {
            ...this.options.xAxis,
            data: this.data.map((_, index) => `Day ${index + 1}`)
          }
        };
        break;
    }
  }

  private lightenColor(color: string, percent: number): string {
    // Simple color lightening function
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const B = (num >> 8 & 0x00FF) + amt;
    const G = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
                  (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + 
                  (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
  }

  onChartClick(event: any): void {
    this.chartClick.emit(event);
  }
}