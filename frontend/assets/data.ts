import { Delivery, DeliveryStatus, KhataCustomer, KhataTransaction, TransactionType, TraderClientData, TodoItem, TodoStatus, TodoType, StaffMember, AttendanceRecord, SalaryTransaction, SalaryTransactionType, SalaryChangeLog, ExpenseItem, ExpenseCategory, AyushmanClient, AyushmanTaskCategory, Supplier, SupplierTransaction } from '../types/index';

// --- PHARMACY MOCK DATA ---
export const initialDeliveries: Delivery[] = [
    { id: '1', patientName: 'Jane Smith', medications: [{ name: 'Lisinopril 10mg', quantity: 30, status: 'In Stock' }, { name: 'Aspirin 81mg', quantity: 90, status: 'Arriving Today' }], address: '456 Oak Ave, Springfield, IL', contact: '555-0101', status: DeliveryStatus.Pending },
    { id: '2', patientName: 'Bob Johnson', medications: [{ name: 'Metformin 500mg', quantity: 60, status: 'Order Placed' }], address: '789 Pine St, Springfield, IL', contact: '555-0102', status: DeliveryStatus.Pending },
    { id: '3', patientName: 'Alice Williams', medications: [{ name: 'Simvastatin 40mg', quantity: 30, status: 'Pending' }], address: '101 Maple Dr, Springfield,IL', contact: '555-0103', status: DeliveryStatus.Pending },
    { id: '4', patientName: 'Charlie Brown', medications: [{ name: 'Amoxicillin 250mg', quantity: 21, status: 'In Stock' }], address: '222 Elm Ct, Springfield, IL', contact: '555-0104', status: DeliveryStatus.Completed },
    { id: '5', patientName: 'Jane Smith', medications: [{ name: 'Vitamin D 1000IU', quantity: 100, status: 'In Stock' }], address: '456 Oak Ave, Springfield, IL', contact: '555-0101', status: DeliveryStatus.Completed },
];

export const initialKhataCustomers: KhataCustomer[] = [
    { id: 'khata-1', name: 'Ramesh Kumar', contact: '9876543210' },
    { id: 'khata-2', name: 'Sita Sharma', contact: '9876543211' },
    { id: 'khata-3', name: 'Amit Singh', contact: '9876543212' },
];

export const initialKhataTransactions: KhataTransaction[] = [
    { id: 'txn-1', customerId: 'khata-1', type: TransactionType.Credit, amount: 500, notes: 'Paracetamol strips', date: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: 'txn-2', customerId: 'khata-1', type: TransactionType.Credit, amount: 250, notes: 'Cough syrup', date: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: 'txn-3', customerId: 'khata-1', type: TransactionType.Debit, amount: 400, notes: 'Paid via UPI', date: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: 'txn-4', customerId: 'khata-2', type: TransactionType.Credit, amount: 1200, notes: 'Monthly medicines', date: new Date(Date.now() - 10 * 86400000).toISOString() },
    { id: 'txn-5', customerId: 'khata-3', type: TransactionType.Credit, amount: 300, date: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 'txn-6', customerId: 'khata-3', type: TransactionType.Debit, amount: 300, date: new Date().toISOString() },
];

export const initialSuppliers: Supplier[] = [
    { id: 'sup-1', name: 'MedPlus Distributors', contact: '8887776660' },
    { id: 'sup-2', name: 'Wellness Supplies Inc.', contact: '8887776661' },
];

export const initialSupplierTransactions: SupplierTransaction[] = [
    { id: 'stxn-1', supplierId: 'sup-1', type: TransactionType.Credit, amount: 15000, notes: 'Monthly stock order', date: new Date(Date.now() - 8 * 86400000).toISOString() },
    { id: 'stxn-2', supplierId: 'sup-1', type: TransactionType.Debit, amount: 10000, notes: 'Bank Transfer', date: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 'stxn-3', supplierId: 'sup-2', type: TransactionType.Credit, amount: 8500, notes: 'Surgical supplies', date: new Date(Date.now() - 5 * 86400000).toISOString() },
];

// --- AYUSHMAN DISTRIBUTOR DATA ---
export const initialAyushmanClients: AyushmanClient[] = [
    {
        id: 'ayu-1',
        hospitalName: 'Apex Hospital',
        contactPerson: 'Mr. Sharma',
        phone: '9876543210',
        address: '123 Health St, Medicity, Delhi',
        status: 'Active',
        tasks: [
            { id: 'ayu-task-1', description: 'Follow up on implant payment', dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], isCompleted: false, category: AyushmanTaskCategory.PCD_Infiltration },
            { id: 'ayu-task-2', description: 'Send new product catalog', dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], isCompleted: false, category: AyushmanTaskCategory.AyushServe },
            { id: 'ayu-task-3', description: 'Confirm delivery of surgical gloves', dueDate: new Date().toISOString().split('T')[0], isCompleted: true, category: AyushmanTaskCategory.Vertex_Supplies },
        ],
        notes: 'Main point of contact for surgical supplies. Prefers communication via email in the evening.'
    },
    {
        id: 'ayu-2',
        hospitalName: 'Pristine Care Clinic',
        contactPerson: 'Dr. Verma',
        phone: '9876543211',
        address: '456 Wellness Rd, Healthville, Noida',
        status: 'Prospect',
        tasks: [
            { id: 'ayu-task-4', description: 'Initial meeting to present products', dueDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0], isCompleted: false, category: AyushmanTaskCategory.PCD_Infiltration },
        ],
        notes: 'Interested in orthopedic implants. Budget conscious.'
    },
    {
        id: 'ayu-3',
        hospitalName: 'Care & Cure Hospital',
        contactPerson: 'Ms. Gupta',
        phone: '9876543212',
        address: '789 Life Ave, Ghaziabad',
        status: 'Inactive',
        tasks: [],
        notes: 'Previous client. Switched to a different vendor due to pricing. Might be worth revisiting in 6 months.'
    }
];


// --- TRADERS CRM DATA ---
export const traderClientsData: TraderClientData[] = [
    { id: 't-1', name: 'Kc Bhati Kali Charn', phone: '9871849567', route: 'Kasna', status: 'High Priority', outstandingBalance: 15200, assignedTo: 'Kavish' },
    { id: 't-2', name: 'Mg Kasna', phone: '8700259176', route: 'Kasna', status: 'Regular', outstandingBalance: 0, assignedTo: 'Pawan' },
    { id: 't-3', name: 'Bansal Medical Kasna', phone: '9871261924', route: 'Kasna', status: 'Follow Up', outstandingBalance: 5200, assignedTo: 'Kali Chant' },
    { id: 't-4', name: 'New Life Line (Cash)', phone: '9999884820', route: 'Kasna', status: 'Regular', outstandingBalance: 0, assignedTo: 'Sandeep' },
    { id: 't-5', name: 'Shiv Medicos Kali Charn', phone: '9289215341', route: 'Kasna', status: 'Regular', outstandingBalance: 1250, assignedTo: 'Kapil' },
    { id: 't-6', name: 'New Amit Medicos Uni Road', phone: '7982769321', route: 'Kasna', status: 'Follow Up', outstandingBalance: 8000, assignedTo: 'Ravi' },
    { id: 't-7', name: 'Rama Medical Kasna', phone: '9870885454', route: 'Kasna', status: 'Regular', outstandingBalance: 0, assignedTo: 'Rama' },
    { id: 't-8', name: 'Aman Kasna', phone: '8750550814', route: 'Kasna', status: 'High Priority', outstandingBalance: 25000, assignedTo: 'Aman' },
    { id: 't-9', name: 'Rathi Atta Chaki', phone: '9411203821', route: 'Kasna', status: 'Regular', outstandingBalance: 0, assignedTo: 'Jitender' },
    { id: 't-10', name: 'Shiv Medicos Uni Road', phone: '8077073400', route: 'Kasna', status: 'Follow Up', outstandingBalance: 3400, assignedTo: 'Bhavvyh' },
    { id: 't-11', name: 'City Medical Kasna', phone: 'N/A', route: 'Kasna', status: 'Regular', outstandingBalance: 0, assignedTo: 'Shubham' },
    { id: 't-12', name: 'Krishna Medical', phone: 'N/A', route: 'Kasna', status: 'Regular', outstandingBalance: 0, assignedTo: undefined },
    { id: 't-13', name: 'Nayayak Near Balaji Bus Stand', phone: 'N/A', route: 'Kasna', status: 'Regular', outstandingBalance: 0, assignedTo: undefined },
    { id: 't-14', name: 'Gupta Pharma', phone: '9811111111', route: 'Dadri', status: 'Regular', outstandingBalance: 0, assignedTo: 'Shubham' },
    { id: 't-15', name: 'Sai Medicose', phone: '9822222222', route: 'Dadri', status: 'Follow Up', outstandingBalance: 4500, assignedTo: 'Abhishek' },
    { id: 't-16', name: 'Airport Pharmacy', phone: '9833333333', route: 'Jewar', status: 'High Priority', outstandingBalance: 32000, assignedTo: 'Gaurav' },
    { id: 't-17', name: 'Yamuna Expressway Medical', phone: '9844444444', route: 'Jewar', status: 'Regular', outstandingBalance: 0, assignedTo: 'Gaurav' },
    { id: 't-18', name: 'Ansal Plaza Chemist', phone: '9855555555', route: 'Greater Noida', status: 'Regular', outstandingBalance: 1100, assignedTo: 'Shubham' },
    { id: 't-19', name: 'Pari Chowk Pharmacy', phone: '9866666666', route: 'Greater Noida', status: 'Follow Up', outstandingBalance: 9800, assignedTo: 'Abhishek' },
    { id: 't-20', name: 'Gaur City Meds', phone: '9877777777', route: 'Noida Extn', status: 'High Priority', outstandingBalance: 18500, assignedTo: 'Shubham' },
];

export const initialTodos: TodoItem[] = [
  { id: 'todo-1', title: 'Follow up with all high-priority clients in NOIDA EXTN', assignedTo: 'Shubham', type: TodoType.Daily, status: TodoStatus.InProgress, createdAt: new Date().getTime() - 3600000 },
  { id: 'todo-2', title: 'Clear pending payments for KASNA route', assignedTo: 'Abhishek', type: TodoType.Daily, status: TodoStatus.ToDo, createdAt: new Date().getTime() },
  { id: 'todo-3', title: 'Generate monthly sales report', assignedTo: 'Gaurav', type: TodoType.Monthly, status: TodoStatus.ToDo, createdAt: new Date().getTime() - 86400000 * 2 },
  { id: 'todo-4', title: 'Stock verification for top 10 products', assignedTo: 'Gaurav', type: TodoType.Monthly, status: TodoStatus.Completed, createdAt: new Date().getTime() - 86400000 * 5, completedAt: new Date().getTime() - 86400000 },
  { id: 'todo-5', title: 'Call all "Follow Up" status clients in DADRI', assignedTo: 'Shubham', type: TodoType.Daily, status: TodoStatus.ToDo, createdAt: new Date().getTime() },
];

export const initialStaffMembers: StaffMember[] = [
    { id: 'staff-1', name: 'Gaurav Sharma', role: 'Delivery Manager', phone: '9876543210', monthlySalary: 50000 },
    { id: 'staff-2', name: 'Ravi Verma', role: 'Sales Executive', phone: '9876543211', monthlySalary: 45000 },
    { id: 'staff-3', name: 'Priya Singh', role: 'Pharmacist Assistant', phone: '9876543212', monthlySalary: 30000 },
    { id: 'staff-4', name: 'Shubham', role: 'Sales', phone: '9999999999', monthlySalary: 40000 },
    { id: 'staff-5', name: 'Abhishek', role: 'Sales', phone: '8888888888', monthlySalary: 40000 },
    { id: 'staff-6', name: 'Gaurav', role: 'Sales', phone: '7777777777', monthlySalary: 40000 },
    { id: 'staff-7', name: 'Kavish', role: 'Sales', phone: '9871849567', monthlySalary: 41000 },
    { id: 'staff-8', name: 'Pawan', role: 'Sales', phone: '8700259176', monthlySalary: 41000 },
    { id: 'staff-9', name: 'Kali Chant', role: 'Sales', phone: '9871261924', monthlySalary: 41000 },
    { id: 'staff-10', name: 'Sandeep', role: 'Sales', phone: '9999884820', monthlySalary: 41000 },
    { id: 'staff-11', name: 'Kapil', role: 'Sales', phone: '9289215341', monthlySalary: 41000 },
    { id: 'staff-12', name: 'Ravi', role: 'Sales', phone: '7982769321', monthlySalary: 41000 },
    { id: 'staff-13', name: 'Rama', role: 'Sales', phone: '9870885454', monthlySalary: 41000 },
    { id: 'staff-14', name: 'Aman', role: 'Sales', phone: '8750550814', monthlySalary: 41000 },
    { id: 'staff-15', name: 'Jitender', role: 'Sales', phone: '9411203821', monthlySalary: 41000 },
    { id: 'staff-16', name: 'Bhavvyh', role: 'Sales', phone: '8077073400', monthlySalary: 41000 },
];

export const initialAttendanceRecords: AttendanceRecord[] = [];

export const initialSalaryLedger: SalaryTransaction[] = [
    { id: 'sal-1', staffId: 'staff-1', type: SalaryTransactionType.Advance, amount: 2000, notes: 'Family emergency', date: new Date(Date.now() - 10 * 86400000).toISOString() },
    { id: 'sal-2', staffId: 'staff-1', type: SalaryTransactionType.Settlement, amount: 1000, notes: 'Partial settlement', date: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 'sal-3', staffId: 'staff-2', type: SalaryTransactionType.Advance, amount: 500, notes: 'Travel expenses', date: new Date(Date.now() - 5 * 86400000).toISOString() },
];

export const initialSalaryChangeHistory: SalaryChangeLog[] = [
    { id: 'scl-1', staffId: 'staff-1', previousSalary: 48000, newSalary: 50000, changeDate: new Date(Date.now() - 30 * 86400000).toISOString(), changedBy: 'Admin' },
];

export const initialExpenses: ExpenseItem[] = [
    { id: 'exp-1', category: ExpenseCategory.Office, description: 'Office Rent', amount: 25000, date: new Date(new Date().setDate(1)).toISOString(), notes: 'Monthly rent payment' },
    { id: 'exp-2', category: ExpenseCategory.Office, description: 'Electricity Bill', amount: 4500, date: new Date(new Date().setDate(5)).toISOString() },
    { id: 'exp-3', category: ExpenseCategory.Home, description: 'Groceries', amount: 8000, date: new Date(new Date().setDate(7)).toISOString() },
    { id: 'exp-4', category: ExpenseCategory.Home, description: 'School Fees', amount: 12000, date: new Date(new Date().setDate(10)).toISOString(), notes: 'Q2 fees' },
];