import { NgModule } from "@angular/core"

import { Interceptor } from "../interfaces"
import { AjaxTimeoutInterceptor } from "./ajaxtimeout"
import { DialogService, DialogInterceptor } from "./dialog"

@NgModule({
    providers: [
        {
            provide: Interceptor,
            useClass: AjaxTimeoutInterceptor,
            multi: true
        }, {
            provide: Interceptor,
            useClass: DialogInterceptor,
            multi: true
        }, DialogService
    ]
})
export class ExtraInterceptorsModule {
}