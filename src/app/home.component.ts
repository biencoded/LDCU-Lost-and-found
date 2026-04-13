import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LostItemService } from './lost-item.service';

interface DashboardStats {
  totalSearches: number;
  totalReports: number;
  totalRecoveries: number;
  recoveryRate: number;
}

interface WeeklyActivityData {
  day: string;
  searches: number;
  reports: number;
  recoveries: number;
}

interface GraphBarData {
  day: string;
  height: number;
  type: 'search' | 'report' | 'recovery';
  value: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class HomeComponent implements OnInit {
  private readonly lostItemService = inject(LostItemService);

  // Dashboard statistics
  protected stats = signal<DashboardStats>({
    totalSearches: 0,
    totalReports: 0,
    totalRecoveries: 0,
    recoveryRate: 0
  });

  protected weeklyData = signal<WeeklyActivityData[]>([]);
  protected isLoading = signal(true);
  protected errorMessage = signal<string | null>(null);

  // Computed max value for graph scaling
  protected maxActivityValue = computed(() => {
    const data = this.weeklyData();
    if (data.length === 0) return 1;
    const allValues = data.flatMap(d => [d.searches, d.reports, d.recoveries]);
    return Math.max(...allValues, 1000);
  });

  // Compute graph bars
  protected graphBars = computed(() => {
    const data = this.weeklyData();
    const max = this.maxActivityValue();
    const bars: GraphBarData[] = [];

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const types: Array<'search' | 'report' | 'recovery'> = ['search', 'report', 'recovery'];

    data.forEach((dayData, index) => {
      const values = [dayData.searches, dayData.reports, dayData.recoveries];
      const typeLabels = ['Searches', 'Reports', 'Recoveries'];

      values.forEach((value, typeIndex) => {
        bars.push({
          day: dayNames[index],
          height: (value / max) * 100,
          type: types[typeIndex],
          value: value
        });
      });
    });

    return bars;
  });

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Load all items and calculate statistics from them
    this.lostItemService.getItems().subscribe({
      next: (items) => {
        this.calculateStatsFromItems(items);
        this.generateWeeklyActivityData(items);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading items for dashboard:', error);
        this.errorMessage.set('Failed to load dashboard data');
        this.isLoading.set(false);
        // Set minimal default values
        this.stats.set({
          totalSearches: 0,
          totalReports: 0,
          totalRecoveries: 0,
          recoveryRate: 0
        });
        this.weeklyData.set([]);
      }
    });
  }

  private calculateStatsFromItems(items: any[]): void {
    const totalReports = items.length;
    const totalRecoveries = items.filter(item => item.status === 'claimed').length;
    const recoveryRate = totalReports > 0 ? Math.round((totalRecoveries / totalReports) * 100) : 0;

    // For searches, we'll estimate based on reports (searches are typically 2-3x reports)
    const totalSearches = Math.round(totalReports * 2.5);

    this.stats.set({
      totalSearches,
      totalReports,
      totalRecoveries,
      recoveryRate
    });
  }

  private generateWeeklyActivityData(items: any[]): void {
    const now = new Date();
    const weekData: WeeklyActivityData[] = [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Generate data for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayName = dayNames[date.getDay()];

      // Filter items created on this day
      const dayItems = items.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.toDateString() === date.toDateString();
      });

      // Calculate activity for this day
      const reports = dayItems.length;
      const recoveries = dayItems.filter(item => item.status === 'claimed').length;
      // Estimate searches (typically more than reports)
      const searches = Math.round(reports * 2.8 + Math.random() * 50);

      weekData.push({
        day: dayName,
        searches: Math.max(searches, 0),
        reports: reports,
        recoveries: recoveries
      });
    }

    this.weeklyData.set(weekData);
  }
}
