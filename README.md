# angular-http-interceptor

A Single point of extension for Http Interceptors in angular 2 projects

The big advantage is that you can provide your Interceptors very easilly,
and create standard interceptors for other projects.

I plan to add a LoadingBarInterceptor, a DialogInterceptor, and a SessionExpirationInterceptor.
All of then optional, you can write your own.

# How to use

    import { NgModule } from "@angular/core"
    import { InterceptorModule, Interceptor } from "angular-http-interceptor" 
    
    class MyInterceptor implements Interceptor {
        requestStart(request: any) {
            console.info("ExampleInterceptor - RequestStarted: " + request)
        }

        requestEnded(res: any) {
            console.info("ExampleInterceptor - RequestEnded: " + res)
        }

        requestError(err: any) {
            console.error("ExampleInterceptor - RequestError: " + err)
        }
    }

    @NgModule({
        imports: InterceptorModule,
        providers: [
            {
                provide: Interceptor,
                useClass: MyInterceptor,
                multi: true
            }
        ]
    })
    export class AppModule {

    }

Now every request made with the oficial @angular/http Http class is intercepted

## Background

I create a subclass of Http client and override it with a custom provider.

The CustomHttp class, create 3 EventEmitters and emit events for **requestStarted**,
**requestEnded** and **requestError**. 

All interceptors methods are called asynchronously, there is NO guarentee of order of course.