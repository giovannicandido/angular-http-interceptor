import { Component } from "@angular/core";
import { ConnectionBackend, RequestOptions, Headers, ResponseOptions, Response, Http, XHRBackend } from "@angular/http";
import { fakeAsync, TestBed, ComponentFixture, inject, tick } from "@angular/core/testing";
import { MockBackend, MockConnection } from "@angular/http/testing";

import { DialogService, DialogInterceptor } from "./dialog";
import { InterceptorModule } from "../interceptor.module";
import { Interceptor, InterceptorHandler } from "../interceptor.handler";

import "rxjs/add/operator/catch";
import "rxjs/add/observable/of";

let requestOptions = new RequestOptions();
describe('dialog-service', () => {
    let fixture: ComponentFixture<AppComponent>;
    let comp: AppComponent;

    beforeEach(() => {
        //   // refine the test module by declaring the test component
        TestBed.configureTestingModule({
            imports: [
                InterceptorModule
            ],
            declarations: [AppComponent],
            providers: [
                MockBackend,
                DialogService, {
                  provide: RequestOptions,
                  useValue: requestOptions
                }, {
                  provide: Interceptor,
                  useClass: DialogInterceptor,
                  multi: true
                }, {
                  provide: ConnectionBackend,
                  useExisting: MockBackend
                }, {
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


    it('should create a dialog in ok response with responseText', fakeAsync(
        inject([ConnectionBackend, DialogService, Http], (backend, dialog, http) => {
            let body = "Message";
            backend.connections.subscribe((connection: MockConnection) => {
                let options = new ResponseOptions({
                    status: 200,
                    body: body,
                    headers: new Headers({
                        'Content-Type': "text/html"
                    })
                });
                connection.mockRespond(new Response(options));
            });

            spyOn(dialog, 'showMessage');
            http.get("fake").subscribe();
            tick(10);
            expect(dialog.showMessage).toHaveBeenCalledWith(body, 'info');
        })
    ));


});

@Component({
    selector: 'test-app-component',
    template: '<h1>Hello</h1>'
})
class AppComponent {
    constructor(public interceptors: InterceptorHandler) {

    }
}
