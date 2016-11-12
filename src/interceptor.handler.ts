import { Injectable, Inject } from "@angular/core";
import { Http } from "@angular/http";
import { CustomHttp } from "./custom-http";


@Injectable()
export abstract class Interceptor {
  abstract requestStart(request: any);
  abstract requestEnded(response: any);
  abstract requestError(err: any);
}

@Injectable()
export class InterceptorHandler {

  private subscriptions: any[];

  constructor( @Inject(Interceptor) private interceptors: Interceptor[], private http: Http) {
    this.subscriptions = [];
    let customHttp = <CustomHttp>http

    interceptors.forEach(e => {
      let sub = customHttp.requestStarted$.subscribe((request) => {
        try {
          e.requestStart(request)
        } catch (ex) {
          this.errorHandler(ex, e.toString())
        }

      })
      this.subscriptions.push(sub);
      sub = customHttp.requestEnded$.subscribe((response) => {
        try {
          e.requestEnded(response)
        } catch (ex) {
          this.errorHandler(ex, e.toString());
        }
      })
      this.subscriptions.push(sub);
      sub = customHttp.requestError$.subscribe((err) => {
        try {
          e.requestError(err)

        } catch (ex) {
          this.errorHandler(ex, e.toString());
        }
      })

      this.subscriptions.push(sub);
    })
  }

  errorHandler(exception: any, interceptor: string) {
    console.error(`Inteceptor ${interceptor} throw a exception: ${exception}`)
  }

  dispose() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}

