import {Http, Request, RequestOptionsArgs, Response, RequestOptions, ConnectionBackend} from "@angular/http";
import {Injectable} from "@angular/core";

import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import "rxjs/add/operator/do";
import "rxjs/add/observable/throw";
import "rxjs/add/operator/catch";

@Injectable()
export class CustomHttp extends Http {
  public requestCreated$: Subject<any>;
  public requestEnded$: Subject<any>;
  public requestError$: Subject<any>;

  constructor(backend: ConnectionBackend, defaultOptions: RequestOptions) {
    super(backend, defaultOptions);
    this.requestCreated$ = new Subject();
    this.requestEnded$ = new Subject();
    this.requestError$ = new Subject();
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    this.requestCreated$.next(url);
    return this.intercept(super.request(url, options));
  }

  intercept(observable: Observable<Response>): Observable<Response> {
    return observable.do(res => {
      this.requestEnded$.next(res);
    }).catch((err: Response, source) => {
      this.requestError$.next(err);
      return Observable.of(err);
    });
  }

}
