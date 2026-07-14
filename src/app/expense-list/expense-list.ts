import { Component, ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { Navbar } from "../navbar/navbar";
import {CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TrackerItem {
  id: number;
  name: string;
  amount: number;
  date: string;
  type:'expense' | 'reservation' | 'income';
  notes?: string;
  isPaid?: boolean;
}

@Component({
  selector: 'app-expense-list',
  imports: [Navbar, CommonModule, FormsModule],
  templateUrl: './expense-list.html',
  styleUrl: './expense-list.css',
  standalone: true
})
export class ExpenseList implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private readonly STORAGE_KEY = 'financial_tracker_items';

isFormVisible : boolean = false;
currentTab: 'all' | 'income' | 'expenses' | 'reservations' = 'all';
selectedMonth: string = 'all';
items: TrackerItem[] = [];

ngOnInit(): void {
  if (this.isBrowser()) {
    const savedData = localStorage.getItem(this.STORAGE_KEY);
    if (savedData) {
      try {
        this.items = JSON.parse(savedData);
      } catch (e) {
        console.error('Error parsing saved data from localStorage', e);
        this.items = [];
      }
      }
    }
  }

  private saveToStorage(): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

get totalBalance(): number {
  return this.items.reduce((acc, item) => {
    if (item.type === 'income') return acc + item.amount;
    return acc - item.amount;
  }, 0)
}

get availableMonths(): string[] {
    const months = this.items
      .filter(item => item.date)
      .map(item => item.date.substring(0, 7)); // Slices '2026-06-18' down to '2026-06'
    return [...new Set(months)].sort().reverse(); // Unique sorted list, newest first
  }

toggleForm(): void {
  this.isFormVisible = !this.isFormVisible;
  this.cdr.markForCheck();
}

setTab(tab: 'all' | 'income' | 'expenses' | 'reservations'): void {
  this.currentTab = tab;
  this.cdr.markForCheck();
}

get filteredItems(): TrackerItem[] {
  if (this.currentTab === 'income') { return this.items.filter(i => i.type === 'income'); }
  if (this.currentTab === 'expenses') { return this.items.filter(i => i.type === 'expense'); }
  if (this.currentTab === 'reservations') { return this.items.filter(i => i.type === 'reservation'); }
  return this.items;
}

// Aggregated totals reflecting ONLY the currently selected month frame
  get totalIncome(): number {
    return this.filteredItems
      .filter(i => i.type === 'income')
      .reduce((sum, i) => sum + i.amount, 0);
  }

  get totalExpenses(): number {
    return this.filteredItems
      .filter(i => i.type === 'expense')
      .reduce((sum, i) => sum + i.amount, 0);
  }

  get totalReservations(): number {
    return this.filteredItems
      .filter(i => i.type === 'reservation')
      .reduce((sum, i) => sum + i.amount, 0);
  }

addItem(event: Event): void {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  //Grabbing inputs from the DOM
  const nameInput = form.querySelector(`#name`) as HTMLInputElement;
  const amountInput = form.querySelector(`#amount`) as HTMLInputElement;
  const dateInput = form.querySelector(`#date`) as HTMLInputElement;
  const typeSelect = form.querySelector('#type') as HTMLSelectElement;

  if (nameInput && amountInput && dateInput && typeSelect) {
    const cleanAmountString = amountInput.value.replace(',', '.');
      const parsedAmount = parseFloat(cleanAmountString)};

  if (nameInput.value && amountInput.value && typeSelect) {
    const newItem: TrackerItem = {
      id: Date.now(),
      name: nameInput.value,
      amount: parseFloat(amountInput.value) || 0,
      date: dateInput.value,
      type: typeSelect.value as 'expense' | 'reservation' | 'income'
    };
    
    //Update array
    this.items.push(newItem);
    //save progress
    this.saveToStorage();
    //reset form and hide it
    form.reset();
    this.isFormVisible = false;
    this.cdr.markForCheck();
  }
}

toggleExpensePaid(item: TrackerItem): void {
  if (item.type === 'expense') {
    item.isPaid = !item.isPaid;
    this.saveToStorage();
    this.cdr.markForCheck();
  }
}

//Capability to deduct money from a reservation pot
deductFromReservation(item: TrackerItem): void {
const promptValue = prompt(`How much would you like to take from your "${item.name}" reservation?`);
if (promptValue === null) return; // User cancelled

const cleanInput = promptValue.replace(',', '.');
const deductAmount = parseFloat(cleanInput);

if (!isNaN(deductAmount) && deductAmount > 0) {
  if (deductAmount > item.amount) {
    alert(`You can't take more than the remaining balance (€${item.amount.toFixed(2)})!`);
        return;
  }

  //reduce the amount in the reservation
  item.amount -= deductAmount;
  this.saveToStorage();
  this.cdr.markForCheck();
  } else if (promptValue !== '') {
    alert('Please enter a valid numeric amount.');
  }
}

//Add money directly to a reservation pot
addToReservation(item: TrackerItem): void {
  const promptValue = prompt(`How much would you like to add to your "${item.name}" reservation?`);
  if (promptValue === null) return; // User cancelled

const cleanInput = promptValue.replace(',', '.');
const addAmount = parseFloat(cleanInput);

if (!isNaN(addAmount) && addAmount > 0) {
  item.amount += addAmount;
  this.saveToStorage();
  this.cdr.markForCheck();
} else if (promptValue !== '') {
  alert('Please enter a valid numeric amount.');
}
}

deleteItem(id: number) {
  this.items = this.items.filter(item => item.id !== id);
  this.saveToStorage();
  this.cdr.markForCheck();
}
}