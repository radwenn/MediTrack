import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationAddComponent } from './consultation-add.component';

describe('ConsultationAddComponent', () => {
  let component: ConsultationAddComponent;
  let fixture: ComponentFixture<ConsultationAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultationAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultationAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
