import { Component,  } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { appConfig } from './app.config';
import { ExpenseList } from './expense-list/expense-list';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ExpenseList],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true
})
export class App {
  title = 'expense-tracker';
}
