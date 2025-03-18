import { Injectable, NgZone } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

export interface Notification {
  id: number;
  message: string;
  relatedPostId: number;
  type: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private hubConnection!: signalR.HubConnection;
  private baseUrl = `${environment.apiUrl}`;
  private controllerUrl = `${environment.apiUrl}/api/Notification`;
  private isConnected = false;

  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private ngZone: NgZone,
    private cookieService: CookieService
  ) {
    this.loadNotifications();
  }

  public async startConnection(): Promise<void> {
    console.log('🟡 Starting SignalR Connection...');

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl}/notificationHub`, {
        accessTokenFactory: () => {
          const token = this.cookieService.get('accessToken');
          console.log(
            `🔹 Access Token Retrieved: ${token ? '✅ Exists' : '❌ Missing'}`
          );
          return token;
        },
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          console.warn(
            `🔄 Reconnecting... Attempt: ${retryContext.previousRetryCount + 1}`
          );
          return 3000;
        },
      })
      .configureLogging(signalR.LogLevel.Debug)
      .build();

    this.registerConnectionEvents();

    try {
      await this.hubConnection.start();
      this.isConnected = true;
      this.setupSignalRHandler();
    } catch (err) {
      this.isConnected = false;
      console.error('❌ SignalR Connection Failed:', err);
      console.log('Retrying in 5 seconds...');
      setTimeout(() => this.startConnection(), 5000);
    }
  }

  private registerConnectionEvents(): void {
    this.hubConnection.onreconnecting((error) => {
      console.warn('🔄 Reconnecting... Error:', error);
    });

    this.hubConnection.onreconnected((connectionId) => {
    });

    this.hubConnection.onclose((error) => {
      console.error('🚨 Connection Closed! Reason:', error);
    });
  }

  private setupSignalRHandler(): void {
    this.hubConnection.on(
      'ReceiveNotification',
      (notification: Notification) => {
        console.log('🔔 New Notification Received:', notification);
        this.ngZone.run(() => {
          const currentNotifications = this.notificationsSubject.value;
          if (!currentNotifications.some((n) => n.id === notification.id)) {
            this.notificationsSubject.next([
              notification,
              ...currentNotifications,
            ]);
          }
        });
        this.updateNotificationCount();
      }
    );
  }

  loadNotifications(): void {
    this.http.get<Notification[]>(`${this.controllerUrl}/unread`).subscribe({
      next: (apiNotifications) => {
        this.notificationsSubject.next(apiNotifications);
      },
      error: (err) => console.error('❌ Error loading notifications:', err),
    });
  }

  markNotificationAsRead(id: number): Observable<any> {
    return this.http.post(`${this.controllerUrl}/mark-read/${id}`, {});
  }

  removeNotification(id: number): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(
      (n) => n.id !== id
    );
    this.notificationsSubject.next(updatedNotifications);
  }

  private updateNotificationCount(): void {
    const unreadCount = this.notificationsSubject.value.length;
    console.log(`🔢 Unread Notifications Count: ${unreadCount}`);
  }
}
