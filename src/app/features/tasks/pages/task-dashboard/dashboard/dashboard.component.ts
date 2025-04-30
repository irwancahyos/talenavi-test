// ********** Imports **********
import { Component, OnInit } from '@angular/core';
import { TaskData } from '../../../components/task-table/task-table/task-table.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false,
})
export class DashboardComponent implements OnInit {
  // Variable Declaration
  allTask: TaskData[] = [];

  // ********** Constructor Lifecycle **********
  constructor() {}

  // ********** OnInit Lifecycle **********
  ngOnInit(): void {}

  /**
   * Function to handle changging task from child
   */
  handleAllTask(data: TaskData[]) {
    // re-assign latest data in the allTask
    this.allTask = [...data];
  }

  /**
   * Function to handle changging task from child
   */
  handleAllTaskFromKanban(data: TaskData[]) {
    // re-assign latest data in the allTask
    this.allTask = [...data];
  }
}
