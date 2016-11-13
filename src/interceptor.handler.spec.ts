import { Component } from "@angular/core";
import { HttpModule, XHRBackend, ConnectionBackend, 
  RequestOptions,
  ResponseOptions, Response, Http } from "@angular/http";
import { fakeAsync, TestBed, ComponentFixture, inject, tick } from '@angular/core/testing';
import { By } from "@angular/platform-browser"
import { MockBackend, MockConnection } from "@angular/http/testing"

import { InterceptorHandler, Interceptor, InterceptorModule } from "./index"
import { Observable } from "rxjs/Observable";


class CustomInterceptor implements Interceptor {
  requestCreatedCalled = false;
  requestEndedCalled = false;
  requestErrorCalled = false;
  requestCreated(request: any) {
    this.requestCreatedCalled = true;
  }
  requestEnded(response: any) {
    this.requestEndedCalled = true
  }
  requestError(err: any) {
    this.requestErrorCalled = true
  }
}

describe('interceptor.handler', () => {
  let fixture: ComponentFixture<AppComponent>;
  let comp: AppComponent;
  let customInterceptor = new CustomInterceptor()
  let requestOptions = new RequestOptions()
  beforeEach(() => {

    //   // refine the test module by declaring the test component
    TestBed.configureTestingModule({
      imports: [
        InterceptorModule
      ],
      declarations: [AppComponent],
      providers: [
        MockBackend,
        {
          provide: RequestOptions,
          useValue: requestOptions
        },
        {
          provide: ConnectionBackend,
          useExisting: MockBackend
        }, {
          provide: Interceptor,
          useValue: customInterceptor,
          multi: true
        },{
          provide: XHRBackend,
          useExisting: MockBackend
        }

      ]
    });

    //   // create component and test fixture
    fixture = TestBed.createComponent(AppComponent);

    //   // get test component from the fixture
    comp = fixture.componentInstance;

  });

  it('should call interceptor on request', fakeAsync(
    inject([ConnectionBackend, Http], (backend, http) => {
      let body = JSON.stringify({ success: true })
      backend.connections.subscribe((connection: MockConnection) => {
        let options = new ResponseOptions({
          body: body
        });
        connection.mockRespond(new Response(options));
      })
    
      http.get("fake").subscribe()
      tick(10);
      expect(customInterceptor.requestCreatedCalled).toBeTruthy()
      expect(customInterceptor.requestEndedCalled).toBeTruthy()
    })
  ));
});


@Component({
  selector: 'test-app-component',
  template: '<h1>Hello</h1>'
})
class AppComponent {
  constructor(public interceptorHandler: InterceptorHandler) {

  }
}