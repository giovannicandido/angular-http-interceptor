import { Injectable } from "@angular/core"
import { Request, Response } from "@angular/http"
import { Observable } from "rxjs/Observable"

@Injectable()
export abstract class Interceptor {
    abstract before(request: Request): Observable<any>;
    abstract after(response: Response): void;
    abstract error(err: any): void;
}