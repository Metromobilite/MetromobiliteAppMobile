// *
// Metromobilité is the mobile application of Grenoble Alpes Métropole <http://www.metromobilite.fr/>.
// It provides all the information and services for your travels in Grenoble agglomeration.
// Available for Android, iOs, Windows Phone, it's been developed on Cordova https://cordova.apache.org/.

// Copyright (C) 2013
// Contributors:
//	NB/VT - sully-group - www.sully-group.fr - initialisation and implementation

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
// *

//--------------------------------------//
// globals
//--------------------------------------//
var serverUrl =  'https://siv.metromobilite.fr';
var loginUrl = serverUrl + '/ws_mobile/LoginMobileApp.svc';
var serviceUrl = serverUrl + '/wcf_abonnement/';

//--------------------------------------//
// loginSIV : Objet SIV
//--------------------------------------//
var loginSIV = {
	//--------------------------------------//
	// login
	//--------------------------------------//
	login : function(user,pwd,phone_ident,os) {

		if (!user || !pwd || !phone_ident || !os || phone_ident=="" || os=="") {
			alert(lang.alert[5]);
			return;
		}
		
		if (user=="" || pwd=="") {
			alert(lang.alert[6]);
			return;
		}
			
        var soapMessage =
        '<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soapenvelope/" xmlns:tem="http://tempuri.org/"><soapenv:Header/><soapenv:Body><tem:InscriptionNotification><tem:user>'+user+'</tem:user><tem:password>'+pwd+'</tem:password><tem:smartphone_ident>'+phone_ident+'</tem:smartphone_ident><tem:smartphone_os>'+os+'</tem:smartphone_os></tem:InscriptionNotification></soapenv:Body></soapenv:Envelope>';
        $.support.cors = true;

		var pl = new SOAPClientParameters();
        pl.add("user",user);
        pl.add("password",pwd);
        pl.add("smartphone_ident",phone_ident);
        pl.add("smartphone_os",os);
		
		SOAPClient.invoke(loginUrl,"InscriptionNotification",pl,true,InscriptionNotification_callback);

		//--------------------------------------//
		// InscriptionNotification_callback
		//--------------------------------------//
		function InscriptionNotification_callback(data,response) {
        	switch(data) {
				case '1':
				case '5':
					var regId = window.localStorage.getItem('regId');
					window.localStorage.setItem('registered',regId);
					window.localStorage.setItem('user',user);
					app.showNotifs();
					
					break;
				case '2':
					alert(lang.alert[7]);
					break;
				case '3':
					alert(lang.alert[8]);
					break;
				case '4':
					alert(lang.alert[9]);
					break;
				default:
					alert(lang.alert[10]);
			}
        }
    },
	
	//--------------------------------------//
	// displayTrajets
	//--------------------------------------//
	displayTrajets : function(trajets) {
	
	$('#divTrajet').empty();
	//console.log('trajets.length =' + trajets.length )
		if (trajets.length==0) {
			$('#divTrajet').append("<div class='col-xs-12 text-center'><h6>Désolé nous n'avons trouvé aucun trajet dans votre abonnement veuillez revoir votre configuration</h6></div>");
		}
		else {
			$('<div class="listeSiv col-xs-12"><hr></div>').appendTo('#divTrajet');
			for(var i= 0; i < trajets.length; i++) {
				var contenuTrajet = $('<div class="col-xs-12"><h4 class="col-xs-12 text-center">'+trajets[i].intitule+'</h4></div>');
				
				//console.log('trajets[i].intitule =' + trajets[i].intitule )
				
				//Troncon
				for (tr in trajets[i].troncons) {
				
						var troncon = trajets[i].troncons[tr];
						
						if (troncon.ligne) { //Cas les ligne TC
							var code, logo;
							if (troncon.reseau == "Reseau SNCF") code = "SNC_" + troncon.ligne;
							else if (troncon.reseau == "Reseau TRANSISERE") 
							{ 
								code = "C38_" + troncon.ligne; 
							}
							else code = "SEM_" + troncon.ligne; //"Reseau TAG"

							if (dataLignesTC[code]) {
								var l = getLogoLgn(code,dataLignesTC[code].routeShortName,'#'+dataLignesTC[code].routeColor,false,'logoLgn','logoLgnRect');
								logo = $('<div>').append(l).html();
								$('<h6 class="left listeSiv trajetTC">'+logo+' '+dataLignesTC[code].routeLongName +'</h6>').appendTo(contenuTrajet);
							}
						}
						else {//Troncon routier
							if (troncon.adresseDepart != "") {
								$('<h6 class="left listeSiv"><div class="voiture logoLgn"/> De ' + troncon.adresseDepart+' à '+troncon.adresseArrivee+'</h6>').appendTo(contenuTrajet);
							} else {
								for (axe in troncon.axesCalcules) {
									
									if ((axe == 0) && (troncon.axesCalcules.length == 1))
										$('<h6 class="left listeSiv"><div class="voiture logoLgn"/> VOIE EMPRUNTEE : </span>').appendTo(contenuTrajet);
									else if (axe == 0)
										$('<h6 class="left listeSiv"><div class="voiture logoLgn"/> VOIES EMPRUNTEES : </span>').appendTo(contenuTrajet);
									
									$('<h6 class="left listeSiv trajetRoutier"> - '+troncon.axesCalcules[axe].commune+ " , " + troncon.axesCalcules[axe].voie +'</span>').appendTo(contenuTrajet);
								}
							}
						}
				}
				//Période
				var contenuPeriode = '<h5 class="listeSiv text-center">';
				for (pr in trajets[i].periods) {
					var periode = trajets[i].periods[pr];
					 '</h5>'
					if (pr == 0)
						contenuPeriode += 'De ';
					else
						contenuPeriode += ' et de : ';
					
					contenuPeriode += periode.heureDepartPeriode +'h00 à '+ periode.heureFinPeriode + 'h00, '+ formatJourPeriode(periode.semainier);
				}
				contenuPeriode += '.</h6>'
				$(contenuPeriode).appendTo(contenuTrajet);
				contenuTrajet.appendTo('#divTrajet');
				$('<div class="listeSiv col-xs-12"><hr></div>').appendTo('#divTrajet');
			}
		}
		
		//Format la chaine des jours de la période.
		function formatJourPeriode(semainier){
			//Lundi: 0x0000001, mardi: 0x0000010... 
			//tous les jours : 0x1111111 (127)
			//la semaine : 0x0011111 (31)
			//le week end : 0x1100000 (60)
			var jour = semainier.jourSemaineValue;
			
			if (jour == 127) return 'tous les jours'
			if (jour == 31) return 'la semaine'
			if (jour == 60) return 'le week-end'
			
			ret = "";
			if (jour & 1)
				ret = "le lundi";
			
			if (jour & 2)
				if (ret == "") ret = "le mardi";
				else ret += ", mardi";
			
			if (jour & 4)
				if (ret == "") ret = "le mercredi";
				else ret += ", mercredi";
			
			if (jour & 8)
				if (ret == "") ret = "le jeudi";
				else ret += ", jeudi";
			
			if (jour & 16)
				if (ret == "") ret = "le vendredi";
				else ret += ", vendredi";
			
			if (jour & 32)
				if (ret == "") ret = "le samedi";
				else ret += ", samedi";
			
			if (jour & 64)
				if (ret == "") ret = "le dimanche";
				else ret += ", dimanche";

			return ret;
		}
	},
	//--------------------------------------//
	// updateNotificationText
	//--------------------------------------//
	updateNotificationText: function(play) {
		var textToAppend = "<div class='col-xs-12'><h5>";
		var status = window.localStorage.getItem('notificationStatus');
		$('#divNotificationDescription').empty();

		if (status == 'notificationOff') { 
				textToAppend += lang.appMobile.modesilencieux; 
				$('#notificationOff').addClass('active'); 
				$('#notificationOn').removeClass('active'); 
				$('#notificationVibrates').removeClass('active');
			}

		if (status == 'notificationOn') {
				textToAppend += lang.appMobile.modeSonnerie;
				$('#notificationOff').removeClass('active');
				$('#notificationOn').addClass('active');
				$('#notificationVibrates').removeClass('active');
				
				if (play) {
					var e = { soundname : 'beep.wav' };
					app.playNotifSound(e);
				}
			}

		if (status == 'notificationVibrates') { 
				textToAppend += lang.appMobile.modeVibreur;  
				$('#notificationOff').removeClass('active'); 
				$('#notificationOn').removeClass('active'); 
				$('#notificationVibrates').addClass('active'); 
				if (play) {
					navigator.vibrate(300);
				}
			}
		textToAppend += "</h5></div>";
		$('#divNotificationDescription').append(textToAppend);
	},
	//--------------------------------------//
	// getTrajetsSIV
	//--------------------------------------//
	getTrajetsSIV : function() {
	
		this.updateNotificationText(false);
		
		$.support.cors = true;
				
		$.ajax({
				headers: { 'Authorization': 'Basic ' +  btoa(window.localStorage.getItem('registered').replace("http://","http@").replace(/:/g,"DOUBLEPOINT")  + ':')}, //'@' et ':' non supporté
				type: "GET",
				url: serviceUrl + "ServiceAbonnement.svc/GetAbonnementByID",
				data:{},
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				success: function (data) {
					console.log(JSON.stringify(data));
					loginSIV.displayTrajets(data.trajets);
				},
				error: function (msg) {
					$('#divTrajet').empty();
					var textToAppend = '<div class="col-xs-12 text-center"><h6>Désolé une erreur a été détectée lors de la communication avec le SIV:\n ( '+ JSON.stringify(msg) + ' )</h6></div>'
					$('#divTrajet').append(textToAppend.replace(/\\r\\n/g,''));
				}
			});
	},
	//--------------------------------------//
	// updateRegister
	//--------------------------------------//
	updateRegister : function(oldID,newID) {
	
		$.support.cors = true;
		
		$.ajax({
				headers: { 'Authorization': 'Basic ' +  btoa(oldID.replace("http://","http@").replace(/:/g,"DOUBLEPOINT")  + ':' + newID.replace("http://","http@").replace(/:/g,"DOUBLEPOINT"))}, //'@' et ':' non supporté
				type: "GET",
				url: serviceUrl + "ServiceAbonnement.svc/UpdateAbonnementByID",
				data:{},
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				success: function (data) {
					if (data.msg=="OK") {
						window.localStorage.setItem('registered',newID);
						console.log("Mise jour du register ID réussie sur le SIV");
					} else
					{
						navigator.notification.alert("L'identifiant des notifications a changé, merci de bien vouloir vous reconnecter (Mon Compte)", null, "MétroMobilité", "OK");
						//window.localStorage.setItem('registered','');
						console.log("Erreur 1 lors de la mise jour du register ID SIV : " + data.msg);
					}
				},
				error: function (msg) {
					$('#divTrajet').empty();
					navigator.notification.alert("L'identifiant des notifications a changé, merci de bien vouloir vous reconnecter (Mon Compte)", null, "MétroMobilité", "OK");
					//window.localStorage.setItem('registered','');
					console.log("Erreur 2 lors de la mise jour du register ID SIV : " + msg.statusText);
				}
			});
	}
};