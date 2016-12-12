
import { Component } from '@angular/core'
import {
  RequestOptions, HttpModule, XHRBackend, Http, ResponseOptions,
  Response, Request, Headers
} from '@angular/http'
import { fakeAsync, TestBed, ComponentFixture, inject, tick } from "@angular/core/testing"
import { MockBackend, MockConnection } from "@angular/http/testing"

import { CustomHttp, Interceptor, InterceptorModule } from "./index"
import { Observable } from "rxjs/Observable"

import "rxjs/add/operator/catch"
import "rxjs/add/operator/delay"
import "rxjs/add/observable/fromPromise"

class CustomInterceptor implements Interceptor {
  lastRequest: Request
  constructor(private delay: number) { }
  // TODO use Observable.of(request).delay(this.delay) bug: https://github.com/angular/angular/issues/10127
  before(request: Request): Observable<any> {
    this.lastRequest = request
    request.headers.set("Delay " + this.delay.toString(), this.delay.toString())
    return Observable.fromPromise(new Promise((resolve) => {
      setTimeout(() => resolve(request), this.delay)
    }))
  }
  after(response: any) {
    console.info(response)
  }
  error(err: any) {
    console.info(err)
  }
}

class EmptyInterceptor implements Interceptor {
  before(request: Request): Observable<any> {
    return Observable.empty()
  }
  after(response: any) {
    console.info(response)
  }
  error(err: any) {
    console.info(err)
  }
}

class NullInterceptor implements Interceptor {
  before(request: Request): Observable<any> {
    return null
  }
  after(response: any) {
    console.info(response)
  }
  error(err: any) {
    console.info(err)
  }
}

let fixture: ComponentFixture<AppComponent>
let comp: AppComponent
let requestOptions = new RequestOptions()
describe('custom-http', () => {
  let customInterceptor: CustomInterceptor
  let customInterceptor2: CustomInterceptor
  beforeEach(() => {
    customInterceptor = new CustomInterceptor(0)
    customInterceptor2 = new CustomInterceptor(1)
    spyOn(customInterceptor, 'before').and.callThrough()
    spyOn(customInterceptor, 'after').and.callThrough()
    spyOn(customInterceptor, 'error').and.callThrough()
    spyOn(customInterceptor2, 'before').and.callThrough()
    spyOn(customInterceptor2, 'after').and.callThrough()
    spyOn(customInterceptor2, 'error').and.callThrough()
    //   // refine the test module by declaring the test component
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        InterceptorModule.withInterceptors([
          { provide: Interceptor, useValue: customInterceptor },
          { provide: Interceptor, useValue: customInterceptor2 }
        ])
      ],
      declarations: [AppComponent],
      providers: [
        {
          provide: RequestOptions,
          useValue: requestOptions
        },
        {
          provide: XHRBackend,
          useClass: MockBackend
        }, {
          provide: CustomInterceptor,
          useValue: customInterceptor
        }
      ]
    })


    //   // create component and test fixture
    fixture = TestBed.createComponent(AppComponent)

    //   // get test component from the fixture
    comp = fixture.componentInstance

  })

  it('should emit before event', fakeAsync(
    inject([CustomInterceptor, Http], (interceptor, http) => {
      http.get("fake")
      tick(10)
      expect(interceptor.before).toHaveBeenCalled()
    }))
  )

  it('should emit after event', fakeAsync(
    inject([XHRBackend, CustomInterceptor, Http], (backend, interceptor, http) => {
      let body = JSON.stringify({ success: true })
      backend.connections.subscribe((connection: MockConnection) => {
        let options = new ResponseOptions({
          body: body
        })
        connection.mockRespond(new Response(options))
      })

      // Without subscribe after is not called
      http.get("fake")
      tick(10)
      expect(interceptor.after).not.toHaveBeenCalled()
      http.get("fake").subscribe()
      tick(1)
      expect(interceptor.after).toHaveBeenCalled()
    })
  ))

  it('should emit error event', fakeAsync(
    inject([XHRBackend, CustomInterceptor, Http], (backend: MockBackend, interceptor, http) => {
      backend.connections.subscribe((connection: MockConnection) => {
        connection.mockError(new Error("Response error"))
      })
      http.get("fake").catch((e) => Observable.of(e)).subscribe()
      tick(10)
      expect(interceptor.error).toHaveBeenCalled()
    })))

  it('should emit error event without a catch', fakeAsync(
    inject([XHRBackend, CustomInterceptor, Http], (backend: MockBackend, interceptor, http) => {
      backend.connections.subscribe((connection: MockConnection) => {
        connection.mockError(new Error("Response error"))
      })
      http.get("fake").subscribe()
      tick(10)
      expect(interceptor.error).toHaveBeenCalled()
    })))

  it('should call all interceptors', fakeAsync(
    inject([XHRBackend, Http], (backend: MockBackend, http) => {
      let body = JSON.stringify({ success: true })
      backend.connections.subscribe((connection: MockConnection) => {
        let options = new ResponseOptions({
          body: body
        })
        if (connection.request.url === "error") {
          connection.mockError(new Error("error"))
        } else {
          connection.mockRespond(new Response(options))
        }
      })
      http.get("fake").subscribe()
      tick(10)
      expect(customInterceptor.before).toHaveBeenCalled()
      expect(customInterceptor2.before).toHaveBeenCalled()
      expect(customInterceptor.after).toHaveBeenCalled()
      expect(customInterceptor2.after).toHaveBeenCalled()
      http.get("error").subscribe()
      tick(10)
      expect(customInterceptor.error).toHaveBeenCalled()
      expect(customInterceptor2.error).toHaveBeenCalled()
    })))

  it('should let all interceptors change request', fakeAsync(
    inject([XHRBackend, Http], (backend: MockBackend, http) => {
      let body = JSON.stringify({ success: true })
      backend.connections.subscribe((connection: MockConnection) => {
        let options = new ResponseOptions({
          body: body
        })
        connection.mockRespond(new Response(options))
      })
      http.get("fake").subscribe()
      tick(10)
      expect(customInterceptor.lastRequest.headers.has("Delay 0")).toBeTruthy()
      expect(customInterceptor.lastRequest.headers.has("Delay 1")).toBeTruthy()
    })))


  describe("custom-http-request", () => {
    it('should pass the request to interceptor', fakeAsync(
      inject([CustomInterceptor, Http], (interceptor, http: CustomHttp) => {
        // With a request
        let request = new Request({ url: 'https://www.google.com.br' })
        http.request(request)
        tick(100)
        expect(interceptor.before).toHaveBeenCalledWith(request)
      })))

    it('should pass requestOptions from request to interceptor', fakeAsync(
      inject([Http], (http: CustomHttp) => {
        // With a request
        let url = 'https://www.google.com.br'
        let request = new RequestOptions({ url: url })
        request.headers = new Headers()
        http.request(url)
        tick(100)
        expect(customInterceptor.before).toHaveBeenCalledWith(request)
      })))

    it('should pass requestOptions merged from request to interceptor', fakeAsync(
      inject([Http], (http: CustomHttp) => {
        // With a request
        let url = 'https://www.google.com.br'
        let requestOptions = new RequestOptions()
        requestOptions.body = { json: 'Value' }
        requestOptions.method = 1
        requestOptions.headers = new Headers({ "MyHeader": "Value" })
        http.request(url, requestOptions)
        requestOptions.url = url
        tick(100)
        expect(customInterceptor.before).toHaveBeenCalledWith(requestOptions)
      })))
  })

})
describe('custom-http-delay-null-interceptor', () => {
  let customInterceptor
  let customInterceptor2
  let customInterceptor3
  beforeEach(() => {
    customInterceptor = new CustomInterceptor(20)
    customInterceptor2 = new CustomInterceptor(15)
    customInterceptor3 = new NullInterceptor()
    spyOn(customInterceptor, 'before').and.callThrough()
    spyOn(customInterceptor, 'after').and.callThrough()
    spyOn(customInterceptor, 'error').and.callThrough()
    spyOn(customInterceptor2, 'before').and.callThrough()
    spyOn(customInterceptor2, 'after').and.callThrough()
    spyOn(customInterceptor2, 'error').and.callThrough()
    spyOn(customInterceptor3, 'before').and.callThrough()
    spyOn(customInterceptor3, 'after').and.callThrough()
    spyOn(customInterceptor3, 'error').and.callThrough()
    //   // refine the test module by declaring the test component
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        InterceptorModule.withInterceptors([
          { provide: Interceptor, useValue: customInterceptor },
          { provide: Interceptor, useValue: customInterceptor2 },
          { provide: Interceptor, useValue: customInterceptor3 }
        ])
      ],
      declarations: [AppComponent],
      providers: [
        {
          provide: RequestOptions,
          useValue: requestOptions
        },
        {
          provide: XHRBackend,
          useClass: MockBackend
        }
      ]
    })


    //   // create component and test fixture
    fixture = TestBed.createComponent(AppComponent)

    //   // get test component from the fixture
    comp = fixture.componentInstance

  })

  it('should wait before interceptor method to emit a request', fakeAsync(
    inject([XHRBackend, Http], (backend, http) => {
      let body = JSON.stringify({ success: true })
      backend.connections.subscribe((connection: MockConnection) => {
        let options = new ResponseOptions({
          body: body
        })
        connection.mockRespond(new Response(options))
      })

      http.get("fake").subscribe()
      expect(customInterceptor.before).toHaveBeenCalled()
      expect(customInterceptor2.before).toHaveBeenCalled()
      expect(customInterceptor3.before).toHaveBeenCalled()

      // 10 miliseconds pass
      tick(10)
      expect(customInterceptor.after).not.toHaveBeenCalled()
      expect(customInterceptor2.after).not.toHaveBeenCalled()
      expect(customInterceptor3.after).not.toHaveBeenCalled()
      // 16
      tick(6)
      expect(customInterceptor.after).not.toHaveBeenCalled()
      expect(customInterceptor2.after).not.toHaveBeenCalled()
      expect(customInterceptor3.after).not.toHaveBeenCalled()
      // 26 miliseconds pass
      tick(20)
      expect(customInterceptor.after).toHaveBeenCalled()
      expect(customInterceptor2.after).toHaveBeenCalled()
      expect(customInterceptor3.after).toHaveBeenCalled()

    })))
})
describe('custom-http-delay-empty-interceptor', () => {
  let customInterceptor
  let customInterceptor2
  let customInterceptor3
  beforeEach(() => {
    customInterceptor = new CustomInterceptor(20)
    customInterceptor2 = new CustomInterceptor(15)
    customInterceptor3 = new EmptyInterceptor()
    spyOn(customInterceptor, 'before').and.callThrough()
    spyOn(customInterceptor, 'after').and.callThrough()
    spyOn(customInterceptor, 'error').and.callThrough()
    spyOn(customInterceptor2, 'before').and.callThrough()
    spyOn(customInterceptor2, 'after').and.callThrough()
    spyOn(customInterceptor2, 'error').and.callThrough()
    spyOn(customInterceptor3, 'before').and.callThrough()
    spyOn(customInterceptor3, 'after').and.callThrough()
    spyOn(customInterceptor3, 'error').and.callThrough()
    //   // refine the test module by declaring the test component
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        InterceptorModule.withInterceptors([
          { provide: Interceptor, useValue: customInterceptor },
          { provide: Interceptor, useValue: customInterceptor2 },
          { provide: Interceptor, useValue: customInterceptor3 }
        ])
      ],
      declarations: [AppComponent],
      providers: [
        {
          provide: RequestOptions,
          useValue: requestOptions
        },
        {
          provide: XHRBackend,
          useClass: MockBackend
        }
      ]
    })


    //   // create component and test fixture
    fixture = TestBed.createComponent(AppComponent)

    //   // get test component from the fixture
    comp = fixture.componentInstance

  })

  it('should wait before interceptor method to emit a request', fakeAsync(
    inject([XHRBackend, Http], (backend, http) => {
      let body = JSON.stringify({ success: true })
      backend.connections.subscribe((connection: MockConnection) => {
        let options = new ResponseOptions({
          body: body
        })
        connection.mockRespond(new Response(options))
      })

      http.get("fake").subscribe()
      expect(customInterceptor.before).toHaveBeenCalled()
      expect(customInterceptor2.before).toHaveBeenCalled()
      expect(customInterceptor3.before).toHaveBeenCalled()
      // 10 miliseconds pass
      tick(10)
      expect(customInterceptor.after).not.toHaveBeenCalled()
      expect(customInterceptor2.after).not.toHaveBeenCalled()
      expect(customInterceptor3.after).not.toHaveBeenCalled()
      // 16
      tick(6)
      expect(customInterceptor.after).not.toHaveBeenCalled()
      expect(customInterceptor2.after).not.toHaveBeenCalled()
      expect(customInterceptor3.after).not.toHaveBeenCalled()
      // 26 miliseconds pass
      tick(20)
      expect(customInterceptor.after).toHaveBeenCalled()
      expect(customInterceptor2.after).toHaveBeenCalled()
      expect(customInterceptor3.after).toHaveBeenCalled()

    })))
})

@Component({
  selector: 'test-app-component',
  template: '<h1>Hello</h1>'
})
class AppComponent {
  constructor(public customHttp: CustomHttp) {
  }
}
