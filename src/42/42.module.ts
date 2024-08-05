import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Component42 } from './42.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    Component42
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 1000
    })
  ],
  providers: [],
  bootstrap: [Component42]
})
export class Module42 { }
