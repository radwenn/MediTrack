import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationEditComponent } from './consultation-edit.component';

describe('ConsultationEditComponent', () => {
  let component: ConsultationEditComponent;
  let fixture: ComponentFixture<ConsultationEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultationEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultationEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
