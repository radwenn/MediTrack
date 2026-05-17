import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsConsultationComponent } from './details-consultation.component';

describe('DetailsConsultationComponent', () => {
  let component: DetailsConsultationComponent;
  let fixture: ComponentFixture<DetailsConsultationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsConsultationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsConsultationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
