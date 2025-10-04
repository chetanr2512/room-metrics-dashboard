import { Component } from '@angular/core';
import { RoomDashboardComponent } from './components/room-dashboard/room-dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RoomDashboardComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'room-metrics-dashboard';
}