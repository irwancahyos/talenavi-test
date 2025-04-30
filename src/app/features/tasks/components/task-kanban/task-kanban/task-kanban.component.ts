import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import {
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { TaskData } from '../../task-table/task-table/task-table.component';
import { MatDialog } from '@angular/material/dialog';
import { CreateTaskDialogComponent } from 'src/app/shared/create-task-dialog/create-task-dialog.component';
import { SubSink } from 'subsink';

type Status = "Ready to start" | "In Progress" | "Waiting for review" | "Pending Deploy" | "Done" | "Stuck";

@Component({
  selector: 'app-task-kanban',
  templateUrl: './task-kanban.component.html',
  styleUrls: ['./task-kanban.component.scss'],
  standalone: false,
})
export class TaskKanbanComponent implements OnInit, OnDestroy, OnChanges {
  // Decorator variable
  @Input() allTaskFromParent: TaskData[] = [];
  @ViewChild('scrollZone') scrollZone!: ElementRef;
  @Output() allTaskToParent = new EventEmitter<TaskData[]>();

  // Private variable
  private subs = new SubSink();

  // Misc Variable
  searchText: string = '';
  searchPerson: string = '';
  uniqueDevelopers: string[] = [];
  mappedTaskByStatus: any[] = [];
  headerTaskStatus: Status[] = [
    'In Progress',
    'Ready to start',
    'Waiting for review',
    'Done',
    'Stuck',
    'Pending Deploy',
  ];

  // Variable angualr material
  readonly dialog = inject(MatDialog);

  // Variable to make the zone of card container is able to drag to see the edge of card who hidden by scroll
  isDragging: boolean = false;
  startX: number = 0;
  startY: number = 0;
  scrollLeft: number = 0;
  scrollTop: number = 0;

  // ******** Constructor Lifecycle ********
  constructor() {}

  // ******** onInit Lifecycle ********
  ngOnInit(): void {}

  // ******** onCahnges Lifecycle ********
  ngOnChanges(): void {
    // Map task base on their task
    this.mappedAllTaskBaseStatus(this.allTaskFromParent);

    // get uniq developer purpose to dropdown filter developer
    this.getAllUniqueDevelopers();
  }

  /**
   * Method to filter kanban base on text search
   */
  applyFilter() {
    // If the search empty it will render all data who mapped base on task status in the kanban
    if (!this.searchText) {
      this.mappedAllTaskBaseStatus(this.allTaskFromParent);
      return;
    }

    // If the search exist, then create new variable to store task who filtered base on text search
    const filtered = this.allTaskFromParent.filter(
      (task) =>
        task.task?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        task.developers?.some((dev) =>
          dev.toLowerCase().includes(this.searchText.toLowerCase())
        ) ||
        task.priority?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        task.status?.toLowerCase().includes(this.searchText.toLowerCase())
    );

    // Then re-map task base on status but with data all task who already filtered
    this.mappedAllTaskBaseStatus(filtered);
  }

  /**
   * Method to get all uniq developers, because we have duplicat developers when store directly in variable
   */
  getAllUniqueDevelopers() {
    // make the variable empty so it will not make duplicate
    this.uniqueDevelopers = [];

    // make the variable to store built in method from javascript with purpose make the value is uniq
    const devSet = new Set<string>();

    // get all data from task then pick only the developer as jamak to store and send in the devSet to make it uniq
    this.allTaskFromParent.forEach((task) => {
      task.developers?.forEach((dev) => devSet.add(dev.trim()));
    });

    // store as array of string in the uniqueDevelopers variable
    this.uniqueDevelopers = Array.from(devSet);
  }

  /**
   * Method when theres change in the input field to find developers in the dropdown
   */
  applyDeveloperFilter() {
    // store search person who already trimmed to delete whitespace in the search 
    const search = this.searchPerson?.toLowerCase().trim();

    // if theres no search input then show all developer in the dropdown
    if (!search) {
      this.getAllUniqueDevelopers();
      return;
    }

    // if theres search input then mapped data from developers who match with search keyword
    const filtered = this.uniqueDevelopers.filter((dev) =>
      dev.toLowerCase().includes(search)
    );

    // then assign new value with developers who already filtered
    this.uniqueDevelopers = filtered;
  }

  /**
   * Method when select developer in dropdown
   */
  onDeveloperSelected(event: any) {
    // catch value from event as variable
    const value = event.option.value;

    // check when value all show the data all task or call the method to re-map data task base on developer selected
    if (value === 'All') {
      this.searchPerson = '';
      this.mappedAllTaskBaseStatus(this.allTaskFromParent);
    } else {
      this.searchPerson = value;
      this.applyDeveloperFilterSelect();
    }
  }

  /**
   * Remapped data task base on developer selected
   */
  applyDeveloperFilterSelect() {
    const search = this.searchPerson;

    // if value all show all data task
    if (!search || search === 'All') {
      this.mappedAllTaskBaseStatus(this.allTaskFromParent);
      return;
    }

    // if user select any option in the dropdown then filter task base on developer selected
    const filtered = this.allTaskFromParent?.filter((task) =>
      task.developers?.some((dev) => dev.includes(search))
    );

    // then re-mapped data base on status with parameter data task who already filtered
    this.mappedAllTaskBaseStatus(filtered);
  }

  /**
   * Called when user drag the task in kanban
   */
  drop(event) {
    // if drag to same container
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      // if drag to another container example status Done to Ready to start
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  /**
   * Method to map task to array of array who have same status
   */
  mappedAllTaskBaseStatus(dataTask: TaskData[]): void {
    const statusOrder = [
      'In Progress',
      'Ready to start',
      'Waiting for review',
      'Done',
      'Stuck',
      'Pending Deploy',
    ];

    // Create variable to store key and value example ready to start = [{data}]
    const statusMap: { [key: string]: TaskData[] } = {};

    // Assign all status key with empty array for initiate example ready to start:[]
    statusOrder.forEach((status) => {
      statusMap[status] = [];
    });

    // Fill the array base on status
    dataTask.forEach((task) => {
      if (statusMap[task.status]) {
        statusMap[task.status].push(task);
      }
    });

    // Remove the key
    this.mappedTaskByStatus = statusOrder.map((status) => statusMap[status]);
  }

  /**
   * Method to send latest task data to parent to make the table is uptudate with kanban
   */
  sendLatestTaskToParent(task: TaskData[]) {
    this.allTaskToParent.emit(task);
  }

  /**
   * Method to handle when data in the kanban is moved between container or same container
   */
  dragCard(event: CdkDragDrop<string[]>, i: number): void {
    // If drag task just in the same component
    if (event?.previousContainer === event?.container) {
      // Use built in function from drag and drop to move task to another index
      moveItemInArray(
        this.mappedTaskByStatus[i],
        event?.previousIndex,
        event?.currentIndex
      );
    } else {
      // If the task drag to another container then :
      // Catch the task to changge his status
      const draggedTask = event?.item?.data;

      // Get index the task who moved from main data
      const indexOfTaskDragged = this.allTaskFromParent.findIndex((el) => {
        return el.task === draggedTask.task;
      });

      // Assign new status from that task base on who the task moved
      this.allTaskFromParent[indexOfTaskDragged].status =
        this.headerTaskStatus[i];

      // Use built in function to make task moved in the another container
      transferArrayItem(
        event?.previousContainer?.data,
        event?.container?.data,
        event?.previousIndex,
        event?.currentIndex
      );
    }
  }

  /**
   * Method to handle when data in the kanban is moved between container or same container
   */
  editTask(dataTask: TaskData) {
    // get the index of task
    const taskEditedIndex = this.allTaskFromParent.findIndex(
      (el) => el.task === dataTask.task
    );

    // open dialog create task and edit task send data task to patch in the input field
    this.subs.sink = this.dialog
      .open(CreateTaskDialogComponent, {
        width: '40rem',
        disableClose: true,
        autoFocus: false,
        data: dataTask,
      })
      .afterClosed()
      .subscribe((dataTaskEdited) => {
        if (dataTaskEdited) {
          // after close replace data edited base index with new data
          this.allTaskFromParent[taskEditedIndex] = dataTaskEdited;
          // reMapping base on task status to appear in the UI
          this.remappedAndSendLatestTaskToParent();
        }
      });
  }

  /**
   * Method to reMaping data to send parent
   */
  remappedAndSendLatestTaskToParent() {
    this.mappedAllTaskBaseStatus(this.allTaskFromParent);
    this.sendLatestTaskToParent(this.allTaskFromParent);
  }

  /**
   * Function to create new task with open dialog create new task
   */
  openNewTask() {
    this.subs.sink = this.dialog
      .open(CreateTaskDialogComponent, {
        width: '40rem',
        disableClose: true,
        autoFocus: false,
      })
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          // after close add new data in the most of top data task
          this.allTaskFromParent.unshift(value);
          // remapping data 
          this.remappedAndSendLatestTaskToParent();
        }
      });
  }

  /**
   * Function called when user click in the drag zone
   */
  startDrag(event: MouseEvent) {
    this.isDragging = true;
    this.startX = event.pageX - this.scrollZone.nativeElement.offsetLeft;
    this.startY = event.pageY - this.scrollZone.nativeElement.offsetTop;
    this.scrollLeft = this.scrollZone.nativeElement.scrollLeft;
    this.scrollTop = this.scrollZone.nativeElement.scrollTop;
  }

  /**
   * Function called when user move the task
   */
  onDrag(event: MouseEvent) {
    if (!this.isDragging) return;
    event.preventDefault();
    const x = event.pageX - this.scrollZone.nativeElement.offsetLeft;
    const y = event.pageY - this.scrollZone.nativeElement.offsetTop;
    const walkX = x - this.startX;
    const walkY = y - this.startY;
    this.scrollZone.nativeElement.scrollLeft = this.scrollLeft - walkX;
    this.scrollZone.nativeElement.scrollTop = this.scrollTop - walkY;
  }

  /**
   * Function called when user release the click, relvan with startDrag() function 
   */
  endDrag() {
    this.isDragging = false;
  }

    // ******** ngOnDestroy Lifecycle ********
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
