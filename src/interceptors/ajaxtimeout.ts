import { Injectable } from "@angular/core"
import { Request } from "@angular/http"
import { Observable } from "rxjs/Observable"

import "rxjs/add/observable/of"

import { Interceptor } from "../interfaces"

@Injectable()
export abstract class LoginService {
    abstract login();
    abstract loginExpired();
}

@Injectable()
export class AjaxTimeoutInterceptor implements Interceptor {
    STATUS_CODE = 901
    constructor(private loginService: LoginService) {
    }

    before(request: string | Request): Observable<any> {
        return Observable.of(request)
    }

    after(response: any) {
        if (response.status === this.STATUS_CODE) {
            this.loginService.loginExpired()
        }
    }

    error(err: any) {
        console.error(err)
    }

    toString() {
        return "AjaxTimeoutInterceptor"
    }
}
