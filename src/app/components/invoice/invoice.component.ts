import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {AngularFirestore} from 'angularfire2/firestore';
import {FormControl, Validators} from '@angular/forms';
import {Invoice} from '../../database/invoice';

@Component({
    selector: 'app-invoice',
    templateUrl: './invoice.component.html',
    styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit {

    countTickets = new FormControl('', [Validators.required]);
    email = new FormControl('', [Validators.required]);
    companyName = new FormControl('', [Validators.required]);
    street = new FormControl('', [Validators.required]);
    city = new FormControl('', [Validators.required]);
    zip = new FormControl('', [Validators.required]);
    registrationNumberIC = new FormControl('', [Validators.required]);
    registrationNumberDIC = new FormControl('', [Validators.required]);
    country = new FormControl('', [Validators.required]);
    loading = false;

    constructor(
        public dialogRef: MatDialogRef<InvoiceComponent>, public afStore: AngularFirestore) {
    }

    ngOnInit() {
    }

    goToHome() {
        this.dialogRef.close();
    }

    sendInvoice() {
        const invoice: Invoice = {
            countTickets: this.countTickets.value,
            email: this.email.value,
            companyName: this.companyName.value,
            street: this.street.value,
            city: this.city.value,
            zip: this.zip.value,
            registrationNumberIC: this.registrationNumberIC.value,
            registrationNumberDIC: this.registrationNumberIC.value,
            country: this.country.value
        };
        this.loading = true;
        this.afStore.collection('invoices').add(invoice).then(() => {
            this.loading = false;
            this.dialogRef.close();
            // TODO - thanks for buy
        });
    }

    getErrorMessage() {
        return 'You must enter a value';
    }

}
