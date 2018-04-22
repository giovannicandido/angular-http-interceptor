# Angular Http Interceptor

[![Build Status](https://travis-ci.org/giovannicandido/angular-http-interceptor.svg?branch=master)](https://travis-ci.org/giovannicandido/angular-http-interceptor)

A Single point of extension for Http Interceptors in Angular projects, that keeps compatibility with Angular Http class.

The big advantage is that you can provide your Interceptors very easilly,
and create standard interceptors for other projects.

**Note**: The Http requests will only execute after __all observables__ in the before interceptors execute. 
That is a requirement to do things like security token refresh

This library is used by [https://github.com/giovannicandido/angular-spa](https://github.com/giovannicandido/angular-spa) which provides generic intercetors, security sso, and other goodies

Examples in [https://github.com/giovannicandido/angular-spa-example](https://github.com/giovannicandido/angular-spa-example)

# How to use

There is two ways to provide interceptors, the first override all previous interceptors the later concat then.

## Override previous interceptors

Use this when you don't want to import other interceptors from other modules, or just
override then.

```typescript

    import {InterceptorModule, INTERCEPTORS} from "angular-http-interceptor"

    @NgModule({
        imports: [
            HttpModule,
            InterceptorModule.withInterceptors([
                    {
                        provide: INTERCEPTORS,
                        useClass: CustomInterceptor,
                        multi: true
                    },{
                        provide: INTERCEPTORS,
                        useClass: CustomInterceptor2,
                        multi: true
                    }
                ])
        ]
    })
```

## Keep imported modules

Use this when you want to keep declared interceptors from other modules.

```typescript
    import {InterceptorModule, Interceptor} from "angular-http-interceptor"

    @NgModule({
        imports: [
            HttpModule,
            InterceptorModule
        ],
        providers: [
            {
                provide: Interceptor,
                useClass: CustomInterceptor
                multi: true
            }, {
                provide: Interceptor,
                useClass: CustomInterceptor2
                multi: true
            }
        ]
    })
```



If you use `withInterceptors` it will override any interceptor created by other module or library. **Don't forget multi: true** or it will inject only one Interceptor

For example, the library [https://github.com/giovannicandido/angular-spa](https://github.com/giovannicandido/angular-spa) provide a `RefreshTokenHttpInterceptor` 
that is good to maintain, the `withInterceptors` will override that. You can still provide it again.

The method `InterceptorModule.withInterceptors()` accepts all kinds of providers (ValueProviders, FactoryProviders...) except plain classes. Examples:

    InterceptorModule.withInterceptors([{ provide: INTERCEPTORS, useClass:             MyInterceptorClass, multi: true }])
    InterceptorModule.withInterceptors([{ provide: INTERCEPTORS, useExisting: InterceptorClass, multi: true }])
    InterceptorModule.withInterceptors([{ provide: INTERCEPTORS, useValue: interceptorObject, multi: true }])


Unfortunatelly This will not work:

    InterceptorModule.withInterceptors([MyInterceptorClass])

The reason is because withInterceptors expect a InjectionToken, internally it could map the
array, but this is incompatible with Angular AOT.

More complete examples:

```typescript
    import { NgModule } from "@angular/core"
    import { HttpModule, Response } from "@angular/http"
    import { RequestArgs } from "@angular/http/src/interfaces"
    import { InterceptorModule, Interceptor, INTERCEPTORS } from "angular-http-interceptor" 
    
    class MyInterceptor implements Interceptor {
        before(request: RequestArgs): Observable<any> {
            console.info("ExampleInterceptor - RequestCreated: " + request)
            return Observable.empty()
        }

        after(res: Response) {
            console.info("ExampleInterceptor - RequestEnded: " + res)
        }

        error(err: Response) {
            console.error("ExampleInterceptor - RequestError: " + err)
        }
    }

    /**
     * Important: HttpModule must be declared before InterceptorModule.
     * Because Interceptor module overrides things in HttpModule, and not doing
     * so, result in the contrary, i.e, HttpModule overriding InterceptorModule.
     */
    @NgModule({
        imports: [ 
            HttpModule, // This must be first
            InterceptorModule.withInterceptors([
                {
                    provide: INTERCEPTORS,
                    useClass: MyInterceptor,
                    multi: true
                }
            ]),
         ],
         bootstrap: [AppModule]
    })
    export class AppModule {

    }

    // ---- Component

    import { Component, OnInit, OnDestroy} from '@angular/core';
    import { Http } from "@angular/http"

    @Component({
        selector: 'app-root',
        templateUrl: './app.component.html',
        styleUrls: ['./app.component.css']
    })
    export class AppComponent implements OnInit, OnDestroy {
        title = 'app works!';

        constructor(private http: Http) {

        }
        ngOnInit() {
            // this will be intercepted
            this.http.get("interceptor").subscribe(r => {
                console.log("Result")
            });
        }
    }
```

Now every request made with the official @angular/http Http class is intercepted

# Difference between INTERCEPTORS and Interceptor

Interceptor is the interface you must provide implementations of it.
INTERCEPTORS is a InjectionToken used to provide a alternate way for injection, and override the ones that do not use this token. Used only when you call `InterceptorModule.withInterceptors`

# Background

I create a subclass of Http client and override it with a custom provider.

The CustomHttp class, do the job and call the interceptors.

All interceptors methods are called asynchronously, there is NO guarentee of order of course,
but __after method will execute ONLY after ALL before method finishes__. This is a Important
difference between other interceptor libraries! And a requirement for http calls that must complete before the request, like Oauth token refresh cases.

