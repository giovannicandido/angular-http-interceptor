import { NgModule, Provider, ModuleWithProviders, InjectionToken } from '@angular/core'
import { Http, XHRBackend, RequestOptions } from '@angular/http'

import { Interceptor } from './interfaces'
import { CustomHttp } from './custom-http'

export const INTERCEPTORS: InjectionToken<Interceptor> = new InjectionToken('Interceptor')

@NgModule({
  providers: [
    {
      provide: Http, useFactory: httpFactory, deps: [Interceptor, XHRBackend, RequestOptions]
    },
    { provide: CustomHttp, useExisting: Http }
  ]
})
export class InterceptorModule {
  static withInterceptors(interceptorTypes: Provider[]): ModuleWithProviders {
    return {
      ngModule: InterceptorModule,
      providers: [
        interceptorTypes,
        { provide: Http, useFactory: httpFactory, deps: [INTERCEPTORS, XHRBackend, RequestOptions] },
        { provide: CustomHttp, useExisting: Http },
      ]
    }

  }
}

export function httpFactory(httpInterceptors: Interceptor[], connectionBackend: XHRBackend, 
    requestOptions: RequestOptions): Http {
  return new CustomHttp(httpInterceptors, connectionBackend, requestOptions)
}
