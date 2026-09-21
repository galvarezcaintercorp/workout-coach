import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WorkoutTimer } from './features/workout/components/workout-timer/workout-timer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, WorkoutTimer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('workout-coach');
}
