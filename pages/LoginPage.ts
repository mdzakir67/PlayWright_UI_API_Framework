import type { Locator, Page } from '@playwright/test';


export class LoginPage{

    readonly page:Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly submitbtn: Locator;
    readonly loginDisplay;
    
    constructor(page: Page){
        this.page = page;
        this.emailInput = page.getByLabel('Email');
        this.passwordInput = page.getByLabel('Password');
        this.submitbtn = page.getByRole('button',{name:'Sign In'})
        this.loginDisplay = page.getByTestId('user-email-display');
    }

    async login(userName:string,password:string):Promise<void>{
        await this.emailInput.fill(userName);
        await this.passwordInput.fill(password);
        await this.submitbtn.click();
    }




}