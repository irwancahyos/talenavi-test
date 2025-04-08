import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TasksRoutingModule } from './tasks-routing.module';
import { TaskTableComponent } from './components/task-table/task-table/task-table.component';
import { TaskKanbanComponent } from './components/task-kanban/task-kanban/task-kanban.component';
import { DashboardComponent } from './pages/task-dashboard/dashboard/dashboard.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';


@NgModule({
  declarations: [
    TaskTableComponent,
    TaskKanbanComponent,
    DashboardComponent
  ],
  imports: [
    CommonModule,
    TasksRoutingModule,
    MatTabsModule,
    MatIconModule,
    MatMenuModule
  ],
  exports: [
    DashboardComponent
  ]
})
export class TasksModule { }
