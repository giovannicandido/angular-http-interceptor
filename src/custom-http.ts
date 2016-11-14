import {Http, Request, RequestOptionsArgs, Response, RequestOptions, ConnectionBackend} from "@angular/http";
import {EventEmitter, Injectable} from "@angular/core";

import {Observable} from "rxjs/Observable";
import "rxjs/add/operator/do";
import "rxjs/add/observable/throw";
import "rxjs/add/operator/catch";

@Injectable()
export class CustomHttp extends Http {
  public requestCreated$: EventEmitter<any>;
  public requestEnded$: EventEmitter<any>;
  public requestError$: EventEmitter<any>;

  constructor(backend: ConnectionBackend, defaultOptions: RequestOptions) {
    super(backend, defaultOptions);
    this.requestCreated$ = new EventEmitter();
    this.requestEnded$ = new EventEmitter();
    this.requestError$ = new EventEmitter();
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    this.requestCreated$.emit(url);
    return this.intercept(super.request(url, options));
  }

  intercept(observable: Observable<Response>): Observable<Response> {
    return observable.do(res => {
      this.requestEnded$.emit(res);
    }).catch((err: Response, source) => {
      this.requestError$.emit(err);
      return Observable.of(err);
    });
  }

}
