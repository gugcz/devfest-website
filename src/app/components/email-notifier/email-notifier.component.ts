import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {FormControl, Validators} from '@angular/forms';

interface MailChimpResponse {
  result: string;
  msg: string;
}

@Component({
  selector: 'app-email-notifier',
  templateUrl: './email-notifier.component.html',
  styleUrls: ['./email-notifier.component.scss']
})
export class EmailNotifierComponent implements OnInit {


  submitted = false;
  mailChimp = 'https://gug.us4.list-manage.com/subscribe/post-json?u=0da7a509ea18feb2638420b7f&amp;id=3a27fbd474';
  error = '';

  emailControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);
  nameControl = new FormControl('', [
    Validators.required
  ]);

  constructor(private http: HttpClient) {
  }

  ngOnInit() {
  }

  getEmailErrorMessage() {
    return this.emailControl.hasError('required') ? 'You must enter a value' :
      this.emailControl.hasError('email') ? 'Not a valid email' :
        '';
  }

  getNameErrorMessage() {
    return this.nameControl.hasError('required') ? 'You must enter a value' : '';
  }

  submit() {
    this.error = '';
    if (this.emailControl.status === 'VALID' && this.nameControl.status === 'VALID') {

      const params = new HttpParams()
        .set('EMAIL', this.emailControl.value)
        .set('FNAME', this.nameControl.value.split(' ').slice(0, -1).join(' '))
        .set('LNAME', this.nameControl.value.split(' ').slice(-1).join(' '))
        .set('b_0da7a509ea18feb2638420b7f_3a27fbd474', ''); // hidden input name
      const mailChimpUrl = this.mailChimp + params.toString();


      // 'c' refers to the jsonp callback param key. This is specific to Mailchimp
      this.http.jsonp<MailChimpResponse>(mailChimpUrl, 'c').subscribe(response => {

        if (response.result && response.result !== 'error') {
          this.submitted = true;
        } else {
          this.error = response.msg;
        }
      }, error => {
        this.error = 'Sorry, an error occurred.';
      });
    }
  }

}
