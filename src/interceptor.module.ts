import { NgModule, Provider, ModuleWithProviders, InjectionToken } from '@angular/core'
import { Http, XHRBackend, RequestOptions } from '@angular/http'

import { Interceptor } from './interfaces'
import { CustomHttp } from "./custom-http"

@NgModule({
  providers: [
    {
      provide: Http, useFactory: httpFactory, deps: [Interceptor, XHRBackend, RequestOptions]
    },
    { provide: CustomHttp, useExisting: Http }
  ]
})
export class InterceptorModule {
  // TODO type Provider is strange here, since provide property is alson the OpaqueToken('Interceptor')
  static withInterceptors(interceptorTypes: Provider[]): ModuleWithProviders {

    let opaqueToken = new InjectionToken('Interceptor')

    return {
      ngModule: InterceptorModule,
      providers: [
        { provide: Http, useFactory: httpFactory, deps: [opaqueToken, XHRBackend, RequestOptions] },
        { provide: CustomHttp, useExisting: Http },
        interceptorTypes
      ]
    }

  }
}

export function httpFactory(httpInterceptors: Interceptor[], connectionBackend: XHRBackend, requestOptions: RequestOptions): Http {
  return new CustomHttp(httpInterceptors, connectionBackend, requestOptions)
}
