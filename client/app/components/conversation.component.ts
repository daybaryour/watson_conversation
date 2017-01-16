import { Component, OnInit } from '@angular/core';

import { ConversationService } from '../services/conversation.service';
import { Conversation } from '../conversation';
import { ButtonVariables } from '../buttonVariables';
import { TextVariables } from '../TextVariables';

declare var $:any;

@Component({
    moduleId:module.id,
    selector: 'conversation',
    templateUrl: 'conversation.component.html',
})

export class ConversationComponent implements OnInit { 
    conversation : Conversation[];
    conversationDisplay : Conversation[];
    ButtonVariables : ButtonVariables;
    TextVariables : TextVariables;
    ChangeVariables:any;
    SystemConversation : ButtonVariables;
    FormVariables : ButtonVariables;
    UserGlobalVariables : {
        firstname:"", lastname:"", Email:"", Phone:"", Address:""
    };
    //message : stringmessage;
     
    constructor(private _conversationService: ConversationService) {

    }

    ngOnInit() {
        this.ChangeVariables = false;

        this.conversation = [];
        this._conversationService.startConversation()
            .subscribe(conversation => {

                this.updateConversationUi("watson", conversation.output.text[0], "", conversation.context);
                //this.updateConversationDisplayUi("watson", conversation.output.text[0], "", conversation.context); //This is here for just what is outputted to the screen
                
                this.continueWatsonConversation("Select one of the many things i can help you with of just simply type what you want done", conversation.context);
                this.ButtonVariables = this.fetchDefaultHelpButtons();
                this.TextVariables = true;
                this.ChangeVariables = false;
         })
    }

    sendConversationMessage(event, message:any) {
        var result:any;
        this.TextVariables = false;
        this.ButtonVariables = false;
        this.ChangeVariables = true;
        this.SystemConversation = false;
       
        var conversation_length = this.conversation.length;
        var lastContext = this.conversation[conversation_length - 1].context;

        // console.log(this.conversation[conversation_length].context)
        var newMessage = { message : message, sender : "user", class:"cui__user", context: lastContext };
        
        if(this.FormVariables == true) {
            $("#formHolders").addClass("hide").html("")
            this.FormVariables = false;
            this.continueUserConversation("form action cancelled", lastContext);
        } 

        this.updateConversationUi("user", message, "cui__user", lastContext);
        message = '';
        result = this._conversationService.sendMessage(newMessage);
        result.subscribe(response => {
            this.updateConversationUi("watson", response.output.text[response.output.text.length - 1], "", response.context);
            console.log(response)
            if(response.output.data != undefined) {
                var data = response.output.data;
                var ui_type = data.ui_type;
                var action = data.action;

                if(ui_type == "text") {
                    this.TextVariables = true;
                }

                if(ui_type == "buttons") {
                    switch(action) {
                        case "fetch_account_types":
                            var account_types = this.fetchAccountTypes();
                            this.ButtonVariables = account_types;
                        break;

                        case "fetch_bill_types":
                            var bill_types = this.fetchBillTypes();
                            this.ButtonVariables = bill_types;
                            this.TextVariables = true;
                        break;

                        case "fetch_mobile_networks":
                            this.ButtonVariables = this.fetchMobileNetworks();
                        break;

                        default:
                            this.ButtonVariables = ["yes", "No"];
                        break;
                    }                    
                }

                if(ui_type == "form") {
                    switch(action) {
                        case "fetch_account_form":
                            //this.continueWatsonConversation("what would you like me to help you with?", response.context);
                            this.fetchAccountForm(data.account_type);
                        break;
                    }
                }

                if(ui_type == "finale") {
                    //User change their mind call fake message
                    this.continueWatsonConversation("what would you like me to help you with?", response.context);
                }

                if(ui_type == "doneTask") {
                    //User change their mind call fake message
                    this.continueWatsonConversation("Jamen is please to have served you right, what else would you like to do?", response.context);
                }

                if(ui_type == "change") {
                    //User change their mind call fake message
                    var message = "what else would you like me to help you with?"; 
                    

                    switch(action) {
                        case "account_opening":
                            message = "You can choose another account type to open or just type in what you want to get done";
                            this.TextVariables = true;
                            this.ChangeVariables = false;
                            this.ButtonVariables = this.fetchAccountTypes();
                        break;

                        default:

                        break;
                    }
                    
                    
                    this.continueWatsonConversation(message, response.context);
                }
            }
        });
        
    }

    generateSystemConversations(event:any, message:string, action:string, name:string, towatson:any) {
        this.SystemConversation = false;
        var conversation_length = this.conversation.length;
        var lastContext = this.conversation[conversation_length - 1].context;

        if(action == "form") {
            var host_url = "../app/partials/forms/";
            this.load_static_page(host_url+message+"_form.html", lastContext);
        }

        if(action == "learn") {
            this.updateConversationUi("../app/partials/extralearning/"+message+".png", "https://en.wikipedia.org/wiki/"+message, "image", lastContext)
            var form_type = (message == "savings_account") ? "savings" : "current";
            this.SystemConversation = { 
                Text: "", 
                parent: (message == "savings_account") ? "savings_account" : "current_account",
                Params:[
                    {
                        name:"Fill "+form_type+" account form",
                        action:"form",
                        backToWatson:false
                    },
                    // {
                    //     name:"No thanks. I'll like to do something else",
                    //     action:"cancel",
                    //     backToWatson:false
                    // }
                ]
            };
        }
    }

    load_static_page(static_url:string, context) {
        //document.getElementById("formHolders").innerHTML='<object type="text/html" data="'+static_url+'" ></object>';
        //this.updateConversationUi("../app/partials/extralearning/"+message+".png", "https://en.wikipedia.org/wiki/"+message, "image", lastContext)
        this.FormVariables = true;
        $("#formHolders").load(static_url, function (event) {
            $(this).removeClass("hide")
        });
        $("#style-4").animate({ scrollTop: $('#style-4').prop("scrollHeight")}, 1000);
        
    }

    continueWatsonConversation(message:string, context:any) {
        this.updateConversationUi("watson",message , "", context);
        this.TextVariables = true;
        this.ButtonVariables = this.fetchDefaultHelpButtons();
    }

    continueUserConversation(message:string, context:any) {
        this.updateConversationUi("user",message , "cui__user", context);
        this.TextVariables = true;
        this.ButtonVariables = this.fetchDefaultHelpButtons();
    }

    updateConversationUi(sender:any, text:string, user_class:string, context:any) {  

        if(user_class == "image") {
            //Image file is being sent
            var curr_convo = {message: text, sender: sender, class:user_class, context:context};
        } else {
            var curr_convo = {message: text, sender: sender, class:user_class, context:context};
        }
        $("#style-4").animate({ scrollTop: $('#style-4').prop("scrollHeight")}, 1000);
        this.conversation.push(curr_convo);
    }

    fetchAccountTypes() {
        return {ButtonText: "Select and account type to continue.", ButtonParams: ["Savings", "Current"]};
    }

    fetchBillTypes() {
        return {ButtonText: "Select a bill type to continue.", ButtonParams: ["Power", "Water", "Cable", "Internet"]}
    }

    fetchDefaultHelpButtons() {
        return {ButtonText: "I can help you with any of these things.", ButtonParams: ["i'll like to open a new bank account", "I'll like to top up my mobile phone", "I want to pay a bill"]}
    }

    fetchMobileNetworks() {
        return {ButtonText: "Just choose your network provider.", ButtonParams: ["Etisalat", "Airtel", "Mtn", "Globacom"]}
    }

    fetchAccountForm(account_type:string) {
        if(account_type == "savings" || account_type == "current") {
            this.SystemConversation = { 
                Text: "", 
                parent: (account_type == "savings") ? "savings_account" : "current_account",
                Params:[
                    {
                        name:"Learn More about "+account_type+" ",
                        action: "learn",
                        backToWatson:false
                    },
                    {
                        name:"Fill "+account_type+" account form",
                        action:"form",
                        backToWatson:false
                    }
                    // {
                    //     name:"No thanks. I'll like to do something else",
                    //     action:"cancel",
                    //     backToWatson:"i'll like to open a new account"
                    // }
                ]
            }
        } 
    }
}
