import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AngularFirestore} from 'angularfire2/firestore';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MailchimpEmail} from '../../database/mailchimp-email';
import {NotificationsService} from 'angular2-notifications';

@Component({
  selector: 'app-email-notifier',
  templateUrl: './email-notifier.component.html',
  styleUrls: ['./email-notifier.component.scss']
})
export class EmailNotifierComponent implements OnInit {

  @ViewChild('email') emailRef: ElementRef;

  emailForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email,
    ])
  });

  constructor(private firestore: AngularFirestore, private notification: NotificationsService) {
  }

  ngOnInit() {
  }

  submit(directive) {
    if (this.emailForm.status === 'VALID') {
      const id = this.firestore.createId();
      const data: MailchimpEmail = {id: id, dateImported: new Date(), email: this.emailForm.value.email, imported: false};
      this.firestore.collection<MailchimpEmail>('mailchimp-emails').doc<MailchimpEmail>(id).set(data).then(() => {
        directive.resetForm();
        this.emailForm.reset();
        this.notification.success('You have subscribed');
        /*        this.snackBar.open('You have subscribed!', ' ', {duration: 3000, extraClasses: ['email-snackbar']});*/
      });
    } else {
      this.notification.error('You must enter an valid email!');
    }
  }
}
