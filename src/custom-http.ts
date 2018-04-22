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
import { RequestArgs } from '@angular/http/src/interfaces'

@Injectable()
export class CustomHttp extends Http {
  public interceptors: Interceptor[]
  constructor( @Inject(Interceptor) injectedInterceptors: Interceptor | Interceptor[],
    backend: XHRBackend, defaultOptions: RequestOptions) {
    super(backend, defaultOptions)

    // Make sure interceptors is array
    if (injectedInterceptors instanceof Array) {
      this.interceptors = injectedInterceptors
    } else {
      this.interceptors = [injectedInterceptors]
    }
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    /**
     * Make sure interceptor is called with a request not a url
     */
    const request = this.mapToRequest(url, options)

    // Transform the observers for before actions, if the user do not override the method
    // it will fall back to a empty observer
    let beforeObservables = this.interceptors.map(_ => {
      let method = _.before(request)
      if (method === null || method === undefined) {
        return Observable.empty().defaultIfEmpty("EMPTY_BEFORE")
      } else {
        return method.defaultIfEmpty("EMPTY_BEFORE")
      }
    })

    // Create subscribes ensure before will execute in order
    let subscribers = Observable.forkJoin(beforeObservables)
    let response: Observable<Response> = super.request(url, options)

    let r = subscribers.concat(response).skip(1)
    return this.intercept(r)
  }

  /**
   * Unrap the observer with action for after and error for all interceptors
   * @param observable Response
   */
  intercept(observable: Observable<any>): Observable<Response> {
    return observable.do(res => {
      this.emitAfter(res)
    }).catch((err: Response) => {
      this.emitError(err)
      return Observable.of(err)
    })
  }

  /**
   * Call all after interceptors
   * @param res response
   */
  private emitAfter(res: any) {
    for (let interceptor of this.interceptors) {
      interceptor.after(res)
    }
  }

  /**
   * Call all error method interceptors
   * @param error response
   */
  private emitError(error: any) {
    for (let interceptor of this.interceptors) {
      interceptor.error(error)
    }
  }
  /**
   * Transform a combination of url and options in a RequestArgs with the Url
   * @param url object request
   * @param options Options
   */
  private mapToRequest(url: string | Request, options?: RequestOptionsArgs): RequestArgs {
    let beforeCallOption: RequestArgs
    if (typeof url === 'string' && options) {
      options.url = url
      beforeCallOption = <RequestArgs> options
    } else if (typeof url === 'string') {
      let newOptions = new RequestOptions({ url: url })
      newOptions.headers = new Headers()
      beforeCallOption = newOptions
    } else {
      beforeCallOption = url
    }
    return beforeCallOption
  }
}
