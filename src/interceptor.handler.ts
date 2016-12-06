import { Injectable, Inject } from "@angular/core";
import { Http, Request, Response } from "@angular/http";
import { Observable } from "rxjs/Observable";
import { CustomHttp } from "./custom-http";


@Injectable()
export abstract class Interceptor {
  abstract requestCreated(request: Request): Observable<Request>;
  abstract requestEnded(response: Response): void;
  abstract requestError(err: any): void;
}

@Injectable()
export class InterceptorHandler {

  private subscriptions: any[];

  constructor( @Inject(Interceptor) private interceptors: Interceptor[], private http: Http) {
    this.subscriptions = [];
    let customHttp = <CustomHttp>http;

    interceptors.forEach(e => {
      let sub = customHttp.requestCreated$.subscribe((request) => {
        try {
          e.requestCreated(request);
        } catch (ex) {
          this.errorHandler(ex, e.toString());
        }

      });
      this.subscriptions.push(sub);
      sub = customHttp.requestEnded$.subscribe((response) => {
        try {
          e.requestEnded(response);
        } catch (ex) {
          this.errorHandler(ex, e.toString());
        }
      });
      this.subscriptions.push(sub);
      sub = customHttp.requestError$.subscribe((err) => {
        try {
          e.requestError(err);

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

