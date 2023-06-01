import { FormControl, FormGroup } from "@angular/forms";
import { mockObservable } from "src/testing";
import { UsersService } from "../services/user.service";
import { MyValidators } from "./validators";

describe('Tests for my validators', () => {
  describe('Test for validPassword', () => {
    it('should return null when password is right', () => {
      // Arrange
      const control = new FormControl();
      control.setValue('leiner123');
      // Act
      const rta = MyValidators.validPassword(control);
      // Assert
      expect(rta).toBeNull();
    });

    it('should return null when password is wrong', () => {
      // Arrange
      const control = new FormControl();
      control.setValue('leinerjose');
      // Act
      const rta = MyValidators.validPassword(control);
      // Assert
      expect(rta?.invalid_password).toBeTrue();
    });
  });

  describe('Test for matchPassword', () => {
    it('should return null', () => {
      // Arrange
      const group = new FormGroup({
        password: new FormControl('leiner123'),
        confirmPassword: new FormControl('leiner123'),
      });
      // Act
      const rta = MyValidators.matchPasswords(group);
      // Assert
      expect(rta).toBeNull();
    });

    it('should return obj with error', () => {
      // Arrange
      const group = new FormGroup({
        password: new FormControl('leiner12354353'),
        confirmPassword: new FormControl('leiner123523'),
      });
      // Act
      const rta = MyValidators.matchPasswords(group);
      // Assert
      expect(rta?.match_password).toBeTrue();
    });

    it('should return obj with error in fields', () => {
      // Arrange
      const group = new FormGroup({
        otro: new FormControl('leiner12354353'),
        otro2: new FormControl('leiner123523'),
      });
      const fn = () => {
        MyValidators.matchPasswords(group)
      }
      // Assert
      expect(fn).toThrow(new Error('matchPasswords: fields not found'));
    });
  });

  describe('Test for validateEmailAync', () => {
    it('should return null with valid email', (doneFn) => {
      // Arrange
      const usersService: jasmine.SpyObj<UsersService> = jasmine.createSpyObj('UsersService', ['isAvailableByEmail']);
      const control = new FormControl('nico@mail.com')
      // Act
      usersService.isAvailableByEmail.and.returnValue(mockObservable({ isAvailable: true }));
      const validator = MyValidators.validateEmailAsync(usersService);
      validator(control).subscribe(rta => {
        // Assert
        expect(rta).toBeNull();
        doneFn();
      });
    });
  });



});
