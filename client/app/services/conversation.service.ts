import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class ConversationService {
    constructor(private _http:Http) {

    }

    startConversation() {
        return this._http.get('/api/v1/conversation')
            .map(res => res.json())
    }

    sendMessage(message) {
        var headers = new Headers();
        headers.append('content-type', 'application/json');

        return this._http.post('/api/v1/postConversation', JSON.stringify(message), {headers : headers})
            .map(res => res.json());
    }
}