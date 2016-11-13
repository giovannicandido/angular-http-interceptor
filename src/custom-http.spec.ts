import { Component } from "@angular/core";
import { HttpModule, ConnectionBackend } from "@angular/http";
import { BrowserModule } from '@angular/platform-browser';
import { async, TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from "@angular/platform-browser"
import { MockBackend } from "@angular/http/testing"

import { CustomHttp } from "./custom-http"

describe('custom-http', () => {
  let fixture: ComponentFixture<AppComponent>;
  let comp;
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
  it('should create hello world component', () => {

    fixture.detectChanges();
    let debugElement = fixture.debugElement.query(By.css("h1"))
    let element = debugElement.nativeElement;
    expect(element.textContent).toContain('Hello')
  });
});

@Component({
  selector: 'test-app-component',
  template: '<h1>Hello</h1>'
})
class AppComponent {
  constructor(public customHttp: CustomHttp) {

  }
}