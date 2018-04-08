import {Component, OnInit} from '@angular/core';
import {MetaChangerService} from '../../services/meta-changer.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {


  constructor(private metaChanger: MetaChangerService) { }

  ngOnInit() {
  }

}
