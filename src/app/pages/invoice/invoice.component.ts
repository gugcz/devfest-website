import {Component, OnInit} from '@angular/core';
import {MatFormField} from '@angular/material';
import {Router} from '@angular/router';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit {

  constructor(private router: Router) {
  }

  ngOnInit() {
  }

  goToHome() {
    this.router.navigateByUrl('');
  }

}
