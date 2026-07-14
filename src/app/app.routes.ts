import { Routes } from '@angular/router';
import { ExpenseList } from './expense-list/expense-list';

export const routes: Routes = [
  //  CORRECT: The root path points directly to your layout component
  { path: '', component: ExpenseList },
  
  // Wildcard fallback
  { path: '**', redirectTo: '' }
];