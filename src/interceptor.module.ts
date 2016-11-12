import { NgModule } from "@angular/core"
import { Http, XHRBackend, RequestOptions } from "@angular/http"

import { InterceptorHandler, Interceptor } from "./interceptor.handler"
import { CustomHttp } from "./custom-http";
import { ExampleInterceptor } from "./example-interceptor";

export const providers = [
  InterceptorHandler,
  {
    provide: Http,
    useFactory: (xhrBackend: XHRBackend, requestOptions: RequestOptions) =>
      new CustomHttp(xhrBackend, requestOptions),
    deps: [XHRBackend, RequestOptions]
  }
]

@NgModule({
  providers: providers,
})
export class InterceptorModule {

}
