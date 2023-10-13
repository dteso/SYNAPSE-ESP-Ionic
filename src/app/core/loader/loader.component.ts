import { Component, Input, OnInit } from '@angular/core';
import { LoaderService } from '../../services/screen-loader.service'

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {

  isLoading = true;

  constructor(
    private readonly loader: LoaderService
  ) { }

  ngOnInit(): void {
    this.loader._loading$.subscribe(res => {
      this.isLoading = res;
      console.log('IS LOADIIIINGGGGGGG', this.isLoading);
    })
  }



}
