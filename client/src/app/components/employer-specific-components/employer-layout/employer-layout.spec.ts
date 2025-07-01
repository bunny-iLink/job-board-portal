import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployerLayoutComponent } from './employer-layout';

describe('EmployerLayout', () => {
  let component: EmployerLayoutComponent;
  let fixture: ComponentFixture<EmployerLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployerLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployerLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
