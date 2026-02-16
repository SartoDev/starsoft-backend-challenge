import { User } from "generated/prisma/client";

export class LoginResponse {
  id: string;

  email: string;

  fullName: string;
  
  role: string;

  constructor(data: User) {
    this.id = data.id;
    this.email = data.email;
    this.fullName = data.fullName;
    this.role = data.role;
  }
}
