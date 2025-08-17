export enum DeliveryStatus {
  Pending = 'Pending',
  Completed = 'Completed',
}

export type MedicationStatus = 'Pending' | 'Order Placed' | 'Arriving Today' | 'In Stock';

export interface MedicationItem {
  name: string;
  quantity: number;
  status: MedicationStatus;
}

export interface Delivery {
  id: string;
  patientName: string;
  medications: MedicationItem[];
  address: string;
  contact: string;
  status: DeliveryStatus;
}

export interface OptimizedRouteResult {
  customerName: string;
  address: string;
  optimized_order: number;
}

// --- Khata Book Types ---
export enum TransactionType {
  Credit = 'Credit', // Money given to customer (Udhaar) / Goods received from supplier
  Debit = 'Debit',   // Money received from customer (Jama) / Payment made to supplier
}

export interface KhataTransaction {
  id: string;
  customerId: string;
  type: TransactionType;
  amount: number;
  notes?: string;
  date: string; // ISO String for date
  photos?: string[]; // Array of Base64 encoded image strings
}

export interface KhataCustomer {
  id: string;
  name: string;
  contact: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
}

export interface SupplierTransaction {
  id: string;
  supplierId: string;
  type: TransactionType;
  amount: number;
  notes?: string;
  date: string; // ISO String for date
  photos?: string[]; // Array of Base64 encoded image strings
}

// --- Traders CRM Types ---
export type ClientStatus = 'High Priority' | 'Follow Up' | 'Regular';
export type CallState = 'pending' | 'completed' | 'follow-up';

export interface Comment {
  text: string;
  date: number; // timestamp
}

export interface TraderClientData {
    id: string;
    name: string;
    phone: string;
    route: string;
    status: ClientStatus;
    outstandingBalance?: number;
    assignedTo?: string;
    comments?: Comment[];
}

export interface TraderClient extends TraderClientData {
    callState: CallState;
    followUpAt?: number;
    paymentReminderDate?: number;
}

// --- To-Do List Types ---
export enum TodoStatus {
  ToDo = 'To-Do',
  InProgress = 'In Progress',
  Completed = 'Completed',
}

export enum TodoType {
  Daily = 'Daily',
  Monthly = 'Monthly',
}

export interface TodoItem {
  id: string;
  title: string;
  assignedTo: string;
  type: TodoType;
  status: TodoStatus;
  createdAt: number;
  completedAt?: number;
}

// --- Ayushman Distributor Types ---
export type AyushmanClientStatus = 'Active' | 'Prospect' | 'Inactive';

export enum AyushmanTaskCategory {
    PCD_Infiltration = 'PCD Infiltration',
    AyushServe = 'AyushServe',
    Vertex_Supplies = 'Vertex Supplies',
}

export interface AyushmanTask {
    id: string;
    description: string;
    dueDate: string; // YYYY-MM-DD
    isCompleted: boolean;
    category: AyushmanTaskCategory;
}

export interface AyushmanClient {
    id: string;
    hospitalName: string;
    contactPerson: string;
    phone: string;
    address: string;
    status: AyushmanClientStatus;
    tasks: AyushmanTask[];
    notes?: string;
}


// --- Staff Attendance Types ---
export interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  monthlySalary: number;
}

export enum AttendanceStatus {
  Present = 'Present',
  Absent = 'Absent',
  HalfDay = 'Half Day',
}

export interface AttendanceRecord {
  staffId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
}

export enum SalaryTransactionType {
  Advance = 'Advance',     // Money given to staff
  Settlement = 'Settlement', // Money received from staff or salary adjustment
}

export interface SalaryTransaction {
  id: string;
  staffId: string;
  type: SalaryTransactionType;
  amount: number;
  notes?: string;
  date: string; // ISO String for date
}

export interface SalaryChangeLog {
  id: string;
  staffId: string;
  previousSalary: number;
  newSalary: number;
  changeDate: string; // ISO String for date
  changedBy: string;
}

// --- Expense Tracker Types ---
export enum ExpenseCategory {
    Home = 'Home',
    Office = 'Office',
}

export interface ExpenseItem {
    id: string;
    category: ExpenseCategory;
    description: string;
    amount: number;
    date: string; // ISO String for date
    notes?: string;
}