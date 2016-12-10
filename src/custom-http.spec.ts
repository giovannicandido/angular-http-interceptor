
import {Component} from '@angular/core';
import {RequestOptions, HttpModule, XHRBackend, Http, ResponseOptions, Response} from '@angular/http';
import { fakeAsync, TestBed, ComponentFixture, inject, tick } from "@angular/core/testing";
import {By} from '@angular/platform-browser';
import { MockBackend, MockConnection } from "@angular/http/testing";

import { CustomHttp, Interceptor, InterceptorModule } from "./index";
import { Observable } from "rxjs/Observable";

import "rxjs/add/operator/catch";
import "rxjs/add/operator/delay";
import "rxjs/add/observable/fromPromise";

class CustomInterceptor implements Interceptor {
  constructor(private delay: number) { }
  // TODO use Observable.of(request).delay(this.delay) bug: https://github.com/angular/angular/issues/10127
  before(request: any): Observable<any> {
    return Observable.fromPromise(new Promise((resolve, reject) => {
      setTimeout(() => resolve(), this.delay)
    }))
  }
  after(response: any) {
  }
  error(err: any) {
  }
}

let fixture: ComponentFixture<AppComponent>;
let comp: AppComponent;
let requestOptions = new RequestOptions();

describe('custom-http', () => {

  beforeEach(() => {
    //   // refine the test module by declaring the test component
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        InterceptorModule.withInterceptors([
          { provide: Interceptor, useExisting: CustomInterceptor }
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
          useValue: new CustomInterceptor(0)
        }
      ]
    });


    //   // create component and test fixture
    fixture = TestBed.createComponent(AppComponent);

    //   // get test component from the fixture
    comp = fixture.componentInstance;

  });

  it('should emit before event', fakeAsync(
    inject([CustomInterceptor, Http], (interceptor, http) => {
      spyOn(interceptor, 'before')
      http.get("fake")
      tick(10)
      expect(interceptor.before).toHaveBeenCalled();
    }
    )));

  it('should emit after event', fakeAsync(
    inject([XHRBackend, CustomInterceptor, Http], (backend, interceptor, http) => {
      let body = JSON.stringify({ success: true });
      backend.connections.subscribe((connection: MockConnection) => {
        let options = new ResponseOptions({
          body: body
        });
        connection.mockRespond(new Response(options));
      });

      spyOn(interceptor, 'after')
      // Without subscribe after is not called
      http.get("fake");
      tick(10);
      expect(interceptor.after).not.toHaveBeenCalled();      
      
      http.get("fake").subscribe()
      tick(1)
      expect(interceptor.after).toHaveBeenCalled();
    })
  ));

  it('should emit error event', fakeAsync(
    inject([XHRBackend, CustomInterceptor, Http], (backend: MockBackend, interceptor, http) => {
      backend.connections.subscribe((connection: MockConnection) => {
        connection.mockError(new Error("Response error"));
      });
      spyOn(interceptor, 'error')
      http.get("fake").catch((e, c) => Observable.of(e)).subscribe();
      tick(10);
      expect(interceptor.error).toHaveBeenCalled();
    })));

  it('should emit error event without a catch', fakeAsync(
    inject([XHRBackend, CustomInterceptor, Http], (backend: MockBackend, interceptor, http) => {
      backend.connections.subscribe((connection: MockConnection) => {
        connection.mockError(new Error("Response error"));
      });
      spyOn(interceptor, 'error')
      http.get("fake").subscribe();
      tick(10);
      expect(interceptor.error).toHaveBeenCalled();
    })));

    
});

describe('custom-http-delay', () => {

  beforeEach(() => {
    //   // refine the test module by declaring the test component
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        InterceptorModule.withInterceptors([
          { provide: Interceptor, useExisting: CustomInterceptor }
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
          useValue: new CustomInterceptor(15)
        }
      ]
    });


    //   // create component and test fixture
    fixture = TestBed.createComponent(AppComponent);

    //   // get test component from the fixture
    comp = fixture.componentInstance;

  });

  it('should wait before interceptor method to emit a request', fakeAsync(
    inject([XHRBackend, CustomInterceptor, Http], (backend, interceptor, http) => {
      let body = JSON.stringify({ success: true });
      backend.connections.subscribe((connection: MockConnection) => {
        let options = new ResponseOptions({
          body: body
        });
        connection.mockRespond(new Response(options));
      });
      spyOn(interceptor, 'error')
      spyOn(interceptor, 'after')
      http.get("fake").subscribe();
      // 10 miliseconds pass
      tick(10);
      expect(interceptor.after).not.toHaveBeenCalled();

      // 100 miliseconds pass
      tick(100)
      expect(interceptor.after).toHaveBeenCalled();

    })));
});

@Component({
  selector: 'test-app-component',
  template: '<h1>Hello</h1>'
})
class AppComponent {
  constructor(public customHttp: CustomHttp) {
  }
}
