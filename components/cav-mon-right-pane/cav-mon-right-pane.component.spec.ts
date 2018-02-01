import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CavMonRightPaneComponent } from './cav-mon-right-pane.component';

describe('CavMonRightPaneComponent', () => {
  let component: CavMonRightPaneComponent;
  let fixture: ComponentFixture<CavMonRightPaneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CavMonRightPaneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CavMonRightPaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
