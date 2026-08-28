import { APIRequestContext } from "@playwright/test";
import { config } from "../config/environment";

interface authPayLoad{
    email:String,
    password:String
}


export class AuthAPI{
    readonly baseURI=config.apiBaseURL;
    constructor(private request:APIRequestContext){}

    async registerUser(payLoad:authPayLoad):Promise<any>{
        return await (await this.request.post(this.baseURI+'auth/register',{data:payLoad})).json();
    }

    async login(payLoad:authPayLoad){
        return await(await this.request.post(this.baseURI+'auth/login',{data:payLoad})).json();
    }
    async getCurrentUser(token:string){
        return await (await this.request.get(this.baseURI+'/auth/me',{
                headers:{
                    'Authorization':`Bearer ${token}`
                }
            }
        )).json();
    }
    
}
