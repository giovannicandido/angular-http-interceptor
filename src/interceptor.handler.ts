import { Injectable, Inject } from "@angular/core";
import { Http, Request, Response } from "@angular/http";
import { Observable } from "rxjs/Observable";
import { CustomHttp } from "./custom-http";


@Injectable()
export abstract class Interceptor {
  abstract before(request: Request): Observable<Request>;
  abstract after(response: Response): void;
  abstract error(err: any): void;
}

@Injectable()
export class InterceptorHandler {

  private subscriptions: any[];

  constructor( @Inject(Interceptor) private interceptors: Interceptor[], private http: Http) {
    this.subscriptions = [];
    let customHttp = <CustomHttp>http;

    interceptors.forEach(e => {
      let sub = customHttp.before$.subscribe((request) => {
        try {
          e.before(request);
        } catch (ex) {
          this.errorHandler(ex, e.toString());
        }

      });
      this.subscriptions.push(sub);
      sub = customHttp.after$.subscribe((response) => {
        try {
          e.after(response);
        } catch (ex) {
          this.errorHandler(ex, e.toString());
        }
      });
      this.subscriptions.push(sub);
      sub = customHttp.error.subscribe((err) => {
        try {
          e.error(err);

        } catch (ex) {
          this.errorHandler(ex, e.toString());
        }
      });

      this.subscriptions.push(sub);
    });
  }

  errorHandler(exception: any, interceptor: string) {
    console.error(`Inteceptor ${interceptor} throw a exception: ${exception}`);
  }

  dispose() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}

