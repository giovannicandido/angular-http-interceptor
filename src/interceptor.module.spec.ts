import { Component } from "@angular/core"
import { TestBed, ComponentFixture } from "@angular/core/testing"
import {By} from '@angular/platform-browser';
import { InterceptorModule } from "./interceptor.module"
import { Request, Response, Http, HttpModule } from "@angular/http"
import { Interceptor } from "./custom-http"
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
let fixture: ComponentFixture<AppComponent>;;
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
        fixture.detectChanges();
        let debugElement = fixture.debugElement.query(By.css("h1"));
        let element = debugElement.nativeElement;
        expect(element.textContent).toContain('Hello');
        expect(comp.http).not.toBeNull();
    });
})

@Component({
    selector: 'test-app-component',
    template: '<h1>Hello</h1>'
})
class AppComponent {
    constructor(public http: Http) {
    }
}