import { Request, Response, Http, XHRBackend, RequestOptions, RequestOptionsArgs, Headers } from '@angular/http'
import { Injectable, Inject } from '@angular/core'

import { Observable } from "rxjs/Observable"

import "rxjs/add/operator/do"
import "rxjs/add/observable/forkJoin"
import "rxjs/add/operator/concat"
import "rxjs/add/operator/defaultIfEmpty"
import "rxjs/add/observable/of"
import "rxjs/add/operator/catch"
import "rxjs/add/operator/skip"

import { Interceptor } from "./interfaces"

@Injectable()
export class CustomHttp extends Http {
  constructor( @Inject(Interceptor) private interceptors: Interceptor[], backend: XHRBackend, defaultOptions: RequestOptions) {
    super(backend, defaultOptions)
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    /**
     * Make sure interceptor is called with a request not a url
     */
    let beforeCallOption
    if (typeof url === 'string' && options) {
      options.url = url
      beforeCallOption = options
    } else if (typeof url === 'string') {
      let options = new RequestOptions({ url: url })
      options.headers = new Headers()
      beforeCallOption = options
    } else {
      beforeCallOption = url
    }

    // If one method is empty do not stop application
    let beforeObservables = this.interceptors.map(_ => {
      let method = _.before(beforeCallOption)
      if (method === null || method === undefined) {
        return Observable.empty().defaultIfEmpty("EMPTY_BEFORE")
      } else {
        return method.defaultIfEmpty("EMPTY_BEFORE")
      }
    })

    let subscribers = Observable.forkJoin(beforeObservables)
    let response: Observable<Response> = super.request(url, options)

    let r = subscribers.concat(response).skip(1)
    return this.intercept(r)
  }

  intercept(observable: Observable<any>): Observable<Response> {
    return observable.do(res => {
      this.emitAfter(res)
    }).catch((err: Response) => {
      this.emitError(err)
      return Observable.of(err)
    })
  }

  private emitAfter(res: any) {
    for (let interceptor of this.interceptors) {
      interceptor.after(res)
    }
  }

  private emitError(error: any) {
    for (let interceptor of this.interceptors) {
      interceptor.error(error)
    }
  }
}
