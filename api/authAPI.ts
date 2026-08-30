import { APIRequestContext } from "@playwright/test";
import { config } from "../config/environment";
import { ApiResult } from "./eventsAPI";
import { registerResponseSchema, RegisterUserResponse } from "./schemas/auth.schema";

interface authPayLoad{
    email:String,
    password:String
}


export class AuthAPI{
    readonly baseURI=config.apiBaseURL;
    constructor(private request:APIRequestContext){}

    async registerUser(payLoad:authPayLoad):Promise<ApiResult<RegisterUserResponse>>{
        let userResponse = await this.request.post(this.baseURI+'auth/register',{data:payLoad});

        return{
                raw_response: userResponse,
                custom_response: registerResponseSchema.parse(await userResponse.json())
            }
    }

    async login(payLoad:authPayLoad){
        return await(await this.request.post(this.baseURI+'auth/login',{data:payLoad})).json();
    }
    async getCurrentUser(token:string){
        let result = await (await this.request.get(this.baseURI+'/auth/me',{
                headers:{
                    'Authorization':`Bearer ${token}`
                }
            }
        )).json();
        console.log(result);
        return result;
    }
    
}
