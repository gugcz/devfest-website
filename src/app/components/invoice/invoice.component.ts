import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { AngularFirestore } from 'angularfire2/firestore';
import { FormControl, Validators } from '@angular/forms';
import { Invoice } from '../../database/invoice';
import * as firebase from 'firebase';

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
        public dialogRef: MatDialogRef<InvoiceComponent>, public afStore: AngularFirestore) {
    }

    ngOnInit() {
        this.countTickets = 1;
        const getCurrentCompanyFundedPrice = firebase.functions().httpsCallable('invoiceGetCurrentCompanyFundedPrice');
        getCurrentCompanyFundedPrice({}).then((result) => {
            this.priceCompany = result.data.price;
        });
        const getCurrentExchangeRate = firebase.functions().httpsCallable('invoiceGetCurrentExchangeRate');
        getCurrentExchangeRate({ from: 'EUR', to: 'CZK' }).then((result) => {
           this.price = result.data.price;
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
        if (this.registrationNumberDIC.length > 0) {
            invoice.registrationNumberDIC = this.registrationNumberDIC;
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
