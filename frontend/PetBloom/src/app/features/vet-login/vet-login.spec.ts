import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VetLogin } from './vet-login';

describe('VetLogin', () => {
  let component: VetLogin;
  let fixture: ComponentFixture<VetLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VetLogin],
    }).compileComponents();

    fixture = TestBed.createComponent(VetLogin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
