import { Component } from '@angular/core';
import { ConversationService } from './services/conversation.service';


@Component({
  moduleId:module.id,
  selector: 'my-app',
  templateUrl: 'app.component.html',
  providers: [ ConversationService ]
})

export class AppComponent  { 

}
