import {NgModule, Provider, ModuleWithProviders, OpaqueToken, Type} from '@angular/core';
import {Http, ConnectionBackend, RequestOptions} from '@angular/http';
import {CustomHttp, Interceptor} from './custom-http';

@NgModule()
export class InterceptorModule {
  // TODO type Provider is strange here, since provide property is alson the OpaqueToken('Interceptor')
  static withInterceptors(interceptorTypes: Provider[]): ModuleWithProviders {

    let opaqueToken: OpaqueToken = new OpaqueToken('Interceptor');

    let interceptorProviders: Provider[] = interceptorTypes.map(type => {
      if (type instanceof Type) {
        return { provide: opaqueToken, useClass: type, multi: true };
      }else {
        let typeAny = type as any
        typeAny.provide = opaqueToken
        typeAny.multi = true
        return typeAny
      }
    });

    return {
      ngModule: InterceptorModule,
      providers: interceptorProviders.concat([
        { provide: Http, useFactory: httpFactory, deps: [opaqueToken, ConnectionBackend, RequestOptions] },
        { provide: CustomHttp, useExisting: Http }
      ])
    };

    function httpFactory(httpInterceptors: Interceptor[], connectionBackend: ConnectionBackend, requestOptions: RequestOptions): Http {
      return new CustomHttp(httpInterceptors, connectionBackend, requestOptions);
    }
  }
}
