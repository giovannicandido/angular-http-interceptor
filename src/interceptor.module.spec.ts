import { Component, NgModule } from "@angular/core"
import { TestBed, ComponentFixture, inject, fakeAsync, tick } from "@angular/core/testing"
import { By } from '@angular/platform-browser'
import { InterceptorModule, INTERCEPTORS } from "./interceptor.module"
import { Response, Http, HttpModule, XHRBackend, ResponseOptions } from "@angular/http"
import { MockBackend, MockConnection } from "@angular/http/testing"
import { Interceptor } from "./interfaces"
import { Observable } from "rxjs/Observable"
import "rxjs/add/observable/empty"
import { CustomHttp } from ".";
import { RequestArgs } from "@angular/http/src/interfaces";

class CustomInterceptorImpl implements Interceptor {

    afterResponse: Response
    beforeRequest: RequestArgs
    errorCall: any

    before(request: RequestArgs): Observable<any> {
        this.beforeRequest = request
        return Observable.empty()
    }
    after(response: Response) {
        this.afterResponse = response;
    }
    error(error: any) {
        this.errorCall = error
    }
}

class CustomInterceptor extends CustomInterceptorImpl {}
class CustomInterceptor2 extends CustomInterceptorImpl {}
class CustomInterceptor3 extends CustomInterceptorImpl {}

let interceptor3 = new CustomInterceptor3()

let fixture: ComponentFixture<AppComponent>;
let comp: AppComponent;
describe('interceptor-module', function () {
    let interceptor1: CustomInterceptor
    let interceptor2: CustomInterceptor2
    beforeEach(() => {
        interceptor1 = new CustomInterceptor()
        interceptor2 = new CustomInterceptor2()
        spyOn(interceptor1, 'before').and.callThrough()
        spyOn(interceptor2, 'before').and.callThrough()
        spyOn(interceptor3, 'before').and.callThrough()
        TestBed.configureTestingModule({
            imports: [
                HttpModule,
                InterceptorModule,
                OtherInterceptorModule
            ],
            providers: [
                {
                    provide: XHRBackend,
                    useClass: MockBackend
                }, {
                    provide: Interceptor,
                    useValue: interceptor1,
                    multi: true
                }, {
                    provide: Interceptor,
                    useValue: interceptor2,
                    multi: true
                }
            ],
            declarations: [AppComponent]
        })
        //   // create component and test fixture
        fixture = TestBed.createComponent(AppComponent);

        //   // get test component from the fixture
        comp = fixture.componentInstance;
    })

    it('should inject CustomHttp in hello world component', () => {
        fixture.detectChanges()
        let debugElement = fixture.debugElement.query(By.css("h1"))
        let element = debugElement.nativeElement
        expect(element.textContent).toContain('Hello')
        expect(comp.http).not.toBeNull()
    })

    it('should call all interceptors', fakeAsync(
        inject([CustomHttp, XHRBackend], (http: CustomHttp, backend) => {
            let body = JSON.stringify({ success: true })
            backend.connections.subscribe((connection: MockConnection) => {
                let options = new ResponseOptions({
                    body: body
                })
                connection.mockRespond(new Response(options))
            })
            http.get("fake").subscribe()
            tick(100)
            expect(interceptor1.before).toHaveBeenCalled()
            expect(interceptor2.before).toHaveBeenCalled()
            expect(interceptor3.before).toHaveBeenCalled()
            expect(http.interceptors.length).toEqual(3)
        }))
    )
})
describe('interceptor-module-withInterceptors', function () {
    let interceptor1: CustomInterceptor
    let interceptor2: CustomInterceptor2
    beforeEach(() => {
        interceptor1 = new CustomInterceptor()
        interceptor2 = new CustomInterceptor2()
        spyOn(interceptor1, 'before').and.callThrough()
        spyOn(interceptor2, 'before').and.callThrough()
        spyOn(interceptor3, 'before').and.callThrough()
        TestBed.configureTestingModule({
            imports: [
                HttpModule,
                OtherInterceptorModule,
                InterceptorModule.withInterceptors(
                    [{
                        provide: INTERCEPTORS,
                        useValue: interceptor1,
                        multi: true
                    }]
                )
            ],
            providers: [
                {
                    provide: XHRBackend,
                    useClass: MockBackend
                }, {
                    provide: Interceptor,
                    useValue: interceptor2,
                    multi: true
                }
            ],
            declarations: [AppComponent]
        })
        //   // create component and test fixture
        fixture = TestBed.createComponent(AppComponent);

        //   // get test component from the fixture
        comp = fixture.componentInstance;
    })

    it('should inject CustomHttp in hello world component', () => {
        fixture.detectChanges()
        let debugElement = fixture.debugElement.query(By.css("h1"))
        let element = debugElement.nativeElement
        expect(element.textContent).toContain('Hello')
        expect(comp.http).not.toBeNull()
    })

    it('should inject interceptors', fakeAsync(
        inject([CustomHttp, XHRBackend], (http: CustomHttp, backend) => {
            let body = JSON.stringify({ success: true })
            backend.connections.subscribe((connection: MockConnection) => {
                let options = new ResponseOptions({
                    body: body
                })
                connection.mockRespond(new Response(options))
            })
            http.get("fake").subscribe()
            tick(100)
            expect(interceptor1.before).toHaveBeenCalled()
            expect(interceptor2.before).not.toHaveBeenCalled()
            expect(interceptor3.before).not.toHaveBeenCalled()
            expect(http.interceptors.length).toEqual(1)
        }))
    )
})
describe('interceptor-module-accept-multi-false', function () {
    let interceptor1: CustomInterceptor
    let interceptor2: CustomInterceptor2
    beforeEach(() => {
        interceptor1 = new CustomInterceptor()
        interceptor2 = new CustomInterceptor2()
        spyOn(interceptor1, 'before').and.callThrough()
        spyOn(interceptor2, 'before').and.callThrough()
        TestBed.configureTestingModule({
            imports: [
                HttpModule,
                InterceptorModule.withInterceptors(
                    [{
                        provide: INTERCEPTORS,
                        useValue: interceptor1
                    },{
                        provide: Interceptor,
                        useValue: interceptor2
                    }]
                )
            ],
            providers: [
                {
                    provide: XHRBackend,
                    useClass: MockBackend
                }
            ],
            declarations: [AppComponent]
        })
        //   // create component and test fixture
        fixture = TestBed.createComponent(AppComponent);

        //   // get test component from the fixture
        comp = fixture.componentInstance;
    })


    it('should inject interceptors', fakeAsync(
        inject([CustomHttp, XHRBackend], (http: CustomHttp, backend) => {
            let body = JSON.stringify({ success: true })
            backend.connections.subscribe((connection: MockConnection) => {
                let options = new ResponseOptions({
                    body: body
                })
                connection.mockRespond(new Response(options))
            })
            http.get("fake").subscribe()
            tick(100)
            expect(interceptor1.before).toHaveBeenCalled()
            expect(interceptor2.before).not.toHaveBeenCalled()
            expect(http.interceptors.length).toEqual(1)
        }))
    )
})


@Component({
    selector: 'test-app-component',
    template: '<h1>Hello</h1>'
})
class AppComponent {
    constructor(public http: Http) {
    }
}

@NgModule(
    {
        imports: [
            InterceptorModule
        ],
        providers: [
            {
                provide: Interceptor,
                useValue: interceptor3,
                multi: true
            }
        ]
    }
)
class OtherInterceptorModule {}