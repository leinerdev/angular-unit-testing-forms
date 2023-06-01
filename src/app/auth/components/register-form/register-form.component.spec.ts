import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { generateOneUser } from 'src/app/models/user.mock';
import { UsersService } from 'src/app/services/user.service';
import { asyncData, asyncError, clickElement, clickEvent, getText, mockObservable, query, queryById, setCheckboxValue, setInputValue } from 'src/testing';

import { RegisterFormComponent } from './register-form.component';

describe('RegisterFormComponent', () => {
  let component: RegisterFormComponent;
  let fixture: ComponentFixture<RegisterFormComponent>;
  let usersService: jasmine.SpyObj<UsersService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('UsersService', ['create']);
    await TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ],
      declarations: [ RegisterFormComponent ],
      providers: [
        { provide: UsersService, useValue: spy }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterFormComponent);
    usersService = TestBed.inject(UsersService) as jasmine.SpyObj<UsersService>;
    usersService.isAvailableByEmail.and.returnValue(mockObservable({ isAvailable: true }));
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should the emailField be invalid', () => {
    component.emailField?.setValue('Esto no es un correo');
    expect(component.emailField?.invalid).withContext('wrong email').toBeTruthy();

    component.emailField?.setValue('');
    expect(component.emailField?.invalid).withContext('empty').toBeTruthy();
  });

  it('should the passwordField be invalid', () => {
    component.passwordField?.setValue('');
    expect(component.passwordField?.invalid).withContext('wrong email').toBeTruthy();

    component.passwordField?.setValue('12345');
    expect(component.passwordField?.invalid).withContext('12345').toBeTruthy();

    component.passwordField?.setValue('wrgergweergergwerg');
    expect(component.passwordField?.invalid).withContext('without numbers').toBeTruthy();

    component.passwordField?.setValue('wrgergweergergwer2g');
    expect(component.passwordField?.valid).withContext('right').toBeTruthy();
  });

  it('should the form be invalid', () => {
    component.form.patchValue({
      name: 'Leiner',
      email: 'leiner@gmail.com',
      password: '12345534',
      confirmPassword: '12345534',
      checkTerms: false
    });
    expect(component.form.invalid).toBeTruthy();
  });

  it('should the emailField be invalid from UI', () => {
    const inputDebug = query(fixture, 'input#email');
    const inputElement: HTMLInputElement = inputDebug.nativeElement;

    inputElement.value = 'Esto no es un correo';
    inputElement.dispatchEvent(new Event('input'));
    inputElement.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(component.emailField?.invalid).withContext('wrong email').toBeTruthy();

    const textError = getText(fixture, 'emailField-email');
    expect(textError).toContain("It's not a email");
  });

  it('should the emailField be invalid from UI with setInputValue helper', () => {
    setInputValue(fixture, 'input#email', 'Esto no es un correo');
    fixture.detectChanges();
    expect(component.emailField?.invalid).withContext('wrong email').toBeTruthy();

    const textError = getText(fixture, 'emailField-email');
    expect(textError).toContain("It's not a email");
  });

  it('should send the form successfully', () => {
    component.form.patchValue({
      name: 'Leiner',
      email: 'leiner@gmail.com',
      password: '12345534',
      confirmPassword: '12345534',
      checkTerms: true
    });
    const mockUser = generateOneUser();
    usersService.create.and.returnValue(mockObservable(mockUser));
    // Act
    component.register(new Event('submit'));
    expect(component.form.valid).toBeTruthy();
    expect(usersService.create).toHaveBeenCalled();
  });

  it('should send the form successfully and "loading" => "success"', fakeAsync(() => {
    component.form.patchValue({
      name: 'Leiner',
      email: 'leiner@gmail.com',
      password: '12345534',
      confirmPassword: '12345534',
      checkTerms: true
    });
    const mockUser = generateOneUser();
    usersService.create.and.returnValue(asyncData(mockUser));
    // Act
    component.register(new Event('submit'));
    expect(component.status).toEqual('loading');

    tick();
    fixture.detectChanges();

    expect(component.form.valid).toBeTruthy();
    expect(usersService.create).toHaveBeenCalled();
    expect(component.status).toEqual('success');
  }));

  it('should send the form successfully demo UI', fakeAsync(() => {
    setInputValue(fixture, 'input#name', 'Leiner');
    setInputValue(fixture, 'input#email', 'leiner@gmail.com');
    setInputValue(fixture, 'input#password', '12345534');
    setInputValue(fixture, 'input#confirmPassword', '12345534');
    setCheckboxValue(fixture, 'input#terms', true);
    const mockUser = generateOneUser();
    usersService.create.and.returnValue(asyncData(mockUser));
    // Act
    // component.register(new Event('submit'));
    clickElement(fixture, 'btn-submit', true);
    // query(fixture, 'form').triggerEventHandler('ngSubmit', new Event('submit'));
    fixture.detectChanges();
    expect(component.status).toEqual('loading');

    tick();
    fixture.detectChanges();

    expect(component.form.valid).toBeTruthy();
    expect(usersService.create).toHaveBeenCalled();
    expect(component.status).toEqual('success');
  }));

  it('should send the form UI but error in the service', fakeAsync(() => {
    setInputValue(fixture, 'input#name', 'Leiner');
    setInputValue(fixture, 'input#email', 'leiner@gmail.com');
    setInputValue(fixture, 'input#password', '12345534');
    setInputValue(fixture, 'input#confirmPassword', '12345534');
    setCheckboxValue(fixture, 'input#terms', true);
    const mockUser = generateOneUser();
    usersService.create.and.returnValue(asyncError(mockUser));
    // Act
    // component.register(new Event('submit'));
    clickElement(fixture, 'btn-submit', true);
    // query(fixture, 'form').triggerEventHandler('ngSubmit', new Event('submit'));
    fixture.detectChanges();
    expect(component.status).toEqual('loading');

    tick();
    fixture.detectChanges();

    expect(component.form.valid).toBeTruthy();
    expect(usersService.create).toHaveBeenCalled();
    expect(component.status).toEqual('error');
  }));
});
