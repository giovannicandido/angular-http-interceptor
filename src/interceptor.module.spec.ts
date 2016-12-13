import { Component } from "@angular/core"
import { TestBed, ComponentFixture, inject, fakeAsync, tick } from "@angular/core/testing"
import { By } from '@angular/platform-browser'
import { InterceptorModule } from "./interceptor.module"
import { Request, Response, Http, HttpModule, XHRBackend, ResponseOptions } from "@angular/http"
import { MockBackend, MockConnection } from "@angular/http/testing"
import { Interceptor } from "./interfaces"
import { Observable } from "rxjs/Observable"
import "rxjs/add/observable/empty"

class CustomInterceptor implements Interceptor {
    before(request: string | Request): Observable<any> {
        console.log(request)
        return Observable.empty()
    }
    after(response: Response) {
        console.log(response)

    }
    error(error: any) {
        console.log(error)
    }
}

class CustomInterceptor2 implements Interceptor {
    before(request: string | Request): Observable<any> {
        console.log(request)
        return Observable.empty()
    }
    after(response: Response) {
        console.log(response)

    }
    error(error: any) {
        console.log(error)
    }
}
let fixture: ComponentFixture<AppComponent>;
let comp: AppComponent;
describe('interceptor-module', function () {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpModule,
                InterceptorModule.withInterceptors([CustomInterceptor])
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
})

describe('interceptor-module-withInterceptors', function () {
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
                InterceptorModule
            ],
            declarations: [AppComponent],
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
            ]
        })
        //   // create component and test fixture
        fixture = TestBed.createComponent(AppComponent)

        //   // get test component from the fixture
        comp = fixture.componentInstance
    })

    it('should inject all intercetors if called more then once', fakeAsync(
        inject([Http, XHRBackend], (http: Http, backend) => {
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
        })))
})

@Component({
    selector: 'test-app-component',
    template: '<h1>Hello</h1>'
})
class AppComponent {
    constructor(public http: Http) {
    }
}