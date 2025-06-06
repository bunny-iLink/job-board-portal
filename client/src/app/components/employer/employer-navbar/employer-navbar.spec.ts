import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployerNavbar } from './employer-navbar';

describe('EmployerNavbar', () => {
  let component: EmployerNavbar;
  let fixture: ComponentFixture<EmployerNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployerNavbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployerNavbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
