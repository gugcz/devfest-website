import { Component, Input, OnInit } from "@angular/core";
import { AngularFireStorage } from "@angular/fire/storage";

@Component({
  selector: "app-info-block",
  templateUrl: "./info-block.component.html",
  styleUrls: ["./info-block.component.scss"]
})
export class InfoBlockComponent implements OnInit {
  @Input() text: string;
  @Input() photos: string[];
  @Input() photoUrls: Promise<any>[];

  constructor(private firestorage: AngularFireStorage) {}

  ngOnInit() {
    this.buildImgUrls();
  }

  async buildImgUrls() {
    this.photoUrls = await this.photos.map(async (photo) => {
        return this.firestorage.ref(photo).getDownloadURL().toPromise();
    });
  }
}
