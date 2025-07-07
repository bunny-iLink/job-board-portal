import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http'; // Modern replacement for HttpClientTestingModule
import { MyListingsComponent } from './my-listings';

describe('MyListings', () => {
  let component: MyListingsComponent;
  let fixture: ComponentFixture<MyListingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyListingsComponent],
      providers: [provideHttpClient()] // ✅ modern replacement for HttpClientTestingModule
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyListingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
