import { Component } from '@angular/core';
import { NavController, NavParams, PopoverController, AlertController } from 'ionic-angular';
import { VotesService } from '../../providers/data/votes-service';
import { CurrentUserService } from '../../providers/data/currentuser-service';
import { PopOverZoomChoicePage } from '../pop-over-zoom-choice/pop-over-zoom-choice';
import { MyVotesPage } from '../my-votes/my-votes';
import { Storage } from '@ionic/storage';
import * as $ from 'jquery';

@Component({
  selector: 'page-vote-guested',
  templateUrl: 'vote-guested.html'
})
export class VoteGuestedPage {

  public voteID = this.navParams.get('vote_id');
  public voteTitle = "";
  public voteExpDate = "";
  public voteMasterID = 0;
  public voteMasterName = "";
  public voteResponsesArray: any;
  public invitedPeopleUserIDs: any;
  public choosenUrl = "";
  public alreadyChoosenUrl = "";

  constructor(
  	public navCtrl: NavController, 
  	public navParams: NavParams,
  	private votesData: VotesService,
  	private currentUserData: CurrentUserService,
    public popoverCtrl: PopoverController,
    public storage: Storage,
    public alertCtrl: AlertController,
    ) {}

  ionViewDidLoad() {

    // Récupération des Datas du vote courant
    this.votesData.getVoteData(this.voteID).on('value', (data) => {
      	console.log(data.val());
      	this.voteTitle = data.val().title;
      	this.voteExpDate = data.val().expiration_date;
      	this.voteMasterID = data.val().voteMasterID;
      	this.invitedPeopleUserIDs = data.val().friendAddedToVote;
      	this.voteResponsesArray = data.val().responsesUrl;
    });

    // Récupération des datas du voteMaster
    this.currentUserData.getCurrentUser(this.voteMasterID).on('value', (data) => {
    	console.log("VoteMaster Datas : ", data.val());
    	this.voteMasterName = data.val().email;
    });

    this.votesData.getClickedVoteInvitedAt(this.voteID).on('value', (data) => {
      this.alreadyChoosenUrl =  data.val().responseChoosen;
      $(`img[src="${this.alreadyChoosenUrl}"]`).closest('.choice').addClass('selected');
    });
  }

  public moveToMyVotes() {
    this.navCtrl.push(MyVotesPage);
  }

  public confirmAnswer() {
    if(this.choosenUrl != "") {
      // Si l'utilisateur n'avait jamais choisi de réponse auparavant
      if(this.alreadyChoosenUrl == "") {
        // Ajouter sa réponse
        this.votesData.userHasChoosenThisResponse(this.choosenUrl, this.voteID);
        // Trouver l'index de sa réponse dans la tableau de réponses
        let indexOfTheResponse = this.voteResponsesArray.indexOf(this.choosenUrl);
        let stampScore = 0;
        // Récupérer l'actuel score
        this.votesData.getScoreOfChoosenIndex(this.voteID, indexOfTheResponse).on('value', (data) => {
          stampScore = data.val();
          stampScore++;
        });
        // Placer le nouveau score
        this.votesData.addScoreToChoosenIndex(this.voteID, indexOfTheResponse, stampScore);
      } else {
        // Enlever les points auparavant attribués à la réponse
        let indexOfTheResponse = this.voteResponsesArray.indexOf(this.alreadyChoosenUrl);
        let stampScore = 0;
        this.votesData.getScoreOfChoosenIndex(this.voteID, indexOfTheResponse).on('value', (data) => {
          stampScore = data.val();
          stampScore--;
        });
        this.votesData.addScoreToChoosenIndex(this.voteID, indexOfTheResponse, stampScore);
        
        // Ajouter sa réponse
        this.votesData.userHasChoosenThisResponse(this.choosenUrl, this.voteID);
        // Trouver l'index de sa réponse dans la tableau de réponses
        indexOfTheResponse = this.voteResponsesArray.indexOf(this.choosenUrl);
        stampScore = 0;
        // Récupérer l'actuel score
        this.votesData.getScoreOfChoosenIndex(this.voteID, indexOfTheResponse).on('value', (data) => {
          stampScore = data.val();
          stampScore++;
        });
        // Placer le nouveau score
        this.votesData.addScoreToChoosenIndex(this.voteID, indexOfTheResponse, stampScore);
      }
    } else {
      let errorMessage= "Veuillez choisir une réponse pour confirmer";
      this.showErrorMessage("Attention", errorMessage);
    }
  }

  presentPopover(url) {
    let popover = this.popoverCtrl.create(PopOverZoomChoicePage, {
        selectedUrl: url,
        voteID: this.voteID
    });
    popover.present();
    popover.onWillDismiss(() => {
      this.storage.get('choosenUrl').then((val) => {
        this.choosenUrl = val;
        $('.choice').removeClass('selected');
        $(`img[src="${this.choosenUrl}"]`).closest('.choice').addClass('selected');
      })
   });
  }

  showErrorMessage(title, text) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: text,
      buttons: [
      {
        text: 'Ok',
        role: 'cancel',
      }
    ]
    });
    alert.present();
  }
}
