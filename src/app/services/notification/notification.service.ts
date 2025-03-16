import { Injectable, NgZone } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: number;
  message: string;
  relatedPostId: number;
  type: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private hubConnection: signalR.HubConnection;
  private baseUrl = `${environment.apiUrl}`;
  private controllerUrl = `${environment.apiUrl}/api/Notification`;
  private isConnected = false;

  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient, private ngZone: NgZone) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl}/notificationHub`)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.startConnection();
  }

  private async startConnection(): Promise<void> {
    if (this.hubConnection.state !== signalR.HubConnectionState.Disconnected) {
      console.log(`SignalR already in state: ${this.hubConnection.state}`);
      return;
    }
    try {
      await this.hubConnection.start();
      this.isConnected = true;
      console.log('SignalR Connected');
      this.setupSignalRHandler();
      this.loadNotifications();
    } catch (err) {
      this.isConnected = false;
      console.error('Error connecting to SignalR:', err);
      console.log('Attempting to reconnect in 5 seconds...');
      setTimeout(() => this.startConnection(), 5000);
    }
  }

  private setupSignalRHandler(): void {
    this.hubConnection.off('ReceiveNotification');
    console.log('Setting up SignalR notification handler');

    this.hubConnection.on(
      'ReceiveNotification',
      (notification: Notification) => {
        console.log('SignalR event received:', notification);
        this.ngZone.run(() => {
          // Update the local notifications state
          const currentNotifications = this.notificationsSubject.value;
          const updatedNotifications = [notification, ...currentNotifications];
          this.notificationsSubject.next(updatedNotifications);
        });
      }
    );
  }

  loadNotifications(): void {
    this.http.get<Notification[]>(`${this.controllerUrl}/unread`).subscribe({
      next: (notifications) => {
        this.notificationsSubject.next(notifications);
      },
      error: (err) => console.error('Error loading notifications:', err),
    });
  }

  getUnreadNotifications(): Observable<Notification[]> {
    return this.notifications$;
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
}
