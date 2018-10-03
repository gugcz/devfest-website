import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AngularFirestore} from 'angularfire2/firestore';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MailchimpEmail} from '../../database/mailchimp-email';

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

  constructor(private firestore: AngularFirestore) {
  }

  ngOnInit() {
  }
}
