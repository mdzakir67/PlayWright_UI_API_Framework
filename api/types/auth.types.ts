export interface CreateUserPayload {
    email: string;
    password: string;
}

export interface AuthenticatedUser{
  email:string;
  password:string;
  token:string;
  userId:number;
}