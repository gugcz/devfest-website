import {Component, OnInit} from '@angular/core';
import {AngularFirestore} from 'angularfire2/firestore';
import {FormControl, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material';
import {MailchimpEmail} from '../../database/mailchimp-email';

@Component({
  selector: 'app-email-notifier',
  templateUrl: './email-notifier.component.html',
  styleUrls: ['./email-notifier.component.scss']
})
export class EmailNotifierComponent implements OnInit {

  emailControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  constructor(private firestore: AngularFirestore, private snackBar: MatSnackBar) {
  }

  ngOnInit() {
  }

  getEmailErrorMessage() {
    return this.emailControl.hasError('required') ? 'You must enter an email!' :
      this.emailControl.hasError('email') ? 'Not a valid email!' :
        '';
  }

  submit() {
    if (this.emailControl.status === 'VALID') {
      const id = this.firestore.createId();
      const data: MailchimpEmail = {id: id, dateImported: new Date(), email: this.emailControl.value, imported: false};
      this.firestore.collection<MailchimpEmail>('mailchimp-emails').doc<MailchimpEmail>(id).set(data).then(() => {
        this.snackBar.open('You have subscribed!', ' ', {duration: 3000, extraClasses: ['email-snackbar']});
      });
    } else {
      this.snackBar.open(this.getEmailErrorMessage(), ' ', {duration: 3000, extraClasses: ['email-error-snackbar']});
    }
  }
}
