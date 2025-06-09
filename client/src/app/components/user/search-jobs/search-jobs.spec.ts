import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchJobs } from './search-jobs';

describe('SearchJobs', () => {
  let component: SearchJobs;
  let fixture: ComponentFixture<SearchJobs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchJobs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchJobs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
