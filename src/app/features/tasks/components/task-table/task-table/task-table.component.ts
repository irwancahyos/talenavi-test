// ********** Imports **********
import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { TaskService } from 'src/app/core/task-service/task-service.service';
import { FormControl } from '@angular/forms';
import { SubSink } from 'subsink';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Output, EventEmitter} from '@angular/core';

// ********** Data Model **********
export interface TaskData {
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

// ********** Mockup Data **********
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
export class TaskTableComponent implements OnInit, OnDestroy, OnChanges {
  // ********** Privat and Decorator Variable **********
  private subs = new SubSink();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Output() allTaskToParent = new EventEmitter<TaskData[]>();
  @Input() allTaskFromParent: TaskData[];

  // ********** Constructor **********
  constructor(private taskService: TaskService) {}

  // ********** Variable Init **********
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
  taskType: string[] = [];
  taskChoice: string = 'All Task';
  totalItems: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;
  totalEstimatedSP: number;
  totalActualSP: number;

  // Variable for form handling 
  developerControls = new FormControl();

  // ********** Angular Material Variable **********
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

  // ********** Misc Variable **********
  statusColorMap: Record<string, string> = {
    'Ready to start': 'status-ready',
    'In Progress': 'status-progress',
    'Waiting for review': 'status-review',
    'Pending Deploy': 'status-pending',
    Done: 'status-done',
    Stuck: 'status-stuck',
  };

  priorityColors: Record<string, string> = {
    Critical: 'priority-critical',
    High: 'priority-high',
    Medium: 'priority-medium',
    Low: 'priority-low',
    'Best Effort': 'priority-best-effort',
  };

  typeColors: Record<string, string> = {
    'Feature Enhancements': 'type-feature',
    Other: 'type-other',
    Bug: 'type-bug',
  };

  // ********** Init and store first data when page loaded **********
  ngOnInit(): void {
    // firts assign the table with data from mockup
    this.dataSource.data = TASK_DATA;
    this.getAllDataFromAPI();
  }

  // ********** On Change Lifecycle **********
  ngOnChanges(): void {
    this.getChangeFromParent();
  }

  /**
   * function to edit per line in the table, accept number as parameter (index of data)
   */
  startEdit(i: number) {
    // when edit data also assign developers controls with developers data choosed
    this.developerControls.patchValue(this.dataSource?.data[i]?.developers);

    // then make the edit index with i parameter so in html it will be render edit mode
    this.editRowIndex = i;
  }

  /**
   * function to make table column status be colorfull, and pick data from statusColorMap object above
   */
  getStatusClass(status: string): string {
    return this.statusColorMap[status] || 'status-default';
  }

  /**
   * function to make table column priority be colorfull, and pick data from priorityColors object above
   */
  getPriorityClass(priority: string): string {
    return this.priorityColors[priority] || '';
  }

  /**
   * function to make table column type be colorfull, and pick data from typeColors object above
   */
  getTypeClass(type: string): string {
    return this.typeColors[type] || '';
  }

  /**
   * function to cancel edit mode with make back edit row index to be null not same with index again
   */
  cancelEdit() {
    this.editRowIndex = null;
  }

  /**
   * function to fetch data from API, here the API is saved in the service file
   */
  getAllDataFromAPI() {
    this.taskService.getTasks().then((e) => {
      // get data all task from api as e then store the data in the dataTaskFromRespon variable
      this.dataTaskFromRespon = e;

      // then map the data to match with structure data pattern becuase original data have no date and some else
      this.mapResponseToTaskData(this.dataTaskFromRespon);
    });
  }

  /**
   * function called when theres an change in the search input 
   */
  applyFilter() {
    // if no search input detec so make back data (NOTE: will error here because the data should back to last before filter added)
    if (!this.searchText) {
      this.dataSource.data = this.allTasks.slice(0, 10);
      return;
    }

    // then when input exist create variable and store data filtered base on all field
    const filtered = this.allTasks.filter(
      (task) =>
        task.task?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        task.developers?.some((dev) =>
          dev.toLowerCase().includes(this.searchText.toLowerCase())
        ) ||
        task.priority?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        task.status?.toLowerCase().includes(this.searchText.toLowerCase())
    );

    // assign filtered data to data source (NOTE: will make the UI broken because the data should be limit 10 but code below will make all data fetched)
    this.dataSource.data = filtered;
  }

  /**
   * Function to mapping data allTask to right pattern
   * parameters respon to know the map function called from onInit or another function
   */
  mapResponseToTaskData(response?: any[]) {
    // if there are respon from API then restructure the data
    if (response) {
      // store mapped data in mapped variable
      const mapped = response.map((item) => ({
        task: item.title || '',
        developers: item.developer
          ? item.developer.split(',').map((dev: string) => dev)
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

      // then assign allTask with mapped
      this.allTasks = mapped;

      // assign dataSource data with slice because we just show 10 data in each page
      this.dataSource.data = mapped.slice(0, 10);

      // assign total items base on data all task count
      this.totalItems = mapped.length;
    } else {
      // when function called from another functiton, then just create variable start and end index
      const startIndex = this.pageIndex * this.pageSize;
      const endIndex = startIndex + this.pageSize;

      // assign data to datasource base on last change with parameters start and end index
      this.dataSource.data = this.allTasks.slice(startIndex, endIndex);

      // then update total items with latest data after modified
      this.totalItems = this.allTasks.length;
    }

    // recalculate estimated and actual
    this.getTotalEstimatedSP();
    this.getTotalActualSP();
    this.getTaskType();
    this.getAllUniqueDevelopers();
    this.sendAllTaskToParent(this.allTasks);
  }

  /**
   * Function to refresh data
   */
  getChangeFromParent() {
    // Assign with new value from another components
    this.allTasks = this.allTaskFromParent;

    // when function called from another functiton, then just create variable start and end index
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    // assign data to datasource base on last change with parameters start and end index
    this.dataSource.data = this.allTasks.slice(startIndex, endIndex);

    // then update total items with latest data after modified
    this.totalItems = this.allTasks.length;

    // recalculate estimated and actual
    this.getTotalEstimatedSP();
    this.getTotalActualSP();
    this.getTaskType();
    this.getAllUniqueDevelopers();
  }

  /**
   * Call when user decided to create new task from button above table
   */
  createNewTask() {
    // generate new variable who save all field from task
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

    // add generate variable to dataSource with spead (NOTE: will make the UI wierd because when data 10 and create task will make data be 11 in UI)
    this.dataSource.data = [newTask, ...this.dataSource.data];

    // make index 0 so new data will placed to the most of top
    this.editRowIndex = 0;
  }

  /**
   * Function to split developers from ['halo, halo'] to be ['halo', 'halo']
   */
  splitDevelopers(developers: string[]): string[] {
    // Find any empty array
    developers = developers.filter((el) => el !== '');

    return developers.flatMap((dev) => dev.split(',').map((d) => d.trim()));
  }

  /**
   * Called when user want to save row
   * parameters taskName because currenty i dont have id of data, so find the index with taskName
   */
  saveRow(taskName: string) {
    // find index of task base on task name
    const indexOfTask = this.allTasks.findIndex((el) => el?.task === taskName);

    // assign new variable with one data of task base on index getted
    const row = this.allTasks[indexOfTask];
    row.developers = [];

    // Check the value is array or isn't because when user edit data it will  be string
    if (Array.isArray(this.developerControls.value)) {
      row.developers.push(this.developerControls.value.join(''));
    } else {
      row.developers.push(this.developerControls.value);
    }

    // then assign row of developers with data who already splited and convert to array of string
    row.developers = this.splitDevelopers(row.developers);

    // send latest data to parent to use in another components
    this.sendAllTaskToParent(this.allTasks);

    // call getUniqDevelopers again to make sure data dropdown match with developers data
    this.getAllUniqueDevelopers();
    this.editRowIndex = null;

    // recalculate estimated and actual
    this.getTotalEstimatedSP();
    this.getTotalActualSP();
  }

  /**
   * Function delete task who matched with task name since i dont have id yet
   */
  deleteRow(taskName: string) {
    // find index of task base on task name
    const indexOfTask = this.allTasks.findIndex((el) => el.task === taskName);

    // splice or delete index finded
    this.allTasks.splice(indexOfTask, 1);

    // send latest data to parent so the another component get latest data of allTask
    this.sendAllTaskToParent(this.allTasks);

    // make it back to read mode
    this.editRowIndex = null;

    // call map data to re map data allTask who already change
    this.mapResponseToTaskData();

    // recalculate estimated and actual
    this.getTotalEstimatedSP();
    this.getTotalActualSP();
  }

  /**
   * Called when there are change in the datepicker / choose date
   */
  onDateChange(date: Date, index: number) {
    this.dataSource.data[index].date = date;
  }

  /**
   * Function to check is all data selected by checkbox
   */
  isAllSelected(): boolean {
    // get total data selected 
    const numSelected = this.selection.selected.length;
    // get data total data source (NOTE: will error because it will pick from just one page)
    const numRows = this.dataSource.data.length;
    // return boolean the length same or not ? if same mean all select if not mean just some data selected
    return numSelected === numRows;
  }

  /**
   * Called when all checkbox in the top choose
   */
  toggleAllRows() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  /**
   * Called when checkbox choose for assign in the aria-label property
   */
  checkboxLabel(row?: TaskData): string {
    // check is row send from html exist
    if (!row) {
      // if no row send then check isAllSelected to send aria-label deselect all or select all
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    // if row send then check isAllSelected to send aria-label deselect all or select all
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }

  /**
   * Called to calculate percentate color in the status below column
   */
  getStatusDistribution(): { class: string; percentage: number }[] {
    // create variable to store how much per status appear example : done: 2 and else
    const countMap: Record<string, number> = {};
    // create variable orderMap to setting the order from 0 - 3 or else
    const orderMap: Record<string, number> = {};
    // create total from datasource count
    const total = this.dataSource?.data.length || 1;

    // iterate dataSource.data to get data all status in the table
    this.dataSource?.data.forEach((task, index) => {
      const status = task.status;

      // if the status is empty so just rerturn without anything
      if (!status) return;

      // then fill status in the countMap with value for example done: 4 and else from each iterate + 1
      countMap[status] = (countMap[status] || 0) + 1;

      // orderMap store data who appear first time but not exist in orderMap and structure it in the index example done: 0, 0 from index when iterate foreach
      if (!(status in orderMap)) {
        orderMap[status] = index;
      }
    });

    // here from object countMap we translate to nested array example, {name: 'irwan'} to [['name','irwan']], then sort base on order map and finaly map the result as class and percentage
    return Object.entries(countMap)
      .sort((a, b) => orderMap[a[0]] - orderMap[b[0]])
      .map(([status, count]) => ({
        class:
          this.statusColorMap[status as keyof typeof this.statusColorMap] ||
          'default-status',
        percentage: (count / total) * 100,
      }));
  }

  /**
   * Called to calculate percentate color in the priority below column
   */
  getPriorityDistribution(): { class: string; percentage: number }[] {
    // create variable to store how much per status appear example : done: 2 and else
    const countMap: Record<string, number> = {};
    // create variable orderMap to setting the order from 0 - 3 or else
    const orderMap: Record<string, number> = {};
    // create total from datasource count
    const total = this.dataSource?.data.length || 1;

    // iterate dataSource.data to get data all priority in the table
    this.dataSource?.data.forEach((task, index) => {
      const priority = task.priority;

      // if the status is empty so just rerturn without anything
      if (!priority) return;

      // then fill priority in the countMap with value for example done: 4 and else from each iterate + 1
      countMap[priority] = (countMap[priority] || 0) + 1;

      // orderMap store data who appear first time but not exist in orderMap and structure it in the index example high: 0, 0 from index when iterate foreach
      if (!(priority in orderMap)) {
        orderMap[priority] = index;
      }
    });

    // here from object countMap we translate to nested array example, {name: 'irwan'} to [['name','irwan']], then sort base on order map and finaly map the result as class and percentage
    return Object.entries(countMap)
      .sort((a, b) => orderMap[a[0]] - orderMap[b[0]])
      .map(([priority, count]) => ({
        class: this.getPriorityClass(priority),
        percentage: (count / total) * 100,
      }));
  }

  /**
   * Called to calculate type color in the priority below column
   */
  getTypeDistribution(): { class: string; percentage: number }[] {
    // create variable to store how much per status appear example : done: 2 and else
    const countMap: Record<string, number> = {};
    // create variable orderMap to setting the order from 0 - 3 or else
    const orderMap: Record<string, number> = {};
    // create total from datasource count
    const total = this.dataSource?.data.length || 1;

    // iterate dataSource.data to get data all priority in the table
    this.dataSource?.data.forEach((task, index) => {
      const rawType = task.type;

      // if the status is empty so just rerturn without anything
      if (!rawType) return;

      // assign type with type who trimmed and convert to lowecase
      const type = rawType.trim().toLowerCase();

      // then fill type in the countMap with value for example done: 4 and else from each iterate + 1
      countMap[type] = (countMap[type] || 0) + 1;

      // orderMap store data who appear first time but not exist in orderMap and structure it in the index example other: 0, 0 from index when iterate foreach
      if (!(type in orderMap)) {
        orderMap[type] = index;
      }
    });

    // here from object countMap we translate to nested array example, {name: 'irwan'} to [['name','irwan']], then sort base on order map and finaly map the result as class and percentage
    return Object.entries(countMap)
      .sort((a, b) => orderMap[a[0]] - orderMap[b[0]])
      .map(([type, count]) => ({
        class: this.getTypeClasses(type),
        percentage: (count / total) * 100,
      }));
  }

  /**
   * Called to create dropdown developers filter without duplicate
   */
  getAllUniqueDevelopers() {
    // create devSet to make the variable have behavior like Set()
    const devSet = new Set<string>();

    // iterate dataSource .data to get all developers
    this.dataSource.data.forEach((task) => {
      task.developers?.forEach((dev) => devSet.add(dev.trim()));
    });

    // assign as array of string developers
    this.uniqueDevelopers = Array.from(devSet);
  }

  /**
   * Method when theres change in the input field to find developers in the dropdown
   */
  applyDeveloperFilter() {
    // get data from search with translate to lowercase and trimmed
    const search = this.searchPerson?.toLowerCase().trim();

    // if no data in search make all the developers list
    if (!search) {
      this.getAllUniqueDevelopers();
      return;
    }

    // if search exist, filter uniqdeveloper and assign to new variable
    const filtered = this.uniqueDevelopers.filter((dev) =>
      dev.toLowerCase().includes(search)
    );

    // then assign uniqDevelopers with value already filtered
    this.uniqueDevelopers = filtered;
  }

  /**
   * Called when user select one developer in the dropdown
   */
  onDeveloperSelected(event: any) {
    // catch the value
    const value = event.option.value;

    // if all make back all data or call function to select developer
    if (value === 'All') {
      this.searchPerson = '';
      this.dataSource.data = this.allTasks.slice(0, 10);
    } else {
      this.searchPerson = value;
      this.applyDeveloperFilterSelect();
    }
  }

  /**
   * Called when developer choose another all in dropodown developers filter
   */
  applyDeveloperFilterSelect() {
    // catch the search key
    const search = this.searchPerson;

    // if all then make back data
    if (!search || search === 'All') {
      this.dataSource.data = this.allTasks;
      return;
    }

    // create and assign new variable with task who already filtered
    const filtered = this.allTasks?.filter((task) =>
      task.developers?.some((dev) => dev.includes(search))
    );

    // assign table data with new value
    this.dataSource.data = filtered;
  }

  /**
   * Function to make dropdown type in the filter type
   */
  getTaskType() {
    // get data all type
    this.dataSource.data?.forEach((el) => {
      if (el?.type) {
        this.taskType.push(el?.type);
      }
    });

    // assign with no duplicate value, so the result is array of string
    this.taskType = [...new Set(this.taskType)];
  }

  /**
   * Helper to getTypeDistribution() function to assign the type with parameter types
   */
  getTypeClasses(type: string | undefined): string {
    // if no type send then return type other
    if (!type) return 'type-other';

    // create new variable store type with no whitespace and it as lowercase
    const normalized = type.trim().toLowerCase();

    // create object type key and value
    const typeColors: Record<string, string> = {
      'feature enhancements': 'type-feature',
      other: 'type-other',
      bug: 'type-bug',
    };

    // return type color base on normalized variable
    return typeColors[normalized] || 'type-other';
  }

  /**
   * Function to calculate all data of estimated SP per page to show total in the below
   */
  getTotalEstimatedSP(): number {
    this.totalEstimatedSP = 0;
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const dataTaskSlice = this.allTasks.slice(startIndex, endIndex);

    return (this.totalEstimatedSP = dataTaskSlice.reduce(
      (cur: number, acc: TaskData) => Number(cur) + Number(acc.estimatedSP),
      0
    ));
  }

  /**
   * Function to calculate all data of actual SP per page to show total in the below
   */
  getTotalActualSP(): number {
    this.totalActualSP = 0;
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const dataTaskSlice = this.allTasks.slice(startIndex, endIndex);

    return (this.totalActualSP = dataTaskSlice.reduce(
      (cur: number, acc: TaskData) => Number(cur) + Number(acc.actualSP),
      0
    ));
  }

  /**
   * When type task above table choice it will trigger this function to mapped task base on task type
   * Parameter typeTask string use to parameter flter in the all data
   */
  mappedTaskBaseOnTaskType(typeTask: string) {
    // Change value taskChoice to render task appear in the UI
    this.taskChoice = typeTask;

    // IF typeTask is All Task then give back data all task who saved in allTask
    if (typeTask === 'All Task') {
      this.dataSource.data = this.allTasks.slice(0, 10);
      return;
    }

    // If typeTask another then filter dataSource base on parameter given to mapped task base on type
    const filteredTaskType = this.allTasks?.filter((el) => {
      return el.type === typeTask;
    });

    // Then reassign dataSource with data task filtered
    this.dataSource.data = filteredTaskType;
  }

  /**
   * Paginator
   */
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    // Call data again with paginator
    this.updatePagedData(startIndex, endIndex);
  }

  /**
   * Function to update page data base on current page
   */
  updatePagedData(start?: number, end?: number) {
    // Do operation to update page data
    this.dataSource.data = this.allTasks.slice(start, end);

    // recalculate estimated and actual
    this.getTotalEstimatedSP();
    this.getTotalActualSP();
  }

  /**
   * Function to send data to parent with purpose another components get latest data
   */
  sendAllTaskToParent(value: TaskData[]) {
    this.allTaskToParent.emit(value);
  }

  /**
   * clear all the subscribing when component destroyed
   */
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
