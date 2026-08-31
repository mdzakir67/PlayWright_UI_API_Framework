import { APIRequestContext } from "@playwright/test";
import { config } from "../config/environment";
import { CurrentLoggedInUserResponse,CurrentLoggedInUserSchema , LogInUserResponse, LogInUserResponseSchema, RegisterResponseSchema, RegisterUserResponse } from "./schemas/auth.schema";
import { ApiResult } from "./types";

interface AuthPayLoad{
    email:string,
    password:string
}


export class AuthAPI{
    readonly baseURI=config.apiBaseURL;
    constructor(private request:APIRequestContext){}

    async registerUser(payLoad:AuthPayLoad):Promise<ApiResult<RegisterUserResponse>>{
        const userResponse = await this.request.post(this.baseURI+'/auth/register',{data:payLoad});

        return{
                raw_response: userResponse,
                custom_response: RegisterResponseSchema.parse(await userResponse.json())
            }
    }

    async login(payLoad:AuthPayLoad):Promise<ApiResult<LogInUserResponse>>{
        const logInUser = await this.request.post(this.baseURI+'/auth/login',{data:payLoad});
        return {
             raw_response: logInUser,
             custom_response: LogInUserResponseSchema.parse(await logInUser.json())
        }
    }
    async getCurrentUser(token:string):Promise<ApiResult<CurrentLoggedInUserResponse>>{
        const getCurrentUserResponse = await this.request.get(this.baseURI+'/auth/me',{
                headers:{
                    'Authorization':`Bearer ${token}`
                }
            }
        );
        console.log(await getCurrentUserResponse.json());
          return {
             raw_response: getCurrentUserResponse,
             custom_response: CurrentLoggedInUserSchema.parse(await getCurrentUserResponse.json())
        }
    }
    
}
