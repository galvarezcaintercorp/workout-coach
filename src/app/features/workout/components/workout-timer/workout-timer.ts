import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { WorkoutService } from '../../services/workout.service';

@Component({
  selector: 'app-workout-timer',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatChipsModule
  ],
  templateUrl: './workout-timer.html',
  styleUrl: './workout-timer.scss'
})
export class WorkoutTimer implements OnInit {
  public workout: any = null;
  public loading = true;
  public running = false;
  public finished = false;
  public phase = 'idle';
  public secondsLeft = 0;
  public repetitionsDone = 0;
  public message = '';
  public toastLeaving = false;

  public intervalId: any = null;
  public toastOutTimeoutId: any = null;
  public toastHideTimeoutId: any = null;

  constructor(private workoutService: WorkoutService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.workoutService.getWorkout().subscribe((data: any) => {
      this.workout = data;
      this.secondsLeft = data.repetition_time;
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  play() {
    if (this.workout == null || this.running || this.finished) {
      return;
    }

    if (this.phase == 'idle') {
      this.phase = 'work';
      this.secondsLeft = this.workout.repetition_time;
      this.notify('Empieza la repetición ' + (this.repetitionsDone + 1));
    }

    this.running = true;
    this.cdr.markForCheck();

    this.intervalId = setInterval(() => {
      this.secondsLeft = this.secondsLeft - 1;

      if (this.secondsLeft <= 0) {
        if (this.phase == 'work') {
          this.phase = 'rest';
          this.secondsLeft = this.workout.rest_time;
          this.notify('¡Tiempo de descanso iniciado!');
        } else {
          this.repetitionsDone = this.repetitionsDone + 1;

          if (this.repetitionsDone >= this.workout.repetitions_number) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.running = false;
            this.finished = true;
            this.phase = 'idle';
            this.secondsLeft = 0;
            this.notify('¡Entrenamiento completado!');
            this.cdr.markForCheck();
            return;
          }

          this.phase = 'work';
          this.secondsLeft = this.workout.repetition_time;
          this.notify('Empieza la repetición ' + (this.repetitionsDone + 1));
        }
      }

      this.cdr.markForCheck();
    }, 1000);
  }

  pause() {
    this.running = false;
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.cdr.markForCheck();
  }

  reset() {
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.running = false;
    this.finished = false;
    this.phase = 'idle';
    this.repetitionsDone = 0;
    this.message = '';
    this.secondsLeft = this.workout ? this.workout.repetition_time : 0;
    this.cdr.markForCheck();
  }

  notify(text: string) {
    clearTimeout(this.toastOutTimeoutId);
    clearTimeout(this.toastHideTimeoutId);

    this.message = text;
    this.toastLeaving = false;

    // 0.5s entrada + 2s visible, luego 0.5s de salida
    this.toastOutTimeoutId = setTimeout(() => {
      this.toastLeaving = true;
      this.cdr.markForCheck();
    }, 2500);

    this.toastHideTimeoutId = setTimeout(() => {
      this.message = '';
      this.toastLeaving = false;
      this.cdr.markForCheck();
    }, 3000);

    if (typeof Notification !== 'undefined') {
      if (Notification.permission == 'granted') {
        new Notification('Workout Coach', { body: text });
      } else if (Notification.permission != 'denied') {
        Notification.requestPermission().then((perm: any) => {
          if (perm == 'granted') {
            new Notification('Workout Coach', { body: text });
          }
        });
      }
    }
  }
}
