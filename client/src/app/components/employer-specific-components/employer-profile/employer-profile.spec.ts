import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployerProfileComponent } from './employer-profile';

describe('EmployerProfile', () => {
  let component: EmployerProfileComponent;
  let fixture: ComponentFixture<EmployerProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployerProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployerProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});