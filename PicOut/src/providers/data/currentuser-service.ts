import { Injectable } from '@angular/core';
import firebase from 'firebase';

@Injectable()
export class CurrentUserService {

  public userProfile: firebase.database.Reference;
  public currentUser: firebase.User;

  constructor() {
  	// Corto : Récupération de l'UID utilisateur courant
    this.currentUser = firebase.auth().currentUser;
    this.userProfile = firebase.database().ref('/users');
  }

  getCurrentUser(id): firebase.database.Reference {
    return firebase.database().ref(`/users/${id}`);
  }

  // Corto : Fonction qui permet d'ajouter des infos à l'utilisateur dans notre bdd
  setCurrentUser(userId, email) {
    firebase.database().ref('users/' + userId).set({
      email: email
    });
  }

  addFriendForCurrentUser(friendUID, email){
    firebase.database().ref('users/' + this.currentUser.uid + '/friends').push({
      friendUID: friendUID,
      email: email
    });
  }

  currentUserUpdateUsername(newUsername){
    firebase.database().ref('users/' + this.currentUser.uid).update({
      username: newUsername
    });
  }

  currentUserUpdateEmail(newEmail){
    firebase.database().ref('users/' + this.currentUser.uid).update({
      email: newEmail
    });
  }

  currentUserUpdateFirstName(newFirstName: string) {
    firebase.database().ref('users/' + this.currentUser.uid).update({
      firstname: newFirstName
    })
  }

  currentUserUpdateLastName(newLastName: string) {
    firebase.database().ref('users/' + this.currentUser.uid).update({
      lastname: newLastName
    })
  }
}
