import { Component, OnInit } from '@angular/core';

import { FormsModule }   from '@angular/forms';

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
    DecideVariables : ButtonVariables;
    SystemTextVariables : ButtonVariables;
    UserGlobalVariables = {
        firstname:"", lastname:"", Email:"", Phone:"", Address:"", preferredName : ""
    };
    activeKey:string;
    appState:string;
    activeForm:string;
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
        this.SystemTextVariables = false;
        
       
        var conversation_length = this.conversation.length;
        var lastContext = this.conversation[conversation_length - 1].context;

        // console.log(this.conversation[conversation_length].context)
        var newMessage = { message : message, sender : "user", class:"cui__user", context: lastContext };
        
        if(this.FormVariables == true) {
            $("#formHolders").addClass("hide")
            this.FormVariables = false;
            this.changeDisplayedForm("default", false);
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
                    this.TextVariables = false;
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

                        case "select_card_options":
                            this.ButtonVariables = this.fetchCardTypes();
                        break;

                        default:
                            this.ButtonVariables = ["yes", "No"];
                        break;
                    }                    
                }

                if(ui_type == "form") {
                    switch(action) {
                        case "fetch_account_form":
                            this.fetchAccountForm(data.account_type);
                        break;

                        case "fetch_atm_card_form":

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
            this.TextVariables = false;
            this.changeDisplayedForm(message, false);
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

    continueWatsonConversation(message:string, context:any, no_text_variables = false) {
        this.updateConversationUi("watson",message , "", context);
        
        this.TextVariables = true;
        if(no_text_variables = true) {
            this.TextVariables = false;
        }
        //this.ButtonVariables = this.fetchDefaultHelpButtons();
    }

    continueUserConversation(message:string, context:any) {
        this.updateConversationUi("user",message , "cui__user", context);
        this.TextVariables = true;
        //this.ButtonVariables = this.fetchDefaultHelpButtons();
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

    changeDisplayedForm(form:string, key) {
        this.FormVariables = true;
        $("#formHolders").removeClass('hide');
        if(key) {
            this.activeKey = key;
        }
        this.activeForm = form;
        $("#style-4").animate({ scrollTop: $('#style-4').prop("scrollHeight")}, 1000);
    }

    createNewBankAccount(account_type:string, firstname:any, lastname:any, phone:any, title:string, gender:string, email:any, dob, mailingaddress, city, country) {
        //Run a save function to save use details
        //update the global details
        // UserGlobalVariables : {
        //     firstname:"", lastname:"", Email:"", Phone:"", Address:""
        // };
        this.UserGlobalVariables.firstname = this.UserGlobalVariables.preferredName = firstname;
        this.UserGlobalVariables.lastname = lastname;
        this.UserGlobalVariables.Email = email;
        this.UserGlobalVariables.Phone = phone;

        var conversation_length = this.conversation.length;

        if(this.conversation.length) {
            var lastContext = this.conversation[conversation_length - 1].context;
            this.changeDisplayedForm("default", false);
            $("#formHolders").addClass("hide");

            this.continueUserConversation("Successfully created savings account", lastContext);
            this.continueWatsonConversation(account_type+" account process successfully initiated. A representative of the bank will contact you shortly", lastContext);

            if(firstname != "") {
                this.continueWatsonConversation("By the way would you like me to call you "+firstname+" from now?", lastContext, false);
                this.TextVariables = this.ButtonVariables = this.FormVariables, this.ChangeVariables = this.SystemTextVariables = false;

                this.DecideVariables = {ButtonText: "", ButtonContext: "confirmFirstname", ButtonParams: [
                                                                                            {text:"Yes you can call me "+firstname, decision:"Yes"},
                                                                                            {text:"No that's not my preferred name", decision:"No"}]};
            }            
        }
    }

    fetchAccountTypes() {
        return {ButtonText: "Select an account type to continue.", ButtonParams: ["Savings", "Current"]};
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

    fetchRequestNewCard() {
        return {ButtonText: "Just choose your network provider.", ButtonParams: ["Etisalat", "Airtel", "Mtn", "Globacom"]}
    }

    fetchCardTypes() {
        return {ButtonText: "Select one of the atm card types below.", ButtonParams: ["Visa Card", "Master Card", "Verve Card"]}
    }

    sendSystemConversationMessage(message:string, context:any) {
        var conversation_length = this.conversation.length;
        var lastContext = this.conversation[conversation_length - 1].context;

        this.SystemTextVariables = false;
        switch(context) {
            case "confirmFirstname":
                this.continueUserConversation(message, lastContext);
                this.UserGlobalVariables.preferredName = message;
                message = '';
                this.continueWatsonConversation("Okay, Jamen would remember your name next time", lastContext);
                
                //check if user has an atm card if not suggest new atm card
                this.suggestNewAtmCard(lastContext);
                break;
        }
    }

    makeDecision(context:string, decision:string, text:string ) {
        var conversation_length = this.conversation.length;
        var lastContext = this.conversation[conversation_length - 1].context;

        switch(context) {
            case "confirmFirstname":
                if(decision == "Yes") {
                    this.continueUserConversation(text, lastContext);
                    this.continueWatsonConversation("Perfect. I'll remember your name next time.", lastContext);  
                    this.TextVariables = this.ButtonVariables = this.ChangeVariables = this.FormVariables = false;
                    this.suggestNewAtmCard(lastContext);              
                } else {
                    this.TextVariables = this.ButtonVariables = this.ChangeVariables = this.FormVariables = this.DecideVariables = false;
                    this.SystemTextVariables = { placeholder:"Enter your preferred name", context: context};

                    this.continueUserConversation(text, lastContext);
                    this.continueWatsonConversation("Alright, what would you like me to call you then?.", lastContext);
                }
                break;
            
            case "requestNewCard":
                if(decision == "Yes") {
                    this.continueUserConversation(text, lastContext);
                    this.continueWatsonConversation("Could you please confirm why you are requesting a new card?.", lastContext);  
                    this.TextVariables = this.ButtonVariables = this.ChangeVariables = this.FormVariables = this.DecideVariables = false ;
                    this.ButtonVariables = {ButtonText: "", ButtonParams: ["I'm a new customer and i'll like to request a new bank card", "Something happened to my card and thus i'll be needing a new one"]};           
                } else {

                }
                break;
        }
    }

    suggestNewAtmCard(lastContext) {
        this.continueWatsonConversation("So "+this.UserGlobalVariables.preferredName+", would you like to request a new atm card for your account?", lastContext);
        this.DecideVariables = {ButtonText: "", ButtonContext: "requestNewCard", ButtonParams: [
                                                                                            {text:"Yes please i'll like a new card", decision:"Yes"},
                                                                                            {text:"No thanks i don't need a card for now", decision:"No"}]};;
                  
    }
}
