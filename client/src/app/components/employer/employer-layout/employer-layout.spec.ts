import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployerLayout } from './employer-layout';

describe('EmployerLayout', () => {
  let component: EmployerLayout;
  let fixture: ComponentFixture<EmployerLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployerLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployerLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
