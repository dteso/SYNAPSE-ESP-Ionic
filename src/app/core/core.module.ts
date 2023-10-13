import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { EllipsisPipe } from '../pipes/ellipsis.pipe';
import { LoaderComponent } from './loader/loader.component';
import { LoaderModule } from './loader/loader.module';

@NgModule({
  declarations: [
    SidebarComponent,
    HeaderComponent,
    EllipsisPipe
  ],
  imports: [
    CommonModule,
    RouterModule,
    IonicModule.forRoot(),
    LoaderModule
  ],
  exports: [
    SidebarComponent,
    HeaderComponent,
    LoaderComponent,
    EllipsisPipe,
  ]
})
export class CoreModule { }
