import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage {
  
  signUpFormGroup: FormGroup;
  loading: boolean = false;

  constructor(private navController: NavController,
              private authService: AuthService,
              private toastController: ToastController,
              private activatedRoute: ActivatedRoute) {
    this.signUpFormGroup = new FormGroup({
      email: new FormControl('', [ Validators.required, Validators.email ]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      repassword: new FormControl(''),
    });
    this.signUpFormGroup.controls.repassword.setValidators([Validators.required, this.notEqual]);
  }

  notEqual = (control: FormControl): {[s: string]: boolean} => {
    if ( control.value !== this.signUpFormGroup.controls.password.value ) {
      return {notequal: true};
    }
    return null;
  }

  showSignIn = () => this.navController.navigateForward(['../sign-in'], { relativeTo: this.activatedRoute });

  createAccount = () => {
    this.loading = true;
    const {email, password} = this.signUpFormGroup.value;
    this.authService.emailSignUp(email, password)
      .catch(error => {
        if (error.code === 'auth/invalid-email') {
          this.showErrorToast('El email es incorrecto');
        } else if (error.code === 'auth/weak-password') {
          this.showErrorToast('El password debe ser mayor a 6 letras');
        } else if (error.code === 'auth/email-already-in-use') {
          this.showErrorToast('El correo ya esta en uso, intenta iniciar sesion');
        }
      })
      .finally(() => this.loading = false);
  }

  showErrorToast = (errorMsg: string) => {
    this.toastController.create({
      message: errorMsg,
      duration: 3000,
      color: 'danger'
    }).then(toast => toast.present());
  }

}
