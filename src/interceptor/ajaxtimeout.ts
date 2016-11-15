import { Injectable } from "@angular/core";
import { Interceptor } from "../interceptor.handler";

@Injectable()
export abstract class LoginService {
    abstract login();
    abstract loginExpired();
}

@Injectable()
export class AjaxTimeoutInterceptor implements Interceptor {
    STATUS_CODE = 901;
    constructor(private loginService: LoginService) {
    }

    requestCreated(request: any) {

    }

    requestEnded(response: any) {
        if (response.status === this.STATUS_CODE) {
            this.loginService.loginExpired();
        }
    }

    requestError(err: any) {
    }

    toString() {
        return "AjaxTimeoutInterceptor";
    }
}
