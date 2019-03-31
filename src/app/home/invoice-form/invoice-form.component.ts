import { Component, OnInit } from '@angular/core';

import { AngularFireFunctions } from '@angular/fire/functions';
import { TicketView } from '../iticket/ticket-view';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { NewInvoice } from 'src/app/dto/new-invoice';
import { AngularFirestore } from '@angular/fire/firestore';
import { elementEnd } from '@angular/core/src/render3/instructions';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Country {
  code: string;
  name: string;
}

@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.css']
})
export class InvoiceFormComponent implements OnInit {

  currentCompanyPrice: number;
  currentCompanyPriceE: number;
  currentVIPPrice: number;
  currentVIPPriceE: number;

  listOfCountries: Country[];

  countTicketsNormal;
  countTicketsVip;
  email = new FormControl('', [Validators.email]);
  companyName;
  street;
  city;
  zip;
  registrationNumberIC;
  vatNumber;
  country;


  constructor(
    private afFunctions: AngularFireFunctions,
    private http: HttpClient,
    private dialogRef: MatDialogRef<InvoiceFormComponent>,
    private afStore: AngularFirestore,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
    const getCompanyPrice = this.afFunctions.httpsCallable<{}, {normal: TicketView, vip: TicketView}>('getCurrentTicketsForInvoice');
    getCompanyPrice({}).subscribe((data) => {
      if (data.normal != null){
        this.currentCompanyPrice = data.normal.price;
        this.currentCompanyPriceE = data.normal.eur_price;
      }
      if (data.vip != null){
        this.currentVIPPrice = data.vip.price;
        this.currentVIPPriceE = data.vip.eur_price;
      }
    });
    this.http.get<Country>('assets/country-list.json').subscribe((data) => {
      this.listOfCountries = Object.keys(data).map((key) => ({ code: key, name: data[key] })).sort(this.compareCountry);
    });
  }

  compareCountry(a, b) {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  }

  goToHome() {
    this.dialogRef.close();
  }

  async sendInvoice() {
    const invoice: NewInvoice = {
      countTicketsNormal: this.countTicketsNormal !== undefined && this.countTicketsNormal > 0 ? this.countTicketsNormal : null,
      countTicketsVIP: this.countTicketsVip !== undefined && this.countTicketsVip > 0 ? this.countTicketsVip : null ,
      email: this.email.value,
      companyName: this.companyName,
      street: this.street,
      city: this.city,
      zip: this.zip,
      registrationNumberIC: this.registrationNumberIC,
      country: this.country
    };
    if (this.vatNumber !== undefined) {
      if (this.vatNumber.length > 0) {
        invoice.vatNumber = this.vatNumber;
      }
    }
    this.afStore.collection('invoiceRequests').add(invoice)
    .then(() => this.snackBar.open('Thank you! Check your email for details', null, {duration: 5000}))
    .then(() => this.goToHome());
  }

  getEmailErrorMessage() {
    return this.email.hasError('email') ? 'Not a valid email' :
      '';
  }


}
