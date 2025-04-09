import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { TaskService } from 'src/app/core/task-service/task-service.service';

// Data Model
interface TaskData {
  task?: string;
  developers?: string[];
  status?:
    | 'Ready to start'
    | 'In Progress'
    | 'Waiting for review'
    | 'Pending Deploy'
    | 'Done'
    | 'Stuck';
  priority?: 'Critical' | 'High' | 'Medium' | 'Low' | 'Best Effort';
  type?: 'Feature Enhancements' | 'Other' | 'Bug';
  date?: string | Date; 
  estimatedSP?: number;
  actualSP?: number;
  developersString?: string;
}

// Mockup Data
let TASK_DATA: TaskData[] = [
  {
    task: 'Implement login page',
    developers: ['Alice', 'Bob'],
    status: 'In Progress',
    priority: 'High',
    type: 'Feature Enhancements',
    date: '31 Mar, 2025',
    estimatedSP: 5,
    actualSP: 3,
  },
  {
    task: 'Fix crash on dashboard',
    developers: ['Charlie'],
    status: 'Ready to start',
    priority: 'Critical',
    type: 'Bug',
    date: '01 Apr, 2025',
    estimatedSP: 3,
    actualSP: 0,
  },
  {
    task: 'Add notification panel',
    developers: ['Alice', 'David'],
    status: 'Waiting for review',
    priority: 'Medium',
    type: 'Feature Enhancements',
    date: '30 Mar, 2025',
    estimatedSP: 8,
    actualSP: 8,
  },
  {
    task: 'Improve API error handling',
    developers: ['Eve'],
    status: 'Pending Deploy',
    priority: 'Low',
    type: 'Other',
    date: '29 Mar, 2025',
    estimatedSP: 2,
    actualSP: 2,
  },
  {
    task: 'Optimize database queries',
    developers: ['Frank'],
    status: 'Done',
    priority: 'Best Effort',
    type: 'Other',
    date: '27 Mar, 2025',
    estimatedSP: 5,
    actualSP: 5,
  },
  {
    task: 'Fix mobile layout bug',
    developers: ['Grace'],
    status: 'Stuck',
    priority: 'High',
    type: 'Bug',
    date: '28 Mar, 2025',
    estimatedSP: 4,
    actualSP: 1,
  },
  {
    task: 'Fix mobile layout bug',
    developers: ['Grace'],
    status: 'Stuck',
    priority: 'High',
    type: 'Bug',
    date: '28 Mar, 2025',
    estimatedSP: 4,
    actualSP: 1,
  },
];
@Component({
  selector: 'app-task-table',
  templateUrl: './task-table.component.html',
  styleUrls: ['./task-table.component.scss'],
  providers: [DatePipe],
  standalone: false,
})
export class TaskTableComponent implements OnInit {
  constructor(private datePipe: DatePipe, private taskService: TaskService) {}

  // Variable Init
  statuses = [
    'Ready to start',
    'In Progress',
    'Waiting for review',
    'Pending Deploy',
    'Done',
    'Stuck',
  ];
  priorities = ['Critical', 'High', 'Medium', 'Low', 'Best Effort'];
  types = ['Feature Enhancements', 'Other', 'Bug'];
  dataTaskFromRespon: any;
  searchText: string = '';
  allTasks: TaskData[] = [];
  uniqueDevelopers: string[] = [];
  searchPerson: string = '';

  // Angular Material Variable
  displayedColumns: string[] = [
    'select',
    'task',
    'developers',
    'status',
    'priority',
    'type',
    'date',
    'estimatedSP',
    'actualSP',
    'action',
  ];

  dataSource = new MatTableDataSource<TaskData>();
  editRowIndex: number | null = null;
  selection = new SelectionModel<TaskData>(true, []);

  startEdit(i: number) {
    this.dataSource.data = this.dataSource.data.map((row) => ({
      ...row,
      developersString: row.developers?.join(', ') || '',
    }));

    this.editRowIndex = i;
    const row = this.dataSource.data[i];
    row.developersString = row.developersString = (row.developers ?? []).join(
      ', '
    );
  }

  ngOnInit(): void {
    this.dataSource.data = TASK_DATA;
    this.getAllUniqueDevelopers();
    this.getAllDataFromAPI();
  }

  statusColorMap: Record<string, string> = {
    'Ready to start': 'status-ready',
    'In Progress': 'status-progress',
    'Waiting for review': 'status-review',
    'Pending Deploy': 'status-pending',
    Done: 'status-done',
    Stuck: 'status-stuck',
  };

  getStatusClass(status: string): string {
    return this.statusColorMap[status] || 'status-default';
  }

  priorityColors: Record<string, string> = {
    Critical: 'priority-critical',
    High: 'priority-high',
    Medium: 'priority-medium',
    Low: 'priority-low',
    'Best Effort': 'priority-best-effort',
  };

  getPriorityClass(priority: string): string {
    return this.priorityColors[priority] || '';
  }

  typeColors: Record<string, string> = {
    'Feature Enhancements': 'type-feature',
    Other: 'type-other',
    Bug: 'type-bug',
  };

  getTypeClass(type: string): string {
    return this.typeColors[type] || '';
  }

  saveEdit() {
    this.editRowIndex = null;
  }

  cancelEdit() {
    this.editRowIndex = null;
  }

  getAllDataFromAPI() {
    this.taskService.getTasks().then((e) => {
      this.dataTaskFromRespon = e;

      this.mapResponseToTaskData(this.dataTaskFromRespon);
    });
  }

  applyFilter() {
    const filtered = this.allTasks.filter(
      (task) =>
        task.task?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        task.developers?.some((dev) =>
          dev.toLowerCase().includes(this.searchText.toLowerCase())
        ) ||
        task.priority?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        task.status?.toLowerCase().includes(this.searchText.toLowerCase())
    );
    this.dataSource.data = filtered;
  }

  mapResponseToTaskData(response: any[]) {
    const mapped = response.map((item) => ({
      task: item.title || '',
      developers: item.developer
        ? item.developer.split(',').map((dev: string) => dev.trim())
        : [],
      status: item.status || '',
      priority: item.priority || '',
      type: item.type || '',
      date: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      estimatedSP: item['Estimated SP'] ?? 0,
      actualSP: item['Actual SP'] ?? 0,
    }));

    this.allTasks = mapped;
    this.dataSource.data = mapped;
    this.getAllUniqueDevelopers();
  }

  createNewTask() {
    const newTask: TaskData & { isNew?: boolean } = {
      task: '',
      developers: [],
      status: 'Ready to start',
      priority: 'Medium',
      type: 'Other',
      date: '',
      estimatedSP: 0,
      actualSP: 0,
      isNew: true,
    };

    this.dataSource.data = [newTask, ...this.dataSource.data];
    this.editRowIndex = 0;
  }

  saveRow(i: number) {
    const row = this.dataSource.data[i];
    row.developers = (row.developersString ?? '')
      .split(',')
      .map((dev) => dev.trim());
    delete row.developersString;
    this.editRowIndex = null;
  }

  deleteRow(index: number) {
    this.dataSource?.data?.splice(index, 1);
    this.dataSource.data = [...this.dataSource.data];
    this.editRowIndex = null;
  }

  onDateChange(date: Date, index: number) {
    console.log(date, 'ini date irwan');
    this.dataSource.data[index].date = date; // simpan sebagai objek Date
  }

  /** Checkbox helper */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  checkboxLabel(row?: TaskData): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }

  getStatusDistribution(): { class: string; percentage: number }[] {
    const countMap: Record<string, number> = {};
    const orderMap: Record<string, number> = {};
    const total = this.dataSource?.data.length || 1;

    this.dataSource?.data.forEach((task, index) => {
      const status = task.status;
      if (!status) return;

      countMap[status] = (countMap[status] || 0) + 1;

      // simpan urutan pertama muncul
      if (!(status in orderMap)) {
        orderMap[status] = index;
      }
    });

    // ubah ke array dan sort berdasarkan urutan kemunculan pertama
    return Object.entries(countMap)
      .sort((a, b) => orderMap[a[0]] - orderMap[b[0]])
      .map(([status, count]) => ({
        class:
          this.statusColorMap[status as keyof typeof this.statusColorMap] ||
          'default-status',
        percentage: (count / total) * 100,
      }));
  }

  getPriorityDistribution(): { class: string; percentage: number }[] {
    const countMap: Record<string, number> = {};
    const orderMap: Record<string, number> = {};
    const total = this.dataSource?.data.length || 1;

    this.dataSource?.data.forEach((task, index) => {
      const priority = task.priority;
      if (!priority) return;

      countMap[priority] = (countMap[priority] || 0) + 1;

      if (!(priority in orderMap)) {
        orderMap[priority] = index;
      }
    });

    return Object.entries(countMap)
      .sort((a, b) => orderMap[a[0]] - orderMap[b[0]])
      .map(([priority, count]) => ({
        class: this.getPriorityClass(priority), // pakai method yang sudah kamu buat
        percentage: (count / total) * 100,
      }));
  }

  getAllUniqueDevelopers() {
    const devSet = new Set<string>();

    this.dataSource.data.forEach((task) => {
      task.developers?.forEach((dev) => devSet.add(dev.trim()));
    });

    this.uniqueDevelopers = Array.from(devSet);
  }

  applyDeveloperFilter() {
    const search = this.searchPerson?.toLowerCase().trim();

    if (!search || search === 'all') {
      this.dataSource.data = this.allTasks;
      return;
    }

    const filtered = this.allTasks.filter((task) =>
      task.developers?.some((dev) => dev.toLowerCase().includes(search))
    );

    this.dataSource.data = filtered;
  }

  onDeveloperSelected(event: any) {
    const value = event.option.value;
    if (value === 'All') {
      this.searchPerson = '';
      this.dataSource.data = this.allTasks;
    } else {
      this.searchPerson = value;
      this.applyDeveloperFilter();
    }
  }

  getTypeDistribution(): { class: string; percentage: number }[] {
    const countMap: Record<string, number> = {};
    const orderMap: Record<string, number> = {};
    const total = this.dataSource?.data.length || 1;
  
    this.dataSource?.data.forEach((task, index) => {
      const rawType = task.type;
      if (!rawType) return;
  
      const type = rawType.trim().toLowerCase();
  
      countMap[type] = (countMap[type] || 0) + 1;
      if (!(type in orderMap)) {
        orderMap[type] = index;
      }
    });
  
    return Object.entries(countMap)
      .sort((a, b) => orderMap[a[0]] - orderMap[b[0]])
      .map(([type, count]) => ({
        class: this.getTypeClasses(type),
        percentage: (count / total) * 100,
      }));
  }

  getTypeClasses(type: string | undefined): string {
    if (!type) return 'type-other'; // fallback kalau undefined
  
    const normalized = type.trim().toLowerCase();
  
    const typeColors: Record<string, string> = {
      'feature enhancements': 'type-feature',
      'other': 'type-other',
      'bug': 'type-bug',
    };
  
    return typeColors[normalized] || 'type-other'; // fallback kalau tidak dikenali
  }

  getTotalEstimatedSP(): number {
    return this.dataSource.data.reduce((acc:any, curr:any) => acc + (curr.estimatedSP || 0), 0);
  }
  
  getTotalActualSP(): number {
    return this.dataSource.data.reduce((acc:any, curr:any) => acc + (curr.actualSP || 0), 0);
  }
}
