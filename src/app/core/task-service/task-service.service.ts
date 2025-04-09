import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'https://mocki.io/v1/9d9895f9-70eb-49d2-99f7-cb3dacca8a94';

  constructor() {}

  async getTasks(): Promise<any[]> {
    try {
      const response = await axios.get(this.apiUrl);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      return [];
    }
  }
}
