import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';


import { AppComponent }  from './app.component';
import { ConversationComponent } from './components/conversation.component'; 

@NgModule({
  imports:      [ BrowserModule, HttpModule],
  declarations: [ AppComponent, ConversationComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
