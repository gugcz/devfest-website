import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {AngularFirestore} from 'angularfire2/firestore';
import {FormControl, Validators} from '@angular/forms';
import * as firebase from 'firebase';
import {Invoice} from '../../dto/invoice';
import { AngularFireFunctionsModule, AngularFireFunctions } from '@angular/fire/functions';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit {

  countTickets;
  email = new FormControl('', [Validators.email]);
  companyName;
  street;
  city;
  zip;
  registrationNumberIC;
  registrationNumberDIC;
  country;
  loading = false;
  done = false;
  price: number;
  priceCompany: number;

  constructor(
    public dialogRef: MatDialogRef<InvoiceComponent>, public afStore: AngularFirestore, private afFunctions: AngularFireFunctions) {
  }

  ngOnInit() {
    this.countTickets = 1;
    const getCurrentCompanyFundedPrice = this.afFunctions.httpsCallable('invoiceGetCurrentCompanyFundedPrice');
    getCurrentCompanyFundedPrice({}).subscribe(result => {
      this.priceCompany = result.price;
    });
    const getCurrentExchangeRate = this.afFunctions.httpsCallable('invoiceGetCurrentExchangeRate');
    getCurrentExchangeRate({from: 'EUR', to: 'CZK'}).subscribe((result) => {
      this.price = result.price;
    });
  }

  goToHome() {
    this.dialogRef.close();
  }

  sendInvoice() {
    const invoice: Invoice = {
      countTickets: this.countTickets,
      email: this.email.value,
      companyName: this.companyName,
      street: this.street,
      city: this.city,
      zip: this.zip,
      registrationNumberIC: this.registrationNumberIC,
      country: this.country
    };
    if (this.registrationNumberDIC !== undefined) {
      if (this.registrationNumberDIC.length > 0) {
        invoice.registrationNumberDIC = this.registrationNumberDIC;
      }
    }
    this.loading = true;
    this.afStore.collection('invoices').add(invoice).then(() => {
      this.loading = false;
      this.done = true;
    });
  }

  getEmailErrorMessage() {
    return this.email.hasError('email') ? 'Not a valid email' :
      '';
  }

}
