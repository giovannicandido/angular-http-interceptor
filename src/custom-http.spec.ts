import { Component } from "@angular/core";
import { HttpModule, ConnectionBackend, ResponseOptions, Response } from "@angular/http";
import { fakeAsync, TestBed, ComponentFixture, inject, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { MockBackend, MockConnection } from "@angular/http/testing";

import { CustomHttp } from "./custom-http";
import {Observable} from "rxjs/Observable";

import "rxjs/add/operator/catch";
import "rxjs/add/observable/of";

describe('custom-http', () => {
  let fixture: ComponentFixture<AppComponent>;
  let comp: AppComponent;

  beforeEach(() => {
    //   // refine the test module by declaring the test component
    TestBed.configureTestingModule({
      imports: [
        HttpModule
      ],
      declarations: [AppComponent],
      providers: [
        CustomHttp,
        {
          provide: ConnectionBackend,
          useClass: MockBackend
        }

      ]
    });

    //   // create component and test fixture
    fixture = TestBed.createComponent(AppComponent);

    //   // get test component from the fixture
    comp = fixture.componentInstance;

  });
  it('should inject CustomHttp in hello world component', () => {
    fixture.detectChanges();
    let debugElement = fixture.debugElement.query(By.css("h1"));
    let element = debugElement.nativeElement;
    expect(element.textContent).toContain('Hello');
    expect(comp.customHttp).not.toBeNull();
  });

  it('should emit requestCreated event', (done) => {
    comp.customHttp.requestCreated$.subscribe(e => {
      expect(e).not.toBeNull();
      done();
    });

    comp.customHttp.get("fake");
  });

  it('should emit requestEnded event', fakeAsync(
     inject( [ConnectionBackend],  (backend) => {
       let body = JSON.stringify({ success: true });
        backend.connections.subscribe((connection: MockConnection) => {
          let options = new ResponseOptions({
            body: body
          });
          connection.mockRespond(new Response(options));
        });
        let called = false;
        comp.customHttp.requestEnded$.subscribe(e => {
          expect(e).not.toBeNull();
          expect(e.text()).toEqual(body);
          called = true;
        });
        comp.customHttp.get("fake").subscribe();
        tick(10);
        expect(called).toBeTruthy();
    })
  ));

  it('should emit requestError event', fakeAsync(
  inject([ConnectionBackend], (backend: MockBackend) => {
    backend.connections.subscribe((connection: MockConnection) => {
      connection.mockError(new Error("Response error"));
    });
    let called = false;
    comp.customHttp.requestError$.subscribe(e => {
      expect(e).not.toBeNull();
      called = true;
    });
    comp.customHttp.get("fake").catch((e, c) => Observable.of(e)).subscribe();
    tick(10);
    expect(called).toBeTruthy();
  })));

  it('should emit requestError event without a catch', fakeAsync(
  inject([ConnectionBackend], (backend: MockBackend) => {
    backend.connections.subscribe((connection: MockConnection) => {
      connection.mockError(new Error("Response error"));
    });
    let called = false;
    comp.customHttp.requestError$.subscribe(e => {
      expect(e).not.toBeNull();
      called = true;
    });
    comp.customHttp.get("fake").subscribe();
    tick(10);
    expect(called).toBeTruthy();
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
