import {Http, Request, RequestOptionsArgs, Response, RequestOptions, ConnectionBackend} from "@angular/http";
import {Injectable} from "@angular/core";

import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import "rxjs/add/operator/do";
import "rxjs/add/observable/throw";
import "rxjs/add/operator/catch";

@Injectable()
export class CustomHttp extends Http {
  public before$: Subject<any>;
  public after$: Subject<any>;
  public error: Subject<any>;

  constructor(backend: ConnectionBackend, defaultOptions: RequestOptions) {
    super(backend, defaultOptions);
    this.before$ = new Subject();
    this.after$ = new Subject();
    this.error = new Subject();
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    this.before$.next(url);
    return this.intercept(super.request(url, options));
  }

  intercept(observable: Observable<Response>): Observable<Response> {
    return observable.do(res => {
      this.after$.next(res);
    }).catch((err: Response, source) => {
      this.error.next(err);
      return Observable.of(err);
    });
  }

}
