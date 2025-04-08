import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TasksRoutingModule } from './tasks-routing.module';
import { TaskTableComponent } from './components/task-table/task-table/task-table.component';
import { TaskKanbanComponent } from './components/task-kanban/task-kanban/task-kanban.component';
import { DashboardComponent } from './pages/task-dashboard/dashboard/dashboard.component';


@NgModule({
  declarations: [
    TaskTableComponent,
    TaskKanbanComponent,
    DashboardComponent
  ],
  imports: [
    CommonModule,
    TasksRoutingModule
  ],
  exports: [
    DashboardComponent
  ]
})
export class TasksModule { }
