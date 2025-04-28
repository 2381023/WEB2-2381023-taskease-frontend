export interface User {
    id: number;
    name: string;
    email: string;
    createdAt: string; // Dates are typically strings in JSON
    updatedAt: string;
  }