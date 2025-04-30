import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TasksRoutingModule } from './tasks-routing.module';
import { TaskTableComponent } from './components/task-table/task-table/task-table.component';
import { TaskKanbanComponent } from './components/task-kanban/task-kanban/task-kanban.component';
import { DashboardComponent } from './pages/task-dashboard/dashboard/dashboard.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatTableModule} from '@angular/material/table';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatPaginatorModule} from '@angular/material/paginator';
import {DragDropModule} from '@angular/cdk/drag-drop';


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
    MatMenuModule,
    NgSelectModule,
    FormsModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    DragDropModule
  ],
  exports: [
    DashboardComponent
  ]
})
export class TasksModule { }
