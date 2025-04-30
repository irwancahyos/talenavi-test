// ******** Imports ********
import { Component, inject, Inject, signal, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';


@Component({
  selector: 'app-create-task-dialog',
  templateUrl: './create-task-dialog.component.html',
  styleUrl: './create-task-dialog.component.scss',
  standalone: false,
})
export class CreateTaskDialogComponent implements OnInit, OnDestroy {

  // Variable for mat chip to handle Developers
  readonly addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  readonly developers = signal<string[]>([]);
  readonly announcer = inject(LiveAnnouncer);

  // Variable angualr material
  readonly dialogRef = inject(MatDialogRef<CreateTaskDialogComponent>);

  // Form variable declaration
  taskForm: FormGroup;
  dateControls:string;

  // Initiate dropdown variable
  statusOptions = [
    { key: "inProgress", value: "In Progress" },
    { key: "readyToStart", value: "Ready to start" },
    { key: "waitingForReview", value: "Waiting for review" },
    { key: "done", value: "Done" },
    { key: "stuck", value: "Stuck" },
    { key: "pendingDeploy", value: "Pending Deploy" }
  ];
  
  typeOptions = [
    { key: "featureEnhancements", value: "Feature Enhancements" },
    { key: "other", value: "Other" },
    { key: "bug", value: "Bug" }
  ];
  
  priorityOptions = [
    { key: "critical", value: "Critical" },
    { key: "bestEffort", value: "Best Effort" },
    { key: "high", value: "High" },
    { key: "medium", value: "Medium" },
    { key: "low", value: "Low" }
  ];
  
  // ******** Constructor Lifecycle ********
  constructor(private fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public dataEdit) {}
  
  // ******** NgOnInit Lifecycle ********
  ngOnInit(): void {
    this.initForm();

    // if open data from edit mode, then patch all value to the field
    if(this.dataEdit) {
      // structure data except developers to patch in the taskForm
      const {developers, ...allowPatchExceptDevelopers} = this.dataEdit;

      // patch taskFrom with all value from parents except developers
      this.taskForm.patchValue(allowPatchExceptDevelopers);

      // manualy update developers with value edit from parent
      this.developers.update(() => this.dataEdit.developers);

      if(this.developers().length) {
        // this.taskForm.get('developers').setValue(this.developers());
        this.taskForm.get('developers').clearValidators();
      }

      // structure newDate base data from parent because data from parent is string
      const newDate = new Date(this.dataEdit.date)

      // manualy patch date with data who converted to type date
      this.taskForm.get('date').patchValue(newDate);
      this.taskForm.updateValueAndValidity();
    }
  }

  /**
   * Function to initiate form, called in on init
   */
  initForm() {
    this.taskForm = this.fb.group({
      actualSP: [null, Validators.required],
      date: ["", Validators.required],
      developers: [[], Validators.required],
      estimatedSP: [null, Validators.required],
      priority: ["", Validators.required],
      status: ["", Validators.required],
      task: ["", [Validators.required]],
      type: ["", Validators.required],
    })
  }

  /**
   * Function to add developers in the mat chip
   */
  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our developer
    if (value) {
      this.developers.update(dev => [...dev, value]);
    }

    if(this.dataEdit && !this.developers().length) {
      this.taskForm.get('developers').setValidators(Validators.required);
      this.taskForm.get('developers')?.updateValueAndValidity();
    } 

    // Clear the input value
    event.chipInput!.clear();
  }

  /**
   * Function to handle when some developer delete in mat chip
   */
  remove(developer): void {
    // update value of developers
    this.developers.update(fruits => {
      // find index first
      const index = fruits.indexOf(developer);
      if (index < 0) 
        // return fruits when index not exist
        return fruits;
      
      // delete base on index
      fruits.splice(index, 1);
      this.announcer.announce(`Removed ${developer}`);

      // if from edit then delete some data, so update field to be required because it be unrequired in the onInit
      if(this.dataEdit && !this.developers().length) {
        this.taskForm.get('developers').setValidators(Validators.required);
        this.taskForm.get('developers')?.updateValueAndValidity();
      } 

      // when developers is empty assign taskForm developers with [] also
      if(this.isDevelopersSignalEmpty()) {
        this.taskForm.get('developers').patchValue([]);
      }

      // return fruits
      return [...fruits];
    });
  }

  /**
   * Function to check the signal is empty or not
   */
  isDevelopersSignalEmpty(): boolean {
    return this.developers().length < 1;
  }

  /**
   * function when mat chip edited
   */
  edit(dev, event: MatChipEditedEvent) {
    const value = event.value.trim();

    // Remove developer if it no longer has a name
    if (!value) {
      this.remove(dev);
      return;
    }

    // Edit existing developer
    this.developers.update(developer => {
      const index = developer.indexOf(dev);
      if (index >= 0) {
        developer[index] = value;
        return [...developer];
      }

      // if from edit then delete some data, so update field to be required because it be unrequired in the onInit
      if(this.dataEdit && !this.developers().length) {
        this.taskForm.get('developers').setValidators(Validators.required);
        this.taskForm.get('developers')?.updateValueAndValidity();
      } 

      // return developer
      return developer;
    });
  }

  /**
   * Function to handle when user choose date
   */
  onDateChange(date: Date) {
    // store date in variable
    const dateValue = new Date(date);

    // create variable to parameters format date
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    };

    // structure formated date to string
    const formattedDate = dateValue.toLocaleDateString('en-GB', options);

    // assign dateControls with formated date
    this.dateControls = formattedDate;
  }

  /**
   * Function to patch taskForm developers with value from developers() signal value
   */
  patchValueDevelopersControl() {
    this.taskForm.get('developers').patchValue(this.developers());
  }

  /**
   * Function handle when button submit clicked
   */
  submitTask() {
    // check task is valid ?
    if(this.taskForm.valid) {
      // then patch developers
      this.patchValueDevelopersControl();

      // if the submit from edit mode, then reformated date
      if(this.dataEdit) {
        this.onDateChange(this.taskForm.get('date').value);
      }

      // patch dateFrom with dateControls
      this.taskForm.get('date').patchValue(this.dateControls);
      // close dialog with value
      this.dialogRef.close(this.taskForm.value);
      // reset form
      this.taskForm.reset();
    }
  }

  /**
   * Function handle user cancel create or edit data
   */
  cancelButton() {
    this.dialogRef.close();
  }

  // ******** NgOnDestroy Lifecycle ********
  ngOnDestroy(): void {
    
  }

}
