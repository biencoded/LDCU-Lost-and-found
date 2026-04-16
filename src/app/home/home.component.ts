import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface StatusData {
  status: string;
  total: number;
}

interface GraphBarData {
  status: string;
  height: number;
  value: number;
  color: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class HomeComponent implements OnInit {
  private readonly http = inject(HttpClient);

  protected statusData = signal<StatusData[]>([]);
  protected isLoading = signal(true);
  protected errorMessage = signal<string | null>(null);

  // Computed max value for graph scaling
  protected maxTotalValue = computed(() => {
    const data = this.statusData();
    if (data.length === 0) return 1;
    return Math.max(...data.map(d => d.total), 1);
  });

  // Compute graph bars from status counts
  protected graphBars = computed(() => {
    const data = this.statusData();
    const max = this.maxTotalValue();
    return data.map(d => ({
      status: d.status,
      height: (d.total / max) * 100,
      value: d.total,
      color: d.status === 'pending' ? '#3b82f6' : d.status === 'found' ? '#eab308' : '#059669'
    }));
  });

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.http.get<StatusData[]>('/api/stats').subscribe({
      next: (data) => {
        this.statusData.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.errorMessage.set('Failed to load dashboard data');
        this.isLoading.set(false);
      }
    });
  }
}
