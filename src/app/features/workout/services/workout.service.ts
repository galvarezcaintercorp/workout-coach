import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class WorkoutService {
  getWorkout(): Observable<any> {
    return of({
      exercise_name: 'Sentadillas con salto',
      repetitions_number: 2,
      repetition_time: 30,
      rest_time: 10
    }).pipe(delay(300));
  }
}

