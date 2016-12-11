import {Request, Response, Http, XHRBackend, RequestOptions, RequestOptionsArgs} from '@angular/http';
import {Injectable} from '@angular/core';

import {Observable} from "rxjs/Observable";

import "rxjs/add/operator/do";
import "rxjs/add/observable/forkJoin";
import "rxjs/add/observable/concat";


@Injectable()
export abstract class Interceptor {
  abstract before(request: string | Request): Observable<any>;
  abstract after(response: Response): void;
  abstract error(err: any): void;
}


@Injectable()
export class CustomHttp extends Http {
  constructor(private interceptors: Interceptor[], backend: XHRBackend, defaultOptions: RequestOptions) {
    super(backend, defaultOptions);
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {

    let beforeObservables = this.interceptors.map(_ =>  _.before(url));

    let subscribers = Observable.forkJoin(beforeObservables);
    let response = this.intercept(super.request(url, options));

    return Observable.concat(subscribers, response);
  }

  intercept(observable: Observable<Response>): Observable<Response> {
    return observable.do(res => {
      this.emitAfter(res);
    }).catch((err: Response, source) => {
      this.emitError(err);
      return Observable.of(err);
    });
  }

  private emitAfter(res: any) {
    for (let interceptor of this.interceptors) {
      interceptor.after(res);
    }
  }

  private emitError(error: any) {
    for (let interceptor of this.interceptors) {
      interceptor.error(error);
    }
  }
}
