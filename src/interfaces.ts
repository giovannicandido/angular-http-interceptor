import { Injectable } from "@angular/core"
import { Response } from "@angular/http"
import { Observable } from "rxjs/Observable"
import { RequestArgs } from "@angular/http/src/interfaces"

@Injectable()
export abstract class Interceptor {
    abstract before(request: RequestArgs): Observable<any>
    abstract after(response: Response): void
    abstract error(error: Response): void
}
