import { NgModule, Provider, ModuleWithProviders, InjectionToken, Type } from '@angular/core'
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

    let interceptorProviders: Provider[] = interceptorTypes.map(type => {
      if (type instanceof Type) {
        return { provide: opaqueToken, useClass: type, multi: true }
      } else {
        let typeAny = type as any
        typeAny.provide = opaqueToken
        typeAny.multi = true
        return typeAny
      }
    })

    return {
      ngModule: InterceptorModule,
      providers: interceptorProviders.concat([
        { provide: Http, useFactory: httpFactory, deps: [opaqueToken, XHRBackend, RequestOptions] },
        { provide: CustomHttp, useExisting: Http }
      ])
    }

  }
}

export function httpFactory(httpInterceptors: Interceptor[], connectionBackend: XHRBackend, requestOptions: RequestOptions): Http {
  return new CustomHttp(httpInterceptors, connectionBackend, requestOptions)
}
