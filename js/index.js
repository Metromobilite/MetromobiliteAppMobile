// *
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

// This program is distributed in the hope that it will be usef
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
// *
 
var versionCode = "3.1.1";

//--------------------------------------//
// globals
//--------------------------------------//

//--------------------------------------//
// app : Objet applicatif principal
//--------------------------------------//
var appMetromobilite=true;

//--------------------------------------//
// olfunctionComplete : Verrue pour veille version android - 21-06-17
//--------------------------------------//
function olfunctionComplete() {
		
	(function (global) {
	
		if (!window.performance.now) window.performance = {
				now: function() {
				return +new Date();
				}
		};
		var rafPrefix;

		if ('mozRequestAnimationFrame' in global) {
			rafPrefix = 'moz';

		} else if ('webkitRequestAnimationFrame' in global) {
			rafPrefix = 'webkit';
		}

		if (rafPrefix && !global.requestAnimationFrame) {
			global.requestAnimationFrame = function (callback) {
				return global[rafPrefix + 'RequestAnimationFrame'](function () {
					callback(performance.now());
				});
			};
			global.cancelAnimationFrame = global[rafPrefix + 'CancelAnimationFrame'];
		} else if (!global.requestAnimationFrame) {
			var lastTime = Date.now();

			global.requestAnimationFrame = function (callback) {
				if (typeof callback !== 'function') {
					throw new TypeError(callback + ' is not a function');
				}

				var
				currentTime = Date.now(),
				delay = 16 + lastTime - currentTime;

				if (delay < 0) {
					delay = 0;
				}

				lastTime = currentTime;

				return setTimeout(function () {
					lastTime = Date.now();

					callback(performance.now());
				}, delay);
			};

			global.cancelAnimationFrame = function (id) {
				clearTimeout(id);
			};
		}
		}(this));
};

var app = {
	proxiMapStarted:false,
	trafficMapStarted:false,
	cartoAtmoMapStarted:false,
	prochainsPassagesId:'#mainView ',
	itiMapStarted:false,
	sourceFondCarte:null,
	sourceEvtTr:null,
	refInAppBrowser:null,
	pageCourante:"#rowAccueil",
	pagePrecente:"",
	bLocalisationEnCours:false,
	bNotificationAutorisee:true,
	position:null, //position de l'utilisateur pour les alertes
	photoURI:null, //photo de l'utilisateur pour les alertes
	onOnlineStatus:0, //0:inconnu, 1:on, 2:off, 3:plus de notif
	cptLignesPasChargees:5,
	dateMajEvtTC:false,
	watchID:"",
	start:0,
	langage:null,
	horairestries: null,
	startselector: null,
	fromParking:false,
	animationLaunched:0,
	animationUrl: 'https://www.metromobilite.fr/actus/applicationmobile/applicationmobile',

    // Application Constructor
    initialize: function() {
		
		$.support.cors = true;
		
		this.bindEvents();
		url.stat=url.hostnameProd+url.stat;
		url.dyn=url.hostnameProd+url.dyn;
		urlParams.heure = moment().toDate();
		
		var androidVersion = app.getAndroidVersion();
		
		if (androidVersion!=0 &&  androidVersion<=4.3) { //Verrue pour vielle version android - 21-06-17
			
			url.hostnameData=url.hostnameData.replace('https','http');//data.metromobilite.fr';
			url.hostnameDataTest=url.hostnameDataTest.replace('https','http');//'https://datatest.metromobilite.fr',
			url.hostnameProd=url.hostnameProd.replace('https','http');//'http://www.metromobilite.fr';
			url.urlPiwik=url.urlPiwik.replace('https','http');//'http://www.metromobilite.fr/stats/piwik.php';
			url.urlAddok=url.urlAddok.replace('https','http');//'http://api-adresse.data.gouv.fr';
			serverUrl=serverUrl.replace('https','http');//'http://siv.metromobilite.fr';
			url.stat=url.hostnameProd+url.stat;
			url.dyn=url.hostnameProd+url.dyn;
			
			oldAndroid = true;
			olfunctionComplete();
			
			console.log('Bascule en http (limitation Android <= 4.3.)');
		}

		//On echange les repertoires pour passer en preprod !!! TEST
		/*var switchpath = url.hostnameData;
		url.hostnameData = url.hostnameDataTest;
		url.hostnameDataTest = switchpath;
		app.animationUrl = app.animationUrl.replace('www.','preprod.');
		console.log('On echange les repertoires pour passer en preprod');*/

			
		var version = window.localStorage.getItem('version');
		if (version == null) {
			version = versionCode;
			window.localStorage.setItem('version',version);
		}

		var compteur = window.localStorage.getItem('compteur');
		if ((compteur == null) || (version != versionCode)) {
			compteur = 1;
		} else {
			compteur++;
		}
		window.localStorage.setItem('compteur',compteur);

		if (version != versionCode) {
			version = versionCode;
			window.localStorage.setItem('version',version);
		}

		var notifs = window.localStorage.getItem('notifs');
		if (notifs == null || notifs == '') {
			notifs = {};
			window.localStorage.setItem('notifs',JSON.stringify(notifs));
		}

		if (!window.localStorage.getItem('notificationStatus')) {
			window.localStorage.setItem('notificationStatus','notificationOn');
		}

		var lignesFavorites = window.localStorage.getItem('lignesFavorites');
		if (lignesFavorites == null) {
			lignesFavorites = {};
			window.localStorage.setItem('lignesFavorites',JSON.stringify(lignesFavorites));
		}
		
		var parkingsFavoris = window.localStorage.getItem('parkingsFavoris');
		if (parkingsFavoris == null) {
			parkingsFavoris = {};
			window.localStorage.setItem('parkingsFavoris',JSON.stringify(parkingsFavoris));
		}

		var camFavoris = window.localStorage.getItem('camFavoris');
		if (camFavoris == null) {
			camFavoris = {};
			window.localStorage.setItem('camFavoris',JSON.stringify(camFavoris));
		}

		var itiFavoris = window.localStorage.getItem('itiFavoris');
		if (itiFavoris == null) {
			itiFavoris = {};
			window.localStorage.setItem('itiFavoris',JSON.stringify(itiFavoris));
		}
		
		var myID = window.localStorage.getItem('myID');
		if (myID==null) {
			myID = 0;
			window.localStorage.setItem('myID',myID);
		}
		
		var registered = window.localStorage.getItem('registered');
		if (registered==null) {
			registered = '';
			window.localStorage.setItem('registered',registered);
		}
		var geolocationOff = window.localStorage.getItem('geolocationOff');
		if (geolocationOff==null) {
			geolocationOff = '';
			window.localStorage.setItem('geolocationOff',geolocationOff);
		}
		
		var user = window.localStorage.getItem('user');
		if (user==null) {
			window.localStorage.setItem('user','');
		}
		
		langage = window.localStorage.getItem('langage');
		
		if (langage==null) {
			window.localStorage.setItem('langage','fr');
			langage='fr';
		}
		if (langage != 'fr') {
				$.getScript("js/" + langage+ "/" + langage + ".js", function()
				{
					$('#rowParam #langageSelector').val(langage);
					$.getScript("js/translate.js",function() {translate(); app.buildMenu();} );

				}); 
		} else {
			app.buildMenu();
		}
		
		horairestries = window.localStorage.getItem('horairestries');
		if (!horairestries || (horairestries=='')) {
			horairestries = 'tri-default';
			window.localStorage.setItem('horairestries',horairestries);		
		}
		$('#rowParam #horairesSelector').val(horairestries);

		startselector = window.localStorage.getItem('startselector');
		if (!startselector || (startselector=='')) {
			startselector = 'start-accueil';
			window.localStorage.setItem('startselector',startselector);		
		}
		$('#rowParam #startSelector').val(startselector);
	},
	//--------------------------------------//
	// getAndroidVersion
	//--------------------------------------//
	getAndroidVersion:function(ua) {
		ua = (ua || navigator.userAgent).toLowerCase(); 
		var match = ua.match(/android\s([0-9\.]*)/);
		return match ? parseFloat(match[1]) : 0;
	},	
	//--------------------------------------//
	// launchAlert
	// http://data.metromobilite.fr/api/dyn/alerte/json
	//--------------------------------------//
	launchAlert:function() {
		
		var urlAlert = url.hostnameData + "/api/dyn/alerte/json";
		var iconAlerte = $('#iconAlerte');
		var mainFrameMessageAlerte = $('#mainFrameMessageAlerte');
		
		function successAlert(response) {
			
			var alertItemText = window.localStorage.getItem('alert');
			
			var alertDejaVu = (alertItemText != null && alertItemText == response.texte);
						
				
			if (response != null && (typeof(response.texte)!='undefined') && response.texte != "") {
				
				var backgroundColor = ((response.backgroundColor&&response.backgroundColor!="")?response.backgroundColor:"#bf00ff");
				var logoPath = ((response.type&&response.type!="")?url.hostnameProd + "/img/alerte/" + response.type + ".png":"");
				
				app.displayAlert(iconAlerte, response.texte, logoPath, backgroundColor, alertDejaVu);
								
				window.localStorage.setItem('alert',response.texte);
			} else {
				mainFrameMessageAlerte.hide();
				iconAlerte.hide();
				if (typeof(response.texte)!='undefined') window.localStorage.setItem('alert',null);
				app.launchAnimation();
			}
			
		}
		function errorAlert(response) {
			console.log("errorAlert : pas d'alerte en cours ou probleme de reception");
		}
		
		$.ajax({
			type: "GET",
			url: urlAlert,
			success: successAlert,
			dataType:'json'
		}).error(errorAlert);
	},
	//--------------------------------------//
	// launchAnimation
	// https://www.metromobilite.fr/actus/applicationmobile
	//--------------------------------------//
	launchAnimation:function() {
		
		if (app.animationLaunched) return;
		
		var type = ['.gif','.svg','.jpg','.png'];
		var index = 0;

		function successAnimation(response) {
			if (response != null) {
				$('#iconAlerteFond').attr('src',''); //permet de ne pas afficher icone par defaut pendant le chagement de l'animation
				$('#iconAlerteFond').attr('src',app.animationUrl + type[index-1]);
				$('#mainFrameMessageAlerte').click(function(e){
					$(this).hide();
					return false;
				});				
				$('#rowMessageAlerte').show();
				$('#mainFrameMessageAlerte').show();
				$('#iconAlerteFond').addClass("iconAlerteFondAnimation");	
				app.animationLaunched = 1;// Ne se lance qu'une fois.			
				return;
			}
		}

		function errorAnimation(response) {

			if (index>type.length-1) return;

			$.ajax({
				async: true,
				url: app.animationUrl + type[index++],
				success: successAnimation
			}).error(errorAnimation,index);			
		}
		
		$.ajax({
			async: true,
			url: app.animationUrl + type[index++],
			success: successAnimation
		}).error(errorAnimation,index);
	},
	//--------------------------------------//
	// displayAlert
	//--------------------------------------//
	displayAlert:function(iconAlerte, texte, logoPath, backgroundColor, alertDejaVu) {
		
		var mainFrameMessageAlerte = $('#mainFrameMessageAlerte');
		if (logoPath != "")
					iconAlerte.attr('src',logoPath).attr('onerror',"this.onerror=null;this.src='img/alerte.png';");
				
		var rowMessageAlerte = $("#rowMessageAlerte");
		rowMessageAlerte.css("background-color",backgroundColor);
		rowMessageAlerte.css("color",getContrastYIQ(backgroundColor));

		$('#iconAlerteFond').removeClass("iconAlerteFondAnimation");
		
		rowMessageAlerte.children("span").html(texte);
		
		rowMessageAlerte.children('span').find('a').click(function(e){
			e.preventDefault();
			window.open($(this).attr('href'), '_system');
			return false;
		});
		
		iconAlerte.unbind('click');
		iconAlerte.click(function(e)
		{
			mainFrameMessageAlerte.toggle();
			return false;					
		});
		
		mainFrameMessageAlerte.unbind('click');
		mainFrameMessageAlerte.click(function(e){
			$(this).hide();
			return false;
		});
		
		iconAlerte.show();
		
		if (!alertDejaVu) {
			mainFrameMessageAlerte.show();
		}
		else {
			mainFrameMessageAlerte.hide();
		}
	},
	//--------------------------------------//
	// rateMe
	//--------------------------------------//
	rateMe:function() {
		if (window.localStorage.getItem('compteur') == 50) {
				navigator.notification.confirm(
				lang.appMobile.rateMe,
				function(button) {
					// yes = 1, no = 2, later = 3
					if (button == '1') {    // Rate Now
						if (device.platform.toUpperCase() == 'IOS') {
							window.open('itms-apps://itunes.apple.com/fr/app/domainsicle-domain-name-search/idid966169282?ls=1&mt=8'); // or itms://
						} else if (device.platform.toUpperCase() == 'ANDROID') {
							window.open('https://play.google.com/store/apps/details?id=org.lametro.metromobilite&hl=fr');
						} else if (device.platform.toUpperCase() == 'WINDOWS'){
							window.open('https://www.microsoft.com/fr-fr/store/apps/metromobilite/9nblggh1jp80');
						}
						window.localStorage.setItem('compteur',9999);
					} else if (button == '2') { // Later
						window.localStorage.setItem('compteur',1);
					} else if (button == '3') { // No
						window.localStorage.setItem('compteur',9999);
					}
				}, lang.popup.maintenant, [lang.popup.maintenant,lang.popup.plusTard,lang.popup.non]);
		}
	},
	//--------------------------------------//
	// buildMenu
	//--------------------------------------//
	buildMenu:function() {
		$('#mainNav .nav > li > a').each(function(){
			var idMenu = $(this).attr('id');
			var id = idMenu.substr(0,idMenu.length-1);
			$('#'+idMenu+' .text').text($('#'+id+' span').text());
			$('#'+idMenu+' .menuLogo').append($('#'+id+' svg').clone());
		});
	},
	//--------------------------------------//
	// Bind Event Listeners
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	//--------------------------------------//
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('activated', this.onActivated, false);		
		document.addEventListener('offline', this.onOffline, false);
		document.addEventListener('online', this.onOnline, false);
		document.addEventListener('resume', this.onDeviceResume, false);
    },
	//--------------------------------------//
	// onOffline
	//--------------------------------------//
	onOffline: function() {
		//if (app.onOnlineStatus == 3) return;
		
		app.afficheLien($('#rowAccueil'),'');
		//if (app.onOnlineStatus != 2) { //Sinon apparait 2 fois
			app.onOnlineStatus = 2;
			app.displayAlert($('#iconAlerte'), lang.alert[3], "img/network.png", "#F00",false);
			//alert(lang.alert[3]);
		//}
	},
	//--------------------------------------//
	// onOnline
	//--------------------------------------//
	onOnline: function() { //Attention onOnline non reçu sous WP8 sauf au démarrage
	
		//if (app.onOnlineStatus == 3) return;
		
		if (app.onOnlineStatus == 0) {
			app.onOnlineStatus = 1;
			return;
		}
		if (app.onOnlineStatus != 1) { //Sinon apparait 2 fois
			app.launchAlert();
			clearTimeout(idTimeoutPP);
			idTimeoutPP = false;
			clearTimeout(idTimeoutPKG);
			idTimeoutPKG = false;
			clearTimeout(idTimeoutEvtsTC);
			idTimeoutEvtsTC = false;
			clearTimeout(idTimeoutFav);
			idTimeoutFav = false;
			app.cptLignesPasChargees=5,
			app.initTraffic();
			app.updateIndicesAtmo();
			app.initNotif();			
			chargeLignes(function(){},function(){});			
		}
	},
	//--------------------------------------//
	// onDeviceResume
	//--------------------------------------//
	onDeviceResume: function() {
	},
	//--------------------------------------//
	// onSuccessGetPicture
	//--------------------------------------//
	onSuccessGetPicture : function(imageURI) {
			app.photoURI = imageURI;
			$('#divAlerte').show();
		},
	//--------------------------------------//
	// onFailGetPicture
	//--------------------------------------//
	onFailGetPicture : function(message) {
			console.log('app.GetPicture failed because: ' + message);
			app.photoURI = null;
			$('#divAlerte').show();
	},
		
	//--------------------------------------//
	// onActivated : WP only
	//--------------------------------------//
    onActivated: function(data) {
		console.log('onActivated');				
		if (data && data.args) app.displayScreen(data.args); 
	},
		
	//--------------------------------------//
	// onDeviceReady
	//--------------------------------------//
    onDeviceReady: function() {
        
        console.log('onDeviceReady');
    
        /*if (window.cordova.logger) {
                window.cordova.logger.__onDeviceReady();
            }*/
        
		// reset des favoris
		//window.localStorage.setItem('lignesFavorites',JSON.stringify({}));
		//window.localStorage.setItem('parkingsFavoris',JSON.stringify({}));
		//window.localStorage.setItem('camFavoris',JSON.stringify({}));
		//window.localStorage.setItem('itiFavoris',JSON.stringify({}));

	
		if (navigator.userAgent.match(/IEMobile|/)) {
			var style = "<style type='text/css'>@-ms-viewport{width:80%!important}</style>";
			$(style).appendTo("head");
		}

       	if (device.platform.toUpperCase() == 'IOS' || device.platform.toUpperCase() == 'WINDOWS'){
    		StatusBar.hide();
    	}
		
		app.initNotif();

		/*if (device.platform.toUpperCase() != 'WINDOWS') {
				screen.lockOrientation('portrait-primary');
		}*/
		
		chargeLignes(function(){},function(){});

		app.updateIndicesAtmo();
		
		$( document ).on( "evtSourceChargee", {}, function( event, type ) {
			
			if ($('#traffic_link').is(':visible')) {
				if (type=='trr') { 
						updateDynTrr('trr','mapTraffic');
				}
				else if (type=='PAR') updateDyn('PAR','mapTraffic','PAR',sourcePoints);
				else if (type=='PKG') updateDyn('PKG','mapTraffic','PKG',sourcePoints);
			} else {
				if (type=='PAR') updateDyn('PAR','mapProxi','PAR',sourcePoints);
				else if (type=='PKG') updateDyn('PKG','mapProxi','PKG',sourcePoints);
			}
			
		});

		$(document).on( "evtLignesChargees", {}, function( event, data ) {
			try {
				app.initHoraires();
				app.launchAlert();
				return;
			} catch(e) {
				console.log('evtLignesChargees, catch : ' + e.msg + ' : ' + e.lineNumber);
			}
		});

		$(document).on( "evtLignesPasChargees", {}, function( event, data ) {
			if (app.cptLignesPasChargees==0) {
				app.displayAlert($('#iconAlerte'), lang.alert[3], "img/network.png", "#F00",false);				
			} else {
				chargeLignes(function(){},function(){}); //On retente,
			}
			app.cptLignesPasChargees--;
		});
		
		$(document).on( "evtParkingsCharges", {}, function( event, data ) {
			try {
				app.initParkings();
				return;
			} catch(e) {
				console.log('evtParkingsCharges, catch : ' + e.msg + ' : ' + e.lineNumber);
			}
		});
		
		$(document).on( "evtPARupdated evtPKGupdated", {}, function( event, data ) {
			try {
				app.updateParkings(data);
				return;
			} catch(e) {
				console.log('evtPARupdated or evtPKGupdated, catch');
			}
		});	
		
		document.addEventListener("backbutton", app.onBackKeyDown, false);
		
		$('#rowAccueil,#mainNav').on('click','#proxi_link,#proxi_link2',function(e){
			app.afficheLien($('#rowMapProxi'),lang.appMobile.autour);
			app.initProxi();
			trackPiwik("Application Mobile : Autour de moi");
		});
		$('#rowAccueil,#mainNav').on('click','#iti_link,#iti_link2',function(e){
			app.afficheLien($('#rowMapIti'),lang.appMobile.itineraire);
			trackPiwik("Application Mobile : Itineraire");
			app.initIti();
		});
		$('#rowAccueil,#mainNav').on('click','#infoTrafic_link,#infoTrafic_link2',function(e){
			app.afficheLien($('#rowAlertes'), lang.appMobile.infoTrafic);
			urlParams.heure=new Date();
			app.updateIndicesDeplacements();
			app.updateEvtsTC();
			trackPiwik("Application Mobile : Info trafic");
		});
		$('#rowAccueil,#mainNav').on('click','#horaires_link,#horaires_link2',function(e){
			app.afficheLien($('#rowHoraires'),lang.appMobile.horaires);
			app.updateEvtsTC();
			trackPiwik("Application Mobile : Horaires");
		});
		$('#rowAccueil,#mainNav').on('click','#notif_link,#notif_link2',function(e){
			app.showNotifs();
			trackPiwik("Application Mobile : Mon compte");
        });
		$('#rowAccueil,#mainNav').on('click','#atmo_link,#atmo_link2',function(e){
			app.showAtmo();
			trackPiwik("Application Mobile : Atmo");
        });
		$('#rowAccueil,#mainNav').on('click','#fav_link,#fav_link2',function(e){
			app.afficheLien($('#rowFavoris'),lang.appMobile.favoris);
			app.updateEvtsTC();
			listeFavoris.afficheCamFavoris();
			listeFavoris.afficheLignesFavorites();
			listeFavoris.afficheParkingFavoris();
			listeFavoris.afficheItiFavoris();
			app.pagePrecente = "#rowFavoris";
			trackPiwik("Application Mobile : Favoris");
        });
		$('#mainNav').on('click','#param_link2',function(e){
			loginSIV.updateNotificationText(true);
			app.afficheLien($('#rowParam'),lang.appMobile.parametres);
			trackPiwik("Application Mobile : Paramètre");
        });
		$('#mainNav').on('click','#about_link2',function(e){
			$('#versionAbout').text(versionCode);
			app.afficheLien($('#rowAbout'),lang.appMobile.aPropos);
			trackPiwik("Application Mobile : A Propos");
        });
		$('#mainNav').on('click','#alerte_link2',function(e){
			app.afficheLien($('#divAlerte'),lang.appMobile.alerteSignalement);
			trackPiwik("Application Mobile : Signalement Alerte");
        });
		
		$('#mainNav').on('click','#proxi_link2,#iti_link2,#infoTrafic_link2,#atmo_link2,#notif_link2,#horaires_link2,#fav_link2,#param_link2,#about_link2,#alerte_link2',function(e){
			$('#menuNav').collapse('hide');
		});
				
		$('#mainNav').on('click','#buttonMenuNav',function(e){
			var bvisible = $('#rowAccueil').is(':visible');
			(bvisible?$('#proxi_link2').hide():$('#proxi_link2').show());
			(bvisible?$('#iti_link2').hide():$('#iti_link2').show());
			(bvisible?$('#infoTrafic_link2').hide():$('#infoTrafic_link2').show());
			(bvisible?$('#atmo_link2').hide():$('#atmo_link2').show());
			(bvisible?$('#horaires_link2').hide():$('#horaires_link2').show());
			(bvisible?$('#fav_link2').hide():$('#fav_link2').show());
		});
		// ouvre les a href dans le navigateur par defaut du tel
		$('#mainApp').on('click','a[target=_blank]', function(e) {
			e.preventDefault();
			window.open($(this).attr('href'), '_system');
			return false;
		});
		//lien des alertes
		$('#rowAlertes').on('click','#traffic_link',function(e){
			$('#contenus > div').hide();
			$('#rowMapTraffic').show();
			$('#rowAlertes > ul > li.active').removeClass('active');
			$('#traffic_link').addClass('active');
			app.initTraffic();
		});
		$('#rowAlertes').on('click','#tc_link',function(e){
			if ($("#popupMap .PopupDetails-Close").length) $("#popupMap .PopupDetails-Close").trigger("click");
			$('#contenus > div').hide();
			$('#divEvtsTC').show();
			$('#rowAlertes > ul > li.active').removeClass('active');
			$('#tc_link').addClass('active');
		});
		$('#rowAlertes').on('click','#parking_link',function(e){
			if ($("#popupMap .PopupDetails-Close").length) $("#popupMap .PopupDetails-Close").trigger("click");
			$('#contenus > div').hide();
			if (!dataParking)
				chargeParkings();
			else {
				$('#rowParking').show();
				app.pagePrecente = '#rowParking';
				updatePKG("evtPKGupdated");
				updatePAR("evtPARupdated");				
			}
			
			$('#rowAlertes > ul > li.active').removeClass('active');
			$('#parking_link').addClass('active');			
		});
		$('#rowHoraires').on('click','#horairesStatics_link',function(e){
			var code = $('#ppOnglets .ligne.active').attr('data-code');
			app.prochainsPassagesId='#mainViewStatique ';
			$('#mainView').hide();
			$('#mainViewStatique').show();
			$('#prochainsPassages_link.active').removeClass('active');
			$('#horairesStatics_link').addClass('active');
			if (code) showLigne(code,app.prochainsPassagesId);
			trackPiwik("Application Mobile : Fiches Horaires");
		});
		$('#rowHoraires').on('click','#prochainsPassages_link',function(e){
			var code = $('#horairesOnglets .ligne.active').attr('data-code');
			app.prochainsPassagesId='#mainView ';
			$('#mainView').show();
			$('#mainViewStatique').hide();
			$('#horairesStatics_link.active').removeClass('active');
			$('#prochainsPassages_link').addClass('active');
			if (code) showLigne(code,app.prochainsPassagesId);
			trackPiwik("Application Mobile : Horaires");
		});
		//liens des notifs
		$('#rowNotif').on('click','#push_link',function(e){
			$('#contenusNotifs > div').hide();
			$('#listeNotifs').show();
			$('#rowNotif .active').removeClass('active');
			$('#push_link').addClass('active');
		});
		$('#rowNotif').on('click','#conf_link',function(e){
			$('#contenusNotifs > div').hide();
			$('#listeTrajets').show();
			$('#rowNotif .active').removeClass('active');
			$('#conf_link').addClass('active');
			listeNotifs.getTrajets();
		});
		$('#rowNotif').on('click','#changeUtil',function(e){
			window.localStorage.setItem('registered','');
			window.localStorage.setItem('user','');
			window.localStorage.setItem('notifs',JSON.stringify({}));
			window.localStorage.setItem('notificationStatus','notificationOff');
			
			app.showNotifs();
		});
		$('#timesyncEvtsTC').click(function(e) {
			e.preventDefault();
			$('#timesyncEvtsTC').hide();
			urlParams.heure=new Date();
			app.updateEvtsTC();
			app.updateIndicesDeplacements();			
			return false; //évite le rechargement de la page.
		});

		$('#rowAtmo').on('click','#rowAtmoButton', function(){
			app.updateIndicesAtmo();
		});
		
		$('#mainApp').on('click','#notificationOff',function(e){
			window.localStorage.setItem('notificationStatus','notificationOff');
			loginSIV.updateNotificationText(true);
		});
		$('#mainApp').on('click','#notificationVibrates',function(e){
			window.localStorage.setItem('notificationStatus','notificationVibrates');
			loginSIV.updateNotificationText(true);
		});
		$('#mainApp').on('click','#notificationOn',function(e){
			window.localStorage.setItem('notificationStatus','notificationOn');
			loginSIV.updateNotificationText(true);
			});
		$('#togglePanelsResultats').click(toggleResultats);
		
		$('#navbarPrev').click(app.onBackKeyDown);
		
		$('#rowParam #langageSelector').change(function(){
			
			langage=$('#rowParam #langageSelector').val();
			window.localStorage.setItem('langage',langage);
			
			$.getScript("js/" + (langage=='fr'?'':langage + "/" )  + langage + ".js", function()
			{
				$('#rowParam #langageSelector').val(langage);
				$.getScript("js/translate.js",function() {translate();} );
			});
		});
		
		$('#rowParam #horairesSelector').change(function(){
			horairestries=$('#rowParam #horairesSelector').val();
			window.localStorage.setItem('horairestries',horairestries);
		});
		
		$('#rowParam #startSelector').change(function(){
			startselector=$('#rowParam #startSelector').val();
			window.localStorage.setItem('startselector',startselector);
		});
		
		
		/************************MODE PREPROD**********************/
		
		$('#preprod').click(function(e){
			$('#preprod').hide();
			//On echange les repertoires pour passer en standard
			var switchpath = url.hostnameData;
			url.hostnameData = url.hostnameDataTest;
			url.hostnameDataTest = switchpath;
			app.animationUrl = app.animationUrl.replace('preprod.','www.');
			console.log('Bascule en mode prod');
			return false;
		});
		
		// how many milliseconds is a long press?
		var longpress = 1000;
		// holds the start time
		var start;
	
		$( "#rowAbout" ).on( 'touchstart', function( e ) {
			start = new Date().getTime();
		} );

		$( "#rowAbout" ).on( 'touchcancel', function( e ) {
			start = 0;
		} );

		$( "#rowAbout" ).on( 'touchend', function( e ) {
			if ( new Date().getTime() >= ( start + longpress )  ) {
			   $('#preprod').show();	
				//On echange les repertoires pour passer en test
				var switchpath = url.hostnameData;
				url.hostnameData = url.hostnameDataTest;
				url.hostnameDataTest = switchpath;
				app.animationUrl = app.animationUrl.replace('www.','preprod.');
				console.log('Bascule en mode prod');
			}
		} );
		
		/**********************************************/
		
		listeFavoris.initLignesFavoris();
		listeFavoris.initParkingFavoris();
		
		cordova.plugins.email.isAvailable(
			function (isAvailable) {
				if (!isAvailable) {
					$('#alerte_link2').hide();
				}
			}
		);
		$('#alertePhoto').click(function(e){
				app.photoURI = null;
				navigator.camera.cleanup();
				navigator.camera.getPicture(app.onSuccessGetPicture, app.onFailGetPicture, {destinationType: Camera.DestinationType.FILE_URI }); //quality: 10, -> probleme plantage android ? et/ou mise a jour SDK ?
				
		});
				
		$('#alerteMail').click(function(e){
		
			var messageText = "";
			
			//Ajout du type de l'évènement
			if ($('#alerteTypeAccident').prop('checked')) messageText = "Evènement de type accident signalé.<br><br>";
			if ($('#alerteTypeBouchon').prop('checked')) messageText = "Evènement de type bouchon signalé.<br><br>";
			if ($('#alerteTypeObstacle').prop('checked')) messageText = "Evènement de type obstacle signalé.<br><br>";
			if ($('#alerteTypeAutre').prop('checked')) messageText = "Autre type d'évènement signalé.<br><br>";
			if ($('#alerteTypeAutre').prop('checked')) messageText = "Autre type d'évènement signalé.<br><br>";
			
			//Ajout de la position de l'évènement
			if (app.position && $('#alertePosition > input').prop('checked')) { 
				if(device.platform.toUpperCase() == "WINDOWS") {
					messageText += 'Position : \n' + 'http://www.openstreetmap.org/#map=19/' + app.position.coords.latitude + '/' + app.position.coords.longitude + '\n';
				} else {
					messageText += 'Position : \n' + '<a href="http://www.openstreetmap.org/#map=19/' + app.position.coords.latitude + '/' + app.position.coords.longitude + '" target="_blank">' + app.position.coords.latitude + ',' + app.position.coords.longitude + '</a><br><br>';
				}
			}

			//Ajout du message utilisateur lié à l'évènement
			messageText += $('#alerteMessage > textarea').val() + "<br><br>";
			/*if(device.platform.toUpperCase() == 'WINDOWS') {
				messageText = messageText.replace(/<br>/g,'\n');
			}*/
			if (messageText != "") {
				if (app.photoURI) {
					cordova.plugins.email.open({
						to:      'contact@metromobilite.fr',
						subject: 'Alerte utilisateur',
						isHtml:  true,
						attachments:app.photoURI,
						body:    messageText
					},function(){ navigator.camera.cleanup(); } );
				} else {
					cordova.plugins.email.open({
						to:      'contact@metromobilite.fr',
						subject: 'Alerte utilisateur',
						isHtml:  true,
						body:    messageText
						});
				}
				messageText = "";
				app.photoURI = null;
				
				$('#alerteMessage > textarea').val("");
				$('#alertePosition > input').prop( "checked", false );
				$('#alerteTypeAccident').prop( "checked", false );
				$('#alerteTypeBouchon').prop( "checked", false );
				$('#alerteTypeObstacle').prop( "checked", false );
				$('#alerteTypeAutre').prop( "checked", false );
			} else {
				alert(lang.popup.renseigner);
			}
		});

		$('#alerteMailAbout').click(function(e){
			cordova.plugins.email.open({
				to: 'contact@metromobilite.fr',
				subject: 'Contact utilisateur',
				isHtml:  true
				});
		});
		
		$('#alerteNoPosition').click(function(e){
			app.localizeProxi(false);
		});

		function clickDepArrPA(depOuArr) {
			var featureLayer = getLayer('mapProxi',$('#popupMap .icones').attr('data-featureLayer'));
			var featureId = $('#popupMap .icones').attr('data-featureId');
			var feature = featureLayer.getSource().getFeatureById(featureId);
			
			if(depOuArr=='dep') {
				var coordDeg = ol.proj.transform(feature.getGeometry().getCoordinates(),"EPSG:3857" , "EPSG:4326");
				var lonlat = coordDeg[1]+','+coordDeg[0];
				urlParams.lonlatDep=lonlat;
				urlParams.dep=feature.get('LIBELLE');
			} else if(depOuArr=='arr') {
				var coordDeg = ol.proj.transform(feature.getGeometry().getCoordinates(),"EPSG:3857" , "EPSG:4326");
				var lonlat = coordDeg[1]+','+coordDeg[0];
				urlParams.lonlatArr=lonlat
				urlParams.arr=feature.get('LIBELLE');
			}
			$('#iti_link').trigger('click');			
			
			setParamsForm();			
		}
		$('#popupMap').on('click','.dep',function() {clickDepArrPA('dep');});
		$('#popupMap').on('click','.arr',function() {clickDepArrPA('arr');});

		function swipeStatus(event, phase, direction, distance, fingerCount) {
			
			if ((device.platform.toUpperCase() == 'IOS') || (device.platform.toUpperCase() == 'ANDROID')) {
				down = 'touchstart';
				up = 'touchend';
			} else {
				down = 'mousedown';
				up = 'mouseup';
			}
				
			if (phase == "end") {  //Ne marche plus avec la derniere version de Cordova septembre 2016 -> re-marche février 2017
			//if (distance > 30 || fingerCount > 60) { 

			var notif = $(event.target).closest('.notifs, .fav');
			
			 if (typeof(notif.attr('data-id'))=='undefined') {
				notif.attr('data-id','notifs');
			 }
			
			if (direction == "right") {
					setTimeout(function(){
						if (notif.find('.modaleBox').length>0) return;
						var modalBox="";
						if (notif.hasClass('notifs')) { //Swipe notifications
							modalBox = '<div class="modaleBox ' + (direction == 'right'?'right':'left') + ' notifs" id="' + notif.attr('data-id').replace(':','') + '"><div class="button suppAll"><span class="glyphicon glyphicon-trash"></span><span>'+ lang.appMobile.suppTout +'</span></div><div class="button supp"><span class="glyphicon glyphicon-trash"></span><span>'+ lang.appMobile.supp +'</span></div><div class="button cancel"><span class="glyphicon glyphicon-remove"></span><span>'+ lang.appMobile.annuler +'</span></div></div>';
						}
						else { //Swipe favoris
							modalBox = '<div class="modaleBox ' + (direction == 'right'?'right':'left') + ' fav"  id="' + notif.attr('data-id').replace(':','') + '"><div class="button supp"><span class="glyphicon glyphicon-trash"></span><span>'+ lang.appMobile.supp +'</span></div><div class="button ok"><span class="glyphicon glyphicon-ok"></span><span>'+ lang.appMobile.affiche +'</span></div><div class="button cancel"><span class="glyphicon glyphicon-remove"></span><span>'+ lang.appMobile.annuler +'</span></div></div>';
						}

						if (direction == "right") {
							notif.append(modalBox);
						} else {
							notif.prepend(modalBox);
						}
						
						notif.find(".suppAll").on( down, function(){ //Efface toutes notif ou le fav
						//$('.suppAll').click(function(){ //Efface toutes notif ou le fav
							if (notif.hasClass('notifs')) {
								listeNotifs.removeAllNotifs();
							}
							$('#rowFavorisLigne #' + notif.attr('id').replace(':','') + ".modaleBox").remove();
						});
						
						notif.find(".supp").on( down, function(){ //Efface la notif ou le fav
						//$('.supp').click(function(){ //Efface la notif ou le fav
							if (notif.hasClass('notifs')) {//Notifs
								listeNotifs.removeNotif(notif.attr('id'));
							} else if (notif.hasClass('fav') && (typeof(notif.attr('data-type')) == 'undefined')) {//favoris ligne ou camera
								var code = notif.attr('data-id').split(',')[0];
								var ids = notif.attr('data-id').split(',')[1];
								var parentId = notif.parent().attr('id');
								if (parentId == "rowFavorisLigne")
									listeFavoris.removeLigne(code,ids);
								else if (parentId == "rowFavorisCam")	
									listeFavoris.removeCam(code);
								else { //rowFavorisIti {
									listeFavoris.removeIti(code);
									unSelectItiLogoFav();
								}
							} else if (notif.hasClass('fav') && (typeof(notif.attr('data-type')) != 'undefined')) {//favoris parking
								listeFavoris.removeParking(notif.attr('data-id'));
								$('#mainApp > #rowAlertes > #contenus > #rowParking').find('tr[data-id='+notif.attr('data-id')+'] div').removeClass('favori').addClass('favori-empty');
							}
							$('#rowFavorisLigne #' + notif.attr('id').replace(':','') + ".modaleBox").remove();
							return false;
						});
						notif.find(".ok").on( down, function(){ //Afficher écran suivant
							$('#rowFavorisLigne #' + notif.attr('id').replace(':','') + ".modaleBox").remove();
							//if (attente) return false;
							if ((typeof(notif.attr('data-type')) == 'undefined')) {
								if (notif.parent().attr('id')=="rowFavorisCam") {
									var fav = JSON.parse(window.localStorage.getItem('camFavorites'));
									listeFavoris.showCamFav(notif.attr('data-id'));
								} else if (notif.parent().attr('id')=="rowFavorisIti") {
									var fav = JSON.parse(window.localStorage.getItem('itiFavoris'));
									listeFavoris.showItiFav(notif.attr('data-id'));
								}
								else {
									var fav = JSON.parse(window.localStorage.getItem('lignesFavorites'));
									listeFavoris.showLigneFav(fav[notif.attr('data-id')].codeLigne,fav[notif.attr('data-id')].idsArrets,fav[notif.attr('data-id')].nom);
								}
							} else
							{
								listeFavoris.showParkingFav();
							}
							return false;
						});
						
						notif.find(".cancel").on( down, function(){ //Annuler
							notif.css("transform", "translate(0%,0)");
							$('#rowFavorisLigne #' + notif.attr('id').replace(':','') + ".modaleBox").remove();
							return false;
						});
						return false;
					},500);
					if (direction == "right") {
						notif.css("transform", "translate(75%,0)");
					} else  {
						notif.css("transform", "translate(-75%,0)");
					}
				}
			}
		};
		var swipeOptions = {
			triggerOnTouchEnd: false,
			swipeStatus: swipeStatus,
			allowPageScroll: "vertical",
			preventDefaultEvents: false,
			threshold: 150
		};		
		$("#rowFavoris #rowFavorisLigne").swipe(swipeOptions);
		$("#rowFavoris #rowFavorisParking").swipe(swipeOptions);
		$("#rowFavoris #rowFavorisCam").swipe(swipeOptions);
		$("#rowFavoris #rowFavorisIti").swipe(swipeOptions);
		$("#listeNotifs").swipe(swipeOptions);
		
		//pour forcer android 4.2.2 a redessiner et rendre les titres
		$('#rowAccueil').hide();
		$('#rowFavoris').show();
		$('#rowFavoris').hide();
		$('#rowAccueil').show();
		
		var launchArgs = cordova.require('cordova/platform').activationContext;
		if (launchArgs && launchArgs.args) app.displayScreen(launchArgs.args); 
		
		app.rateMe();
		
		switch (startselector) {
			case("start-autour"):
				$('#proxi_link').trigger('click');
			break;
			case("start-horaires"):
				$('#horaires_link').trigger('click');
			break;
			case("start-itineraire"):
				$('#iti_link').trigger('click');
			break;
			case("start-tc"):
				app.showAlertesTC();
			break;
			case("start-routier"):
				app.showAlertesTR();
				app.updateEvtsTC();
			break;
			case("start-parking"):
				app.showAlertesParking();
			break;
			case("start-atmo"):
				app.showAtmo();
			break;
			case("start-favoris"):
				$('#fav_link').trigger('click');				
			break;				
			
			default: 
				//rien a faire
		}

		
		
	},
	//--------------------------------------//
	// showNotifs
	//--------------------------------------//
	showNotifs:function(){
		if (!app.bNotificationAutorisee) {
			alert("Vous n'avez pas autorisé cette application à recevoir des notifications. Vous ne pourrez pas en recevoir");
		}
		// si pas enregistré sur le siv on demande un login
		//console.log('registered : '+window.localStorage.getItem('registered'));
		
		//if (false) { //pour test !!!!
		if (window.localStorage.getItem('registered')=='') {
			app.afficheLien($('#rowRegisterNotif'),lang.appMobile.monCompte,'glyphicon-cog',function(){
				app.pageCourante = '#extSIV';
				app.refInAppBrowser = window.open(serverUrl + '/', '_blank', 'location=no');//, 'random_string','location=no'
			});
		} else {
			app.afficheLien($('#rowNotif'),lang.appMobile.monCompte,'glyphicon-cog',function(){
				app.pageCourante = '#extSIV';
				app.refInAppBrowser = window.open(serverUrl + '/', '_blank', 'location=no');//, 'random_string','location=no'
			});
			listeNotifs.afficheNotifs();
		}
	},
	//--------------------------------------//
	// showAtmo
	//--------------------------------------//
	showAtmo:function(){
		app.afficheLien($('#rowAtmo'),lang.appMobile.indiceAtmo);
	},
	//--------------------------------------//
	// showAtmoCarto
	//--------------------------------------//
	showAtmoCarto:function(url_carte){
		app.afficheLien($('#rowAtmoCarto'),lang.appMobile.cartographieAtmo);
		app.initCartoAtmo(url_carte);
	},
	//--------------------------------------//
	// showAlertesTC
	//--------------------------------------//
	showAlertesTC:function(){
			app.afficheLien($('#rowAlertes'),lang.appMobile.infoTrafic);
			urlParams.heure=new Date();
			app.updateIndicesDeplacements();
			app.updateEvtsTC();
			$('#contenus > div').hide();
			$('#divEvtsTC').show();
			$('#rowAlertes .active').removeClass('active');
			$('#tc_link').addClass('active');
			trackPiwik("Application Mobile : Info Trafic TC");
	},
	//--------------------------------------//
	// showAlertesTR
	//--------------------------------------//
	showAlertesTR:function(){
			app.afficheLien($('#rowAlertes'),lang.appMobile.infoTrafic);
			urlParams.heure=new Date();
			app.updateIndicesDeplacements();
			$('#contenus > div').hide();
			$('#rowMapTraffic').show();
			$('#rowAlertes .active').removeClass('active');
			$('#traffic_link').addClass('active');
			app.initTraffic()
			trackPiwik("Application Mobile : Info Trafic TR");
	},
	//--------------------------------------//
	// showAlertesParking
	//--------------------------------------//
	showAlertesParking:function(){
			app.afficheLien($('#rowAlertes'),lang.appMobile.infoTrafic);
			urlParams.heure=new Date();
			chargeParkings();
			app.updateIndicesDeplacements();
			$('#contenus > div').hide();
			$('#rowParking').show();
			$('#rowAlertes .active').removeClass('active');
			$('#parking_link').addClass('active');			
			trackPiwik("Application Mobile : Info Trafic parking");
	},
	//--------------------------------------//
	// afficheLien
	//--------------------------------------//
    afficheLien: function (e,titre,icon,icon_callback){
		$('#mainApp > .row').hide();
		$('#popupMap').hide();
		$('#iti,#itiDetails').hide();
        $('#titrePage').text(titre);
		
		if (e.selector=="#rowAccueil") {
			$('body').css({"background-color":"#000"});
			$('#mainNav .navbar-brand').hide();
			$('#mainNav .titreLogo').show();
			app.launchAlert();
		} else {
			$('body').css({"background-color":"#E4E4E4"});
			$('#mainNav .navbar-brand').show();
			$('#mainNav .titreLogo').hide();
		}
		
		//$('body > nav').toggle(e.selector!="#rowAccueil");
        e.show();
		app.pageCourante = e.selector;
		if(!icon) {
			$('#icon_link').addClass('hidden');
		} else {
			$('#icon_link span').attr('className','glyphicon '+icon);
			$('#icon_link').html('<span class="glyphicon '+icon+'"></span>');
			$('#icon_link').removeClass('hidden');
			$('#icon_link').unbind('click').click(function(){icon_callback();});
		}
    },
	//--------------------------------------//
	// onBackKeyDown
	//--------------------------------------//
	onBackKeyDown: function() {	
		switch (app.pageCourante) {
			case "#rowAccueil":
				if ($('#mainFrameMessageAlerte').is(":visible"))
						$('#mainFrameMessageAlerte').hide();
				else
					navigator.app.exitApp();
				break;
			case "#rowMapIti":
				if($('#itiParams .panel-body').is(':visible')) {
					if (app.pagePrecente == "#rowAlertes") { 
						app.pagePrecente = "";
						app.afficheLien($('#rowAlertes'), lang.appMobile.infoTrafic);
					} if (app.pagePrecente == "#rowFavoris") {
						app.pagePrecente == "";
						$('#fav_link').trigger('click');
					}
					else {
						app.afficheLien($('#rowAccueil'),''); //sauf cette ligne						
					}
				} else if ($('#iti').is(':visible')){
					$('#itiParams .panel-body, #iti').toggle();
				} else if($('#itiDetails').is(':visible')){
					$('#iti, #itiDetails').toggle();
				} /*else if($('#mapIti').is(':visible')){
					$('#iti, #mapIti').toggle();
				}*/ 					
				else {
					$('#itiDetails').toggle();
				}
				
				break;
			case "#rowHoraires":
				if (app.pagePrecente == "#rowFavoris") {
					app.pagePrecente == "";
					$('#fav_link').trigger('click');
					break;
				}
				if($('#liste').is(':visible')) {
					app.afficheLien($('#rowAccueil'),'');
				} else {
					togglePanneau(true);
				}
				break;
			case "#extSIV":
				app.refInAppBrowser.close();
				app.afficheLien($('#rowAccueil'),'');
				break;
			case "#rowAtmoCarto":
				app.showAtmo();
				break;
			case "#rowAlertes":
				if (app.pagePrecente == "#rowFavoris") {
					app.pagePrecente = "";
					$('#fav_link').trigger('click');
					break;
				} //sinon default
			case "#rowAtmo":
			case "#rowMapProxi":
			case "#rowMapTraffic":
				$("#popupMap .PopupDetails-Close").trigger("click");
				// Add by Diallo Elhadj
			   if ($('#arr').attr('data-lonlat')!="0,0"){
				app.pagePrecente ="";
			   }
				app.afficheLien($('#rowAccueil'),'');
				break;
			default:
				app.afficheLien($('#rowAccueil'),'');
				app.pagePrecente = "";
		}
		fct_attente_horaires(false);
		if (app.watchID != "") { 
			navigator.geolocation.clearWatch(app.watchID);
			app.watchID = "";
		}			
	    
	},
	//--------------------------------------//
	// initHoraires
	//--------------------------------------//
    initHoraires: function(){
        urlParams.horairestempsreel =true;
        $.support.cors = true;
        initPageHoraires();
    },	

//--------------------------------------//
// triParkings
// Tri les parkings
//--------------------------------------//
	triParkings: function(){
	$tablePar  =$("#rowParking #ParcRows");
	$tablePkg  =$("#rowParking #PkgRows");
	$rowsPar  =$(".ligneParking" ,$tablePar);
	$rowsPkg  =$(".ligneParking" ,$tablePkg);
    $rowsPar.sort(function(a, b) {
		var keyA = $('.nomParking',a).text(); //Tri par libelle
		var keyB = $('.nomParking',b).text();
		return (keyA > keyB) ? 1 : -1;  // A bigger than B, sorting ascending
	});
    $rowsPar.each(function(index, row){
		$tablePar.append(row);                  // append rows after sort
    });
	/****************************************************/
	$rowsPkg.sort(function(a, b) {
		var keyA = $('.nomParking',a).text(); //Tri par libelle
		var keyB = $('.nomParking',b).text();
		return (keyA > keyB) ? 1 : -1;  // A bigger than B, sorting ascending
	});

    $rowsPkg.each(function(index, row){
		$tablePkg.append(row);                  // append rows after sort
    });
	},	
	//--------------------------------------//
	// initParkings
	//--------------------------------------//
	//  modified by elhadj diallo
    initParkings: function(){
		try {
			if (!dataParking) return;
			//recuperer le modele du li pour 1 parking
			var modelePkg = $('#modeleParking');
			dataParking.features.forEach(function(e) {
				if(e.properties.type == 'PKG') 
				{
						//Parking -- cloner le modele
						var liPkg = modelePkg.find('.ligneParking').clone();
						//modifier le liPkg
						liPkg.attr('id',e.properties.id);
						liPkg.attr('data-lonlat',e.geometry.coordinates.reverse().join(','));
						liPkg.find('.nomParking').text(e.properties.LIBELLE);
						var monFavori = liPkg.find('.favo');
						if(listeFavoris.isParkingFavoris(e.properties.id))	monFavori.addClass('favori');
						else monFavori.addClass('favori-empty');
						liPkg.find(".dispo").text(e.properties.DISPO);
						liPkg.find(".total").text(e.properties.TOTAL);
						liPkg.find('.adresseParking').text(e.properties.ADRESSE);				 
						liPkg.addClass('forceHide'+e.properties.type);
						//ajouter le liPkg a la fin du ul
						$("#PkgRows").append(liPkg);
						$('#'+e.properties.id ).click(function(e){
						$(this).closest('li').find('.detailParking').toggle();					
						});		 

					var lonlat =e.geometry.coordinates[0]+','+e.geometry.coordinates[1];
					$('#'+e.properties.id+ '> div > span.syRendre').click(function(e){						
						app.fromParking = true;
						var adresse = 'Parking '+$(this).closest('li').find('.nomParking').text();
						$('#arr').val(adresse);
						$('#arr').attr('data-lonlat',$(this).closest('li').attr('data-lonlat'));
						app.afficheLien($('#rowMapIti'),lang.appMobile.itineraire);		
						trackPiwik("Application Mobile : Itineraire");
						app.initIti();
					// on sauvegarde la page parking pour qu'après click eventuel sur le bouton retour on revient sur la page parking (trafic)
						app.pagePrecente = "#rowAlertes";
						if ( window.localStorage.getItem('geolocationOff')=='on') geolocClick();
					});						
					//if (e.properties.TOTAL) html += '<tr data-id="' + e.properties.id + '" class="' + e.properties.type + ' forceHide' + e.properties.type +'"> <td class="libelle">'+ e.properties.LIBELLE.replace("P+R - ","").replace("P+R ","") + '</td><td><div class="' + (listeFavoris.isParkingFavoris(e.properties.id)?'favori':'favori-empty') + '"></div></td><td id="' + e.properties.id + '">n.c.</td><td>'+ e.properties.TOTAL + '</td></tr>';
				} else if(e.properties.type == 'PAR') {
					// P+R  -- cloner le modele
						var liPar = modelePkg.find('.ligneParking').clone();						
						//modifier le liPar
						liPar.attr('id',e.properties.id);
						liPar.attr('data-lonlat',e.geometry.coordinates.reverse().join(','));
						liPar.find('.nomParking').text(e.properties.LIBELLE.replace("P+R - ","").replace("P+R ",""));
						 var monfav = liPar.find('.favo')
						 if(listeFavoris.isParkingFavoris(e.properties.id)) monfav.addClass('favori');
						else  monfav.addClass('favori-empty');
						liPar.find(".dispo").text(e.properties.DISPO);
						liPar.find(".total").text(e.properties.TOTAL);
						liPar.find('.adresseParking').text(e.properties.ADRESSE);					
						liPar.addClass('forceHide'+e.properties.type);					 
						//ajouter le liPar a la fin du ul
						$("#ParcRows").append(liPar);
						$('#'+e.properties.id ).click(function(e){
							$(this).closest('li').find('.detailParking').toggle();					
						 });		 
					
					var lonlat =e.geometry.coordinates[0]+','+e.geometry.coordinates[1];
					$('#'+e.properties.id+ '> div > span.syRendre').click(function(e){
						app.fromParking = true;
						var adresse = 'P+R '+$(this).closest('li').find('.nomParking').text();
						$('#arr').val(adresse);
						$('#arr').attr('data-lonlat',$(this).closest('li').attr('data-lonlat'));
						app.afficheLien($('#rowMapIti'),lang.appMobile.itineraire);		
						trackPiwik("Application Mobile : Itineraire");
						app.initIti();
						//on sauvegarde la page parking pour un click eventuel sur le bouton retour 
						app.pagePrecente = "#rowAlertes";
						if ( window.localStorage.getItem('geolocationOff')=='on') geolocClick();						
					  });				    
				}
			});
			var rowParking = $('#rowParking');									
			updatePKG("evtPKGupdated");
			updatePAR("evtPARupdated");			
			app.triParkings();			
			$('#entetePkg').click(function(e){
					 $("#PkgRows").toggle();
			});			
			$('#entetePar').click(function(e){
					 $("#ParcRows").toggle();
			});							
			rowParking.show();
			rowParking.find('div.favori-empty, div.favori').click(function(e){
				e.preventDefault();
				var id  = $(this).closest('li').attr('id');
				var type  = id.substr(4,3);				
				if(listeFavoris.isParkingFavoris(id)) {
					listeFavoris.removeParking(id);
					$('#'+id+' div.favo').removeClass('favori').addClass('favori-empty');
				} else {
					listeFavoris.addParking(id,$('#'+id+' .nomParking').text(),type);
					$('#'+id+' div.favo').removeClass('favori-empty').addClass('favori');
				}
				return false; //évite le rechargement de la page.

			});

			$('#timesyncPKG').click(function(e) {
				e.preventDefault();
				$('#timesyncPKG').hide();
				updatePKG("evtPKGupdated");
				updatePAR("evtPARupdated");			
				return false; //évite le rechargement de la page.
			});
			
			app.updateEvtsTC();
		} catch(e) {
			console.log(e.lineNumber+' : '+e.message);
		}
    },
	//--------------------------------------//
	// updateParkings
	//--------------------------------------//
	updateParkings: function(data){
		var type = "";
		var now = new Date().getTime();
		for (var parking in data) {
			if (type=="") type = parking.substr(4,3);
			if (data[parking][data[parking].length-1].dispo > -1) {	
				if (now - data[parking][data[parking].length-1].time < 9*60*1000)//On n'affiche pas les données de plus de 9min
					$('#'+parking+' > .dispo').text(data[parking][data[parking].length-1].dispo)
				else
					$('#'+parking+' > .dispo').text('-')
				$('#'+parking).removeClass('forceHide'+type);
			}
			else {
				$('#'+parking).addClass('forceHide' + type);
				}	
		};
		//On cache ou pas l'entete
		var bListeNonVide = $('#ParcRows > li:not(.forceHidePAR)').length != 0;
		$('#entetePar').toggle(bListeNonVide);		
			
		bListeNonVide = $('#PkgRows > li:not(.forceHidePKG)').length != 0;
		$('#entetePkg').toggle(bListeNonVide);

		if(!idTimeoutPKG)
			idTimeoutPKG = setTimeout(function () {$('#timesyncPKG').show();idTimeoutPKG=false;}, 30000);		
	},	
		
	//--------------------------------------//
	// initTraffic
	//--------------------------------------//
	initTraffic:function(){
		if(!app.trafficMapStarted) {
			app.fondParDefaut = initMap('mapTraffic',{zoom:13,sourceFond:app.sourceFondCarte,popupId:'popupMap'}).fondParDefaut;
			app.sourceFondCarte = app.fondParDefaut.getSource();
			var map = getMap('mapTraffic');
			// on fait une popup custom qui ne bouge pas
			map.popup={setPosition:function(c){}};
			map.popupSelector="#popupMap";
			
			ajouteControle('mapTraffic','layerSwitcher');
			ajouteControle('mapTraffic','refresh',app.majTraffic);
			app.trafficMapStarted=true;
			
			//sourceTrr = new ol.source.GeoJSON({projection: "EPSG:3857"}); migration OL4
			sourceTrr = new ol.source.Vector({projection: "EPSG:3857",format: new ol.format.GeoJSON()});
			
			$('#rowMapTraffic .layerSwitcher .layers').append('<span data-cible="trr" class="catLayerSwitcher">'+ lang.appMobile.trafic +'</span>');
			var layerTrr = ajouteLayerManuel('trr','mapTraffic',{fctStyle:getStylesTrr,source:sourceTrr});
			ajouteLayerSwitcher('mapTraffic','trr','#rowMapTraffic .layerSwitcher',{libelle:lang.appMobile.reseauRoutier});
			activeLayer('trr');
			chargeTrr('mapTraffic',sourceTrr,0);
			//chargeTrrC38('mapTraffic',sourceTrr);

			//sourceEvtTr = new ol.source.GeoJSON({projection: "EPSG:3857"});migration OL4
			sourceEvtTr = new ol.source.Vector({projection: "EPSG:3857",format: new ol.format.GeoJSON()});
			
			var layerEvtTr = ajouteLayerManuel('evtTr','mapTraffic',{fctStyle:getStylesEvt,detailsCallback:app.getDetails,detailsSeul:true,source:sourceEvtTr});
			ajouteLayerSwitcher('mapTraffic','evtTr','#rowMapTraffic .layerSwitcher',{libelle:lang.appMobile.evenements});
			activeLayer('evtTr');
			updateEvtTR('mapTraffic',sourceEvtTr,{detailsCallback:app.getDetails,detailsSeul:true});
			
			if(!sourcePoints) sourcePoints = creeSourceType('mapTraffic','arret,pointArret,MVA,MVC,citelib,agenceM,pointService,dat,depositaire,PKG,PAR,CAM,autostop,recharge',{fctStyle:getStylesTypes,fctDetails:app.getDetails});

			//Cameras
			$('#rowMapTraffic .layerSwitcher .layers').append('<span data-cible="cam" class="catLayerSwitcher">'+lang.appMobile.cameras+'</span>');
			ajouteLayerType('mapTraffic','CAMtraffic','CAM',{fctStyle:getStylesTypes,source:sourcePoints,layerSwitcherName:lang.appMobile.cameras});
			activeLayer('CAMtraffic');

			//Parking
			$('#rowMapTraffic .layerSwitcher .layers').append('<span data-cible="titresTC" class="catLayerSwitcher">'+lang.appMobile.parking+'</span>');
			ajouteLayerType('mapTraffic','PKGtraffic','PKG',{fctStyle:getStylesTypes,source:sourcePoints,layerSwitcherName:lang.appMobile.parking});
			ajouteLayerType('mapTraffic','PARtraffic','PAR',{fctStyle:getStylesTypes,source:sourcePoints,layerSwitcherName:lang.appMobile.parkingRelais});
			activeLayer('PARtraffic');
			activeLayer('PKGtraffic');
			
			//Localisation
			ajouteLayerManuel('depArr','mapTraffic',{source:null,fctStyle:getStylesTypes}).set('visible',true);
			ajouteControle('mapTraffic','localize',onLocalize,{mapName:'mapTraffic',layerName:'depArr'});
			
			$('.ol-attribution.ol-unselectable.ol-control.ol-collapsed.ol-logo-only').click(function(){
				app.refInAppBrowser = window.open("http://openlayers.org/", '_blank', 'location=no');
			});

		}else{
			if(getMap('mapTraffic')) getMap('mapTraffic').updateSize();
			app.majTraffic();
		}
		
	},
	//--------------------------------------//
	// majTraffic
	//--------------------------------------//
	majTraffic:function() {
		//heure affichéee globale
		urlParams.heure=new Date();
		updateDynTrr('trr','mapTraffic');
		updateEvtTR('mapTraffic',sourceEvtTr);
		updateDyn('PAR','mapTraffic','PAR',sourcePoints);
		updateDyn('PKG','mapTraffic','PKG',sourcePoints);
	},
	//--------------------------------------//
	// initIti
	//--------------------------------------//
	initIti: function(){
		// modified by elhadj diallo (add else if ($('#arr').attr('data-lonlat')!="0,0") )
		
		if(!app.itiMapStarted) {
			
			initForm();
			
			//console.log(moment().format("HH:mm:ss.SSS") + ' initIti 0');
			var map = initMap('mapIti',{zoom:13,sourceFond:app.sourceFondCarte,popupId:'popupMap'});
			app.sourceFondCarte = map.fondParDefaut.getSource();
			
			//sourceDepArr=new ol.source.GeoJSON({projection: "EPSG:3857"});  migration OL4
			sourceDepArr=new ol.source.Vector({format: new ol.format.GeoJSON(),projection: "EPSG:3857"});
			ajouteLayerSwitcher('mapIti','depArr','#rowMapIti .layerSwitcher',{
				libelle:lang.maPosition,
				initFct:function(){
					var layer= ajouteLayerManuel('depArr','mapIti',{source:sourceDepArr,fctStyle:getStylesTypes});
					sourceDepArr = layer.getSource();
					activeLayer('depArr');
					return layer;
				}
			});
			
			//sourceIti=new ol.source.GeoJSON({projection: "EPSG:3857"}); migration OL4
			sourceIti=new ol.source.Vector({projection: "EPSG:3857", format: new ol.format.GeoJSON()});
			ajouteControle('mapIti','layerSwitcher');
			layerIti = ajouteLayerManuel('itineraires','mapIti',{source:sourceIti,fctStyle:getStylesIti});
			ajouteLayerSwitcher('mapIti','itineraires','#rowMapIti .layerSwitcher',{
				libelle:lang.appMobile.itineraires
			});
			activeLayer('depArr',true);
			activeLayer('itineraires',true);
			
			ajouteControle('mapIti','localize',onLocalize,{mapName:'mapIti',layerName:'depArr',type:'watch'});

			map.on('dblclick', onDblClickCarte);
			app.itiMapStarted=true;
			
			$('.ol-attribution.ol-unselectable.ol-control.ol-collapsed.ol-logo-only').click(function(){
				app.refInAppBrowser = window.open("http://openlayers.org/", '_blank', 'location=no');
			});
		} else {
			// on commence par l'heure car ca redeclenche l'evt et ca donne une boucle infinie si on commence par la date
			var now = moment().toDate();
			$('#timepickerIti').data("DateTimePicker").date(now);
			$('#datepickerIti').data("DateTimePicker").date(now);
		}

		if (app.fromParking)		{
			app.fromParking = false;
			$('#car > input').prop('checked',true);
			$('#carSharing > input').prop('checked',false);
			$('#transit > input').prop('checked',false);
			$('#transit_pmr > input').prop('checked',false);
			$('#walk > input').prop('checked',false);
			$('#bike > input').prop('checked',false);
			$('#pmr > input').prop('checked',false);
		}
	},
	//--------------------------------------//
	// initProxi
	//--------------------------------------//
	initProxi: function(sansLocalisation){
		if(window.localStorage.getItem('geolocationOff')=='') {
			
			navigator.notification.confirm(lang.questionLocaliser, function(button) {
					// yes = 1, no = 2, later = 3
					if (button == '1') {
							window.localStorage.setItem('geolocationOff',('on'));
					} else if (button == '2') {
						window.localStorage.setItem('geolocationOff',('off'));
					}
			}, lang.popup.oui, [lang.popup.oui,lang.popup.non]);
		};
					
		if(window.localStorage.getItem('geolocationOff')=='on' && !sansLocalisation) {
			app.localizeProxi(true);
		}
		if(!app.proxiMapStarted) {
			app.fondParDefaut = initMap('mapProxi',{zoom:16,sourceFond:app.sourceFondCarte,popupId:'popupMap'}).fondParDefaut;
			app.sourceFondCarte = app.fondParDefaut.getSource();
			var map = getMap('mapProxi');
			// on fait une popup custom qui ne bouge pas
			map.popup={setPosition:function(c){}};
			map.popupSelector="#popupMap";
			
			app.finInitProxi('mapProxi');
			app.proxiMapStarted=true;
		}
		if(getMap('mapProxi')) getMap('mapProxi').updateSize();
		
		$('.ol-attribution.ol-unselectable.ol-control.ol-collapsed.ol-logo-only').click(function(){
			app.refInAppBrowser = window.open("http://openlayers.org/", '_blank', 'location=no');
		});
		
	},
	//--------------------------------------//
	// initCartoAtmo
	//--------------------------------------//
	initCartoAtmo: function(url_carte){
		if(!app.cartoAtmoMapStarted) {
			try{
				
				var map = initMap('mapAtmo',{zoom:10,sourceFond:app.sourceFondCarte,popupId:'popupMap'});
				app.fondParDefaut = map.fondParDefaut;
				app.sourceFondCarte = app.fondParDefaut.getSource();
				map.getView().setCenter(ol.proj.transform([5.74,45.24], 'EPSG:4326', 'EPSG:3857'));
				map.getView().setZoom(10);
				
				ajouteControle('mapAtmo','layerSwitcher');
				
				var layer;
				
				if (getLayer('mapAtmo',map)!=null) return;
				
				//console.log(url_carte);

				var sourceAtmo = new ol.source.ImageStatic({
					attributions: [new ol.Attribution({html: '&copy; <a href="http://www.atmo-auvergnerhonealpes.fr/">Atmo Auvergne-Rhone-Alpes</a>'})],
					//imageSize: [1262, 947],
					url: url_carte,
					projection: ol.proj.get("EPSG:3857"),
					//imageExtent: [150000, 5510000, 834058, 5866000]
					//imageExtent: [409000, 5476000, 834058, 5866000]
					//imageExtent: ol.extent.boundingExtent( [[150000, 5510000],[834058, 5866000]]
                    imageExtent: [230000, 5510000, 800000, 5866000]
				});
				
				var layerAtmo = new ol.layer.Image({source: sourceAtmo,opacity: 0.75,id: 'multi_polluants'});
				layerAtmo.set('visible',true);
				map.addLayer(layerAtmo);
				ajouteLayerSwitcher('mapAtmo','multi_polluants','#rowAtmoCarto .layerSwitcher',{ libelle:'Multi polluants' });
				
				var sourcePM10 = new ol.source.ImageStatic({
					attributions: [new ol.Attribution({html: '&copy; <a href="http://www.atmo-auvergnerhonealpes.fr/">Atmo Auvergne-Rhone-Alpes</a>'})],
					//imageSize: [1250, 1150],
					url: url_carte.replace('multi','pm10'),
					projection: ol.proj.get("EPSG:3857"),
					imageExtent: [230000, 5510000, 800000, 5866000]
				});

				var layerPM10 = new ol.layer.Image({source: sourcePM10,opacity: 0.75,id: 'pm10'});
				layerPM10.set('visible',false);
				map.addLayer(layerPM10);
				ajouteLayerSwitcher('mapAtmo','pm10','#rowAtmoCarto .layerSwitcher',{ libelle:'PM10' });
				
				var sourceO3 = new ol.source.ImageStatic({
					attributions: [new ol.Attribution({html: '&copy; <a href="http://www.atmo-auvergnerhonealpes.fr/">Atmo Auvergne-Rhone-Alpes</a>'})],
					//imageSize: [1250, 1150],
					url: url_carte.replace('multi','o3'),
					projection: ol.proj.get("EPSG:3857"),
					imageExtent: [230000, 5510000, 800000, 5866000]
				});

				var layerO3 = new ol.layer.Image({source: sourceO3,opacity: 0.75,id: 'o3'});
				layerO3.set('visible',false);
				map.addLayer(layerO3);
				ajouteLayerSwitcher('mapAtmo','o3','#rowAtmoCarto .layerSwitcher',{ libelle:'O3' });
				
				var sourceNO2 = new ol.source.ImageStatic({
					attributions: [new ol.Attribution({html: '&copy; <a href="http://www.atmo-auvergnerhonealpes.fr/">Atmo Auvergne-Rhone-Alpes</a>'})],
					//imageSize: [1250, 1150],
					url: url_carte.replace('multi','no2'),
					projection: ol.proj.get("EPSG:3857"),
					imageExtent: [230000, 5510000, 800000, 5866000]
				});

				var layerNO2 = new ol.layer.Image({source: sourceNO2,opacity: 0.75,id: 'no2'});
				layerNO2.set('visible',false);
				map.addLayer(layerNO2);
				ajouteLayerSwitcher('mapAtmo','no2','#rowAtmoCarto .layerSwitcher',{ libelle:'NO2' });
				
				var polygoneAtmo = new ol.source.Vector({
					url: url.json('polygoneAtmo'),
					projection: "EPSG:3857",
					format: new ol.format.GeoJSON()
				});				
				
				var layerPolygoneAtmo = new ol.layer.Vector({
					source: polygoneAtmo,
									
					style: function(feature, resolution) {
						//console.log("resolution : " + resolution);
						var text = (resolution < 50) ? feature.get('Commune') : '';
						if (!styleCache['styleAtmo'+text]) {
							styleCache['styleAtmo'+text] = new ol.style.Style({
								stroke: new ol.style.Stroke({
									color: '#000',
									width: 1
								}),
								text: new ol.style.Text({
									font: '12px Calibri,sans-serif',
									fill: new ol.style.Fill({
										color: '#000'
									}),
									stroke: new ol.style.Stroke({
										color: '#fff',
										width: 3
									}),
									text: text
								})				
							});
						}
						styles = [styleCache['styleAtmo'+text]] ;
						return styles;
					}
				});
				
				layerPolygoneAtmo.set('visible',true);
				map.addLayer(layerPolygoneAtmo);
			} catch(e) {
				console.error(e);
			}
			app.cartoAtmoMapStarted=true;
		}
	},
	//--------------------------------------//
	// majIti
	//--------------------------------------//
	majIti:function() {
		sourceDepArr.clear();
		sourceDepArr.dep=null;
		sourceDepArr.arr=null;
		$('#dep').attr('data-lonlat','0,0');
		$('#arr').attr('data-lonlat','0,0');
		var map = getMap('mapIti');
		getMap('mapIti').on('dblclick', onDblClickCarte);
	},
	//--------------------------------------//
	// majProxi
	//--------------------------------------//
	majProxi:function() {
		//heure affichéee globale
		urlParams.heure = moment().toDate();
		updateDyn('PAR','mapProxi','PAR',sourcePoints);
		updateDyn('PKG','mapProxi','PKG',sourcePoints);

		//TODO mettre a jour la position si on a accepté le positionnement;
		$("#popupMap .PopupDetails-Close").trigger("click");
	},
	//--------------------------------------//
	// localizeProxi
	//--------------------------------------//
	localizeProxi:function(bNoConfirm) {
		var bLocaliser = window.localStorage.getItem('geolocationOff')=='on';
		if(!bNoConfirm && !bLocaliser) {
			navigator.notification.confirm(lang.questionLocaliser, function(button) {
					// yes = 1, no = 2, later = 3
					if (button == '1') {
							window.localStorage.setItem('geolocationOff',('on'));
							app.localizeProxi(false);
					} else if (button == '2') {
						window.localStorage.setItem('geolocationOff',('off'));
					}
			}, 'Oui', ['Oui','Non merci']);
		}
		if ((bLocaliser || bNoConfirm) && !app.bLocalisationEnCours && (app.watchID == "")) {
			navigator.geolocation.getCurrentPosition(app.posSucces,app.posErreur,{ maximumAge: 3000, timeout: 8000, enableHighAccuracy:false }); //enableHighAccuracy:false pour android...
			app.bLocalisationEnCours = true;
		}
	},
	//--------------------------------------//
	// posSucces
	//--------------------------------------//
	posSucces: function(pos){
		app.bLocalisationEnCours = false;
		app.position = pos;
		if (app.watchID != "") {
			navigator.geolocation.clearWatch(app.watchID);
			app.watchID = "";
		}
		
		$("#alertePosition").css('visibility','visible');
		$("#alerteNoPosition").css('visibility','hidden');
				
		if (estDansRectangle(pos.coords.longitude, pos.coords.latitude)) {
			if ($('#rowMapProxi').is(':visible') && typeof(getMap('mapProxi'))!='undefined') {
				getMap('mapProxi').getView().setCenter(ol.proj.transform([pos.coords.longitude, pos.coords.latitude], "EPSG:4326", "EPSG:3857"));
				app.placeSearch(''+pos.coords.latitude+','+pos.coords.longitude,'mapProxi','depArr','search');
			} else if ($('#rowMapIti').is(':visible') && typeof(getMap('mapIti'))!='undefined') {
				getMap('mapIti').getView().setCenter(ol.proj.transform([pos.coords.longitude, pos.coords.latitude], "EPSG:4326", "EPSG:3857"));
				app.placeSearch(''+pos.coords.latitude+','+pos.coords.longitude,'mapIti','depArr','search');
			}
			
		} else {
			alert(lang.alerteHorsRectangle);
		}
    },
	//--------------------------------------//
	// posErreur
	//--------------------------------------//
    posErreur: function(error){
		app.bLocalisationEnCours = false;
		fct_attente_horaires(false);
		if (app.watchID != "") {
			navigator.geolocation.clearWatch(app.watchID);
			app.watchID = "";
		}
		var info = lang.erreurPosition[0];
		switch(error.code) {
			case error.TIMEOUT:
				info += lang.erreurPosition[1];
			break;
			case error.PERMISSION_DENIED:
			info += lang.erreurPosition[2];
			break;
			case error.POSITION_UNAVAILABLE:
				info += lang.erreurPosition[3];
			break;
			default:
				info += lang.erreurPosition[4];
			break;
		}
		window.localStorage.setItem('geolocationOff','off');
		alert(info);
	},
	//--------------------------------------//
	// placeSearch
	//--------------------------------------//
	placeSearch:function(lonlat,idcarte,layerName,typeDep) {
		$('#'+typeDep).attr('data-lonlat',lonlat);
		var layerDepArr = getLayer(idcarte,layerName);
		var f = layerDepArr.getSource().getFeatureById(typeDep);
		var geom = new ol.geom.Point(ol.proj.transform([parseFloat(lonlat.split(',')[1]), parseFloat(lonlat.split(',')[0])],"EPSG:4326" , "EPSG:3857"));
			if (!f) {
				var fe = new ol.Feature({
					'geometry': geom,
					'typeDep':typeDep,
					'type':typeDep
				});
				
				fe.setId(typeDep);
				layerDepArr.getSource().addFeature(fe);
				if (sourceDepArr) 
					sourceDepArr[typeDep]=fe;
			} else {
				f.setGeometry(geom);
				if (sourceDepArr) 
					sourceDepArr[typeDep]=f;
			}
	},
	//--------------------------------------//
	// getDetails
	//--------------------------------------//
	getDetails: function(feature) {
		var featureType = feature.get('type');
		if (featureType== 'arret' || featureType== 'pointArret') {
			return getDetailPA2(feature);
		}

		if (featureType== 'MVA' || featureType== 'MVB' || featureType== 'MVC') {
			return getDetailMetroVelo(feature);
		}

		if (featureType== 'PKG' || featureType== 'PAR' || featureType== 'citelib' || featureType== 'evtTr') {
			return getDetailsParking(feature);
		}
		
		if (feature.get('type')=='CAM') {
			var nomPopup = '';
			if (stylesTypes[feature.get('type')]) {
				nomPopup = feature.get(stylesTypes[feature.get('type')].text)
			}

			return '<span class="nomPopup">'+nomPopup+'</span>'+ '<span class="popupFavori ' + (listeFavoris.isCamFavorite(feature.get('CODE'))?'favori':'favori-empty') + '"></span>' +'<span class="dyn" data-type="'+feature.get('type')+'"></span>';
		}
		var divLignes='';
		if(feature.getGeometry().getType() == 'Point') {
			var coord= ol.proj.transform(feature.getGeometry().getCoordinates(), "EPSG:3857", "EPSG:4326");
			var lonlat = coord[1]+','+coord[0];
			if ($('#traffic_link').is(':visible'))
				divLignes = getLignesProches(lonlat,afficheListeLgn,null,null,'mapTraffic');
			else
				divLignes = getLignesProches(lonlat,afficheListeLgn,null,null,'mapProxi');
			var div = '';
			var rue = feature.get('RUE');
			if (rue) div += '<span>'+rue+'</span>';
			var commune = feature.get('COMMUNE');
			if (commune) div += '<span>'+commune+'</span>';
			var divPrefixe = '';
			if (feature.get('type')=='dat') divPrefixe = lang.popup.arret+' ';
			return '<span>'+divPrefixe+'<span class="nomArret">'+feature.get(stylesTypes[feature.get('type')].text)+'</span>'+'</span>'+ div + divLignes;
		} else {
			return feature.get('NUMERO')+' - '+feature.get('LIBELLE');
		}
	},
	//--------------------------------------//
	// finInitProxi
	//--------------------------------------//
	finInitProxi: function(idcarte){
			var map = getMap(idcarte);
		map.popup={setPosition:function(c){}};
		enablePopupProxi();
		ajouteControle(idcarte,'layerSwitcher');
		ajouteControle(idcarte,'refresh',app.majProxi);
		ajouteControle(idcarte,'localize',app.localizeProxi);
		
		//Ma position
		//sourcePosition=new ol.source.GeoJSON({projection: "EPSG:3857"}); migration OL4
		sourcePosition=new  ol.source.Vector({projection: "EPSG:3857",format: new ol.format.GeoJSON()});
		ajouteLayerSwitcher(idcarte,'depArr','#'+idcarte+' .layerSwitcher',{
				libelle:lang.maPosition,
				initFct:function(){
					var layer= ajouteLayerManuel('depArr',idcarte,{source:sourcePosition,fctStyle:getStylesTypes});
					return layer;
				}
			});
			
		$('#mapProxi .layerSwitcher #depArr').prop('checked', true);
		$('#mapProxi .layerSwitcher #depArr').trigger('change');
		
		activeLayer('depArr');
		
		//Transports en commun
		$('#rowMapProxi .layerSwitcher .layers').append('<span data-cible="reseauTC" class="catLayerSwitcher">'+ lang.appMobile.tc +'</span>');
		
		ajouteLignes(idcarte,app.getDetails);
		activeLayer('lignes_TRAM');
		activeLayer('lignes_CHRONO');
			
		if (!sourcePoints) sourcePoints = creeSourceType(idcarte,'arret,pointArret,MVA,MVC,citelib,agenceM,pointService,dat,depositaire,PKG,PAR,CAM,autostop,recharge',{fctStyle:getStylesTypes,fctDetails:app.getDetails});
		//$('#rowMapProxi .layerSwitcher .layers').append('<br>');//pour equilibrer les colonnes.
		//Métrovélo
		$('#rowMapProxi .layerSwitcher .layers').append('<span data-cible="metrovelo" class="catLayerSwitcher">'+lang.iti.Metrovelo+'</span>');
		ajouteLayerType(idcarte,'agenceM','agenceM',{fctStyle:getStylesTypes,source:sourcePoints,layerSwitcherName:lang.iti.AgenceMetromobilite,noSwitcher:true});
		ajouteLayerType(idcarte,'MVA','MVA',{fctStyle:getStylesTypes,source:sourcePoints,layerSwitcherName:lang.iti.AgenceMetrovelo,noSwitcher:true});
		ajouteLayerType(idcarte,'MVC','MVC',{fctStyle:getStylesTypes,source:sourcePoints,layerSwitcherName:lang.iti.ConsignesMetrovelo,noSwitcher:true});
		activeLayer('agenceM');
		activeLayer('MVA');
		activeLayer('MVC');
		
		function switchMetrovelo(){
				var bVisible = $('#metrovelo').is(':checked');
				getLayer(idcarte,'agenceM').set('visible', bVisible);
				getLayer(idcarte,'MVA').set('visible', bVisible);
				getLayer(idcarte,'MVC').set('visible', bVisible);
		}
		
		$('#rowMapProxi .layerSwitcher .layers').append('<span id="metrovelospan"><input id="metrovelo" type="checkbox"><label for="metrovelo">'+lang.iti.Metrovelo+'</label></span>');

		$('#metrovelospan').click(function(){
			switchMetrovelo();
		});
		
		$('#metrovelo').prop('checked', true);
		switchMetrovelo();

		//Parking
		$('#rowMapProxi .layerSwitcher .layers').append('<span data-cible="titresTC" class="catLayerSwitcher">'+lang.appMobile.parking+'</span>');
		ajouteLayerType(idcarte,'PKG','PKG',{fctStyle:getStylesTypes,source:sourcePoints,layerSwitcherName:lang.appMobile.parking,noSwitcher:true});
		ajouteLayerType(idcarte,'PAR','PAR',{fctStyle:getStylesTypes,source:sourcePoints,layerSwitcherName:lang.appMobile.parkingRelais,noSwitcher:true});
		activeLayer('PAR');
		activeLayer('PKG');
		
		
		function switchParking(){
				var bVisible = $('#parkings').is(':checked');
				getLayer(idcarte,'PKG').set('visible', bVisible);
				getLayer(idcarte,'PAR').set('visible', bVisible);
		}
		
		$('#rowMapProxi .layerSwitcher .layers').append('<span id="parkingspan"><input id="parkings" type="checkbox"><label for="parkings">'+lang.appMobile.parking+'</label></span>');

		$('#parkingspan').click(function(){
			switchParking();
		});
		
		$('#parkings').prop('checked', true);
		switchParking();
		
		//Autopartage
		$('#rowMapProxi .layerSwitcher .layers').append('<span data-cible="autopartage" class="catLayerSwitcher">'+lang.iti.Autopartage+'</span>');
		ajouteLayerType(idcarte,'citelib','citelib',{fctStyle:getStylesTypes,source:sourcePoints,layerSwitcherName:'Cité Lib',noSwitcher:true});
		activeLayer('citelib');
		
		ajouteLayerType(idcarte,'recharge','recharge',{fctStyle:getStylesTypes,source:sourcePoints,layerSwitcherName:'Bornes recharge'});
		activeLayer('recharge');
		
		ajouteLayerType(idcarte,'autostop','autostop',{fctStyle:getStylesTypes,source:sourcePoints,layerSwitcherName:'Auto Stop'});
		activeLayer('autostop');

		function switchCitelib(){
				var bVisible = $('#citelib').is(':checked');
				getLayer(idcarte,'citelib').set('visible', bVisible);
				//getLayer(idcarte,'recharge').set('visible', bVisible);
				//getLayer(idcarte,'autostop').set('visible', bVisible);
		};
		
		$('#rowMapProxi .layerSwitcher .layers').append('<span id="citelibspan"><input id="citelib" type="checkbox"><label for="citelib">Citélib</label></span>');

		$('#citelibspan').click(function(){
			switchCitelib();
		});
		
		$('#citelib').prop('checked', true);
		switchCitelib();

		//Vente de titres
		$('#rowMapProxi .layerSwitcher .layers').append('<span data-cible="titresTC" class="catLayerSwitcher">'+lang.appMobile.venteTitres+'</span>');
		ajouteLayerType(idcarte,'pointService','pointService',{fctStyle:getStylesTypes,source:sourcePoints,layerSwitcherName:lang.appMobile.pointsServices,noSwitcher:true}).set('visible', false);
		ajouteLayerType(idcarte,'dat','dat',{fctStyle:getStylesTypes,source:sourcePoints,layerSwitcherName:lang.appMobile.distributeurs,noSwitcher:true}).set('visible', false);
		ajouteLayerType(idcarte,'depositaire','depositaire',{fctStyle:getStylesTypes,source:sourcePoints,layerSwitcherName:lang.appMobile.depositaires,noSwitcher:true}).set('visible', false);

		function switchVenteTitre()	{
				var bVisible = $('#titres').is(':checked');
				getLayer(idcarte,'dat').set('visible', bVisible);
				getLayer(idcarte,'depositaire').set('visible', bVisible);
				getLayer(idcarte,'agenceM').set('visible', bVisible);
				getLayer(idcarte,'pointService').set('visible', bVisible);
		}
		
		$('#rowMapProxi .layerSwitcher .layers').append('<span id="venteTitres"><input id="titres" type="checkbox"><label for="titres">'+ lang.appMobile.venteTitres + '</label></span>');
			$('#venteTitres').click(function(){
				switchVenteTitre();
			});
		
		//$('#titres').prop('checked', true);
		//switchVenteTitre();
		
		//Arrêts
		$('#rowMapProxi .layerSwitcher .layers').append('<span data-cible="arrets" class="catLayerSwitcher">'+lang.appMobile.arrets+'</span>');
		ajouteLayerType(idcarte,'arret','arret',{fctStyle:getStylesTypes,source:sourcePoints,layerSwitcherName:lang.appMobile.arrets,noSwitcher:true}).set('visible', true);
		ajouteLayerType(idcarte,'pointArret','pointArret',{fctStyle:getStylesTypes,source:sourcePoints,layerSwitcherName:lang.appMobile.poteaux,noSwitcher:true}).set('visible', true);
		activeLayer('arret');
		$('#arret').prop('checked', true);
		activeLayer('pointArret');
		
		function switchArret()	{
				var bVisible = $('#arret').is(':checked');
				getLayer(idcarte,'arret').set('visible', bVisible);
				getLayer(idcarte,'pointArret').set('visible', bVisible);
		}
		
		$('#rowMapProxi .layerSwitcher .layers').append('<span id="arretSpan"><input id="arret" type="checkbox"><label for="arret">'+lang.appMobile.arrets+'</label></span>');
			$('#arretSpan').click(function(){
				switchArret();
			});
		
		$('#arret').prop('checked', true);
		switchArret();
	},
	//----------------------------------------------------------------------------
	// Methode        : updateicone()
	//--------------------------- -------------------------------------------------
	updateicone: function(icone,value,type,color,colorFont) {
		if (type=='Trafic') {
			if (value == 1) { $(icone).css('fill','#5bb224');}//Vert
			else if (value == 2) { $(icone).css('fill','#ffa500');}//Orange
			else if (value == 3) { $(icone).css('fill','#ff0000');}//Rouge
			else if (value == 4) { $(icone).css('fill','#000');}//Noir
			else {$(icone).css('fill','#a9a9a9');}//Gris
		}else if (type=='TC') {
			if (value == 1) { $(icone).css('fill','#5bb224');}//Vert
			else if (value == 2) { $(icone).css('fill','#ffa500');}//Orange
			else if (value == 3) { $(icone).css('fill','#ff0000');}//Rouge
			else if (value == 4) { $(icone).css('fill','#0000ff');}//Bleu
			else if (value == 5) { $(icone).css('fill','#000');}//Noir
			else {$(icone).css('fill','#a9a9a9');}//Gris
		} else if (type=='Atmo') {
			$(icone + ' path').css('fill',color);
			$(icone + ' text').css('fill',colorFont);
			$(icone + ' text').text(value);
		}	
	},
	//--------------------------------------//
	// updateIndicesAtmo
	//--------------------------------------//
	updateIndicesAtmo: function() {
		try {
			
			var dateDuJour = moment().format("YYYY-MM-DD");
			var dateDuJourPrecedent = moment().subtract(1,"days").format("YYYY-MM-DD");
			var dateDuLendemain = moment().add(1,"days").format("YYYY-MM-DD");
			var urlIndicesAtmo = url.hostnameData + "/api/dyn/indiceAtmoFull/json";

			function successIndicesAtmo(response) {

				navigator.splashscreen.hide();
				
				var atmo = {"auj" : {"indice":0, "texte":"", "couleur_html":"", "couleur_police_html":"", "commentairePicDePol":""}, "demain" : {"indice":0, "texte":"", "couleur_html":"", "couleur_police_html":"", "commentairePicDePol":""}, "url_carte":""};
				
				if (response.indice_exposition_sensible)
					jQuery.each(response.indice_exposition_sensible, function(i, val) {
						if (val && val.qualificatif && val.date==dateDuJour)
						{
							atmo.auj.indice = val.valeur.split(',')[0];
							atmo.auj.texte = "indice atmosphérique : " + unEscapeHtml(val.qualificatif);
							atmo.auj.couleur_html = val.couleur_html;
							atmo.auj.couleur_police_html = getContrastYIQ(atmo.auj.couleur_html);
						} else if (val && val.date && i==dateDuLendemain) {
							atmo.demain.indice = val.valeur.split(',')[0];
							atmo.demain.texte = "indice atmosphérique : " + unEscapeHtml(val.qualificatif);
							atmo.demain.couleur_html = val.couleur_html;
							atmo.demain.couleur_police_html = getContrastYIQ(atmo.demain.couleur_html);
						}
					});
				
				if (response.action)
					jQuery.each(response.action, function(i, val) {
							if (val && val.commentaire && val.date==dateDuJour)
							{
								atmo.auj.commentairePicDePol = unEscapeHtml(val.commentaire);
							} else if (val && val.commentaire && val.date==dateDuLendemain)
							{
								atmo.demain.commentairePicDePol = unEscapeHtml(val.commentaire);
							}
					});
				
				if (response.url_carte) {
					atmo.url_carte = response.url_carte;
				}

				//atmo.url_carte = "http://www.atmo-auvergnerhonealpes.fr/sites/ra/files/thumbnails/image/20171218_aura-multi-1513551600-1.png"; //!!!!!!!!!!!!!!!!!!!!!!!
				
				if (atmo.auj.indice == 0) {
					$('#rowAtmo #updateAtmoAucun').show();
					$('#rowAtmo #updateAtmo').hide();
					$('#rowAtmo #updateAtmoCarto').hide();
				}				
				
				if (atmo.auj.commentairePicDePol=="") {
					$('#rowAtmo #updatePicDePol').hide();
				} else { 
					$('svg#iconeAlerteAtmo').show();
					$('#rowAtmo #updatePicDePol #titrePicDePol').empty();
					$('#rowAtmo #updatePicDePol #commentairePicDePol').empty();
					$('#rowAtmo #updatePicDePol #titrePicDePol').html("Aujourd'hui :");
					$('#rowAtmo #updatePicDePol #commentairePicDePol').html(atmo.auj.commentairePicDePol);
				}
				
				if (atmo.demain.commentairePicDePol=="") {
					$('#rowAtmo #updatePicDePolDemain').hide();
				} else {
					$('svg#iconeAlerteAtmo').show();
					$('#rowAtmo #updatePicDePolDemain #titrePicDePolDemain').empty();
					$('#rowAtmo #updatePicDePolDemain #commentairePicDePolDemain').empty();
					$('#rowAtmo #updatePicDePolDemain #titrePicDePolDemain').html("Demain :");
					$('#rowAtmo #updatePicDePolDemain #commentairePicDePolDemain').html(atmo.demain.commentairePicDePol);					
				}
				
				app.updateicone('#iconeatmo',(atmo.auj.indice=='0'?'?':atmo.auj.indice),'Atmo',atmo.auj.couleur_html,atmo.auj.couleur_police_html);
				
				if (response.date)
					$('#rowAtmo #updateAtmo #dateHeure').text("Pour le " + moment(response.date).format("DD/MM/YYYY") + ", " + atmo.auj.texte);
				else
					$('#rowAtmo #updateAtmo #dateHeure').text("Pour le " + dateDuJour + ", " + atmo.auj.texte);
				
				$('#rowAtmo #updateAtmo  #commentaireAtmo').empty();
				if (response.commentaire)
					$('#rowAtmo #updateAtmo #commentaireAtmo').html(response.commentaire.replace(/&lt;br \/&gt;/g, "\n"));//replace <br /> or <br >
				
				$('#rowAtmo #updateAtmo #polluantAtmo').empty();
				if (response.polluant_majoritaire != "Non disponible")
					$('#rowAtmo #updateAtmo #polluantAtmo').html("Polluant majoritaire: " + response.polluant_majoritaire);
				
				if (atmo.demain.texte != "")
					$('#rowAtmo #updateAtmoDemain #dateHeureDemain').text("Prévision pour le " + dateDuLendemain + ", " + atmo.demain.texte);
				
				$('#updateAtmoCartoImg > img').attr('src',atmo.url_carte).on("error", handleAtmoError).on("load", handleAtmoSuccess);

				function handleAtmoError(e) {
					console.log( atmo.url_carte  + ' not found ' + e);
					$('#updateAtmoCartoImg').hide();
				}

				function handleAtmoSuccess() {

					$('#updateAtmoCartoImgTitre').remove();
					$('#updateAtmoCartoImg').prepend("<div id='updateAtmoCartoImgTitre'>"+ lang.appMobile.agrandir +"<div id='updateAtmoCartoImgGlyph' class='glyphicon glyphicon-fullscreen'></div></div>");
					$('#updateAtmoCartoImg').show();
					$('#updateAtmoCartoImg').click(function(){
						app.showAtmoCarto(atmo.url_carte);
						return false;
					});	
					$('#updateAtmoCartoImg').show();				
				}
			}

			function errorIndicesAtmo(response) {
				
				navigator.splashscreen.hide();
				
				$('#rowAtmo #updateAtmoAucun').show();
				$('#rowAtmo #updateAtmo').hide();
				$('#rowAtmo #updateAtmoDemain').hide();
				$('#rowAtmo #updatePicDePol').hide();
				$('#rowAtmo #updatePicDePolDemain').hide();
				$('#rowAtmo #updateAtmoCarto').hide();
			}
			
			$.ajax({
				type: "GET",
				dataType : 'json',
				url: urlIndicesAtmo,
				success: successIndicesAtmo,
				async: true
			}).error(errorIndicesAtmo);
			
		} catch(e) {
			console.log(e.lineNumber+' : '+e.message);
		}
	},
	//--------------------------------------//
	// updateIndicesDeplacements
	//--------------------------------------//
	updateIndicesDeplacements : function () {
		
		app.updateIndicesDeplacementsTr();
		app.updateIndicesDeplacementsTc();
	},
	//--------------------------------------//
	// updateIndicesDeplacementsTr
	//--------------------------------------//
	updateIndicesDeplacementsTr:function () {
		try {
			var urlIndicesDeplacementsTr = url.hostnameData;
			urlIndicesDeplacementsTr += '/api/dyn/indiceTr/json';

			function successIndicesDeplacementsTr(response) {
				if (!response["IR1"]) return;
				response = response["IR1"];
				response = response[response.length-1];
				var indice = response.indice;
				app.updateicone('#iconetrafic path',indice,'Trafic');
				$('#iconetrafic').attr("title", lang.appMobile.trafic + " : " + lang.indiceTrafic[indice]);
				$('#iconetrafic').attr("alt", lang.appMobile.trafic + " : " + lang.indiceTrafic[indice]);
				$('#diviconetrafic a').attr("title", lang.appMobile.trafic + " : " + lang.indiceTrafic[indice]);
				$('#diviconetrafic a').attr("alt", lang.appMobile.trafic + " : " + lang.indiceTrafic[indice]);
			}
			function errorIndicesDeplacementsTr(response) {}
			
			$.ajax({
				type: "GET",
				url: urlIndicesDeplacementsTr,
				success: successIndicesDeplacementsTr,
				dataType:'json'
			}).error(errorIndicesDeplacementsTr);

		} catch(e) {
			console.error(e.lineNumber+' : '+e.message);
		}
	},
	//--------------------------------------//
	// updateIndicesDeplacementsTc
	//--------------------------------------//
	updateIndicesDeplacementsTc:function () {
		try {
			var urlIndicesDeplacementsTc = url.hostnameData;
			urlIndicesDeplacementsTc += '/api/dyn/indiceTc/json';

			function successIndicesDeplacementsTc(response) {
				if (!response["ITC1"]) return;
				response = response["ITC1"];
				response = response[response.length-1];
				var indice = response.indice;
				app.updateicone('#iconeTC path',indice,'TC');
				$('#iconeTC').attr("title", lang.appMobile.tc + " : " + lang.indiceTC[indice]);
				$('#iconeTC title').text(lang.appMobile.tc + " : " + lang.indiceTC[indice]);
				$('#iconeTC').attr("alt", lang.appMobile.tc + " : " + lang.indiceTC[indice]);
			}
			function errorIndicesDeplacementsTc(response) {}
			
			$.ajax({
				type: "GET",
				url: urlIndicesDeplacementsTc,
				success: successIndicesDeplacementsTc,
				dataType:'json'
			}).error(errorIndicesDeplacementsTc);

		} catch(e) {
			console.error(e.lineNumber+' : '+e.message);
		}
	},
	//--------------------------------------//
	// displayScreen
	//--------------------------------------//	
	displayScreen:function (type) {
		//console.log('displayScreen :' + type);		
		switch (type) {
			case("EvtRoutier") :
			case("EvtParking") :
				app.showAlertesTR();
				app.updateEvtsTC();
				break;
			case("EvtTc") :
				app.showAlertesTC();
				app.updateEvtsTC();
				break;
			/*case("EvtExceptionnel") :
				app.showNotifs();
				break;
			break;*/
			case("EvtAtmo") :
				app.showAtmo();
			break;
			default:
				app.showNotifs();
		}
	},
	//--------------------------------------//
	// updateEvtsTC
	//--------------------------------------//
	updateEvtsTC:function (data) {
		try {
			//if (app.dateMajEvtTC && moment().subtract(6,'minutes') < app.dateMajEvtTC ) return;
			fct_attente_horaires(true);
			var urlSearch = url.hostnameData;
			urlSearch += '/api/dyn/evtTC/json';
			function successEvtsTC(response) {
				var lignesNow = $('<div>');
				var codeListe = {};
				var now  = moment(urlParams.heure);
				$('.evtsTC :nth-child(n+3)').remove();
				var listevtSEM = "";
				var listevtC38 = "";
				var listevtSNC = "";
				for (var codeEvt in response) {
					var code = response[codeEvt].listeLigneArret;
					/*if(code.substr(0,7)=='SNC_SNC') {
						code='SNC_'+code.substr(7);
					}*/
					app.dateMajEvtTC = now;
					var loc=response[codeEvt].texte.split('|')[0];
					var ddeb = moment(response[codeEvt].dateDebut,'DD/MM/YYYY HH:mm');
					var dfin = moment(response[codeEvt].dateFin,'DD/MM/YYYY HH:mm');
					if (!dataEvtsTC[code]) dataEvtsTC[code]={};
					if (!dataEvtsTC[code][codeEvt]) dataEvtsTC[code][codeEvt]={};
					dataEvtsTC[code][codeEvt].loc=loc;
					dataEvtsTC[code][codeEvt].ddeb=ddeb;
					dataEvtsTC[code][codeEvt].dfin=dfin;
					dataEvtsTC[code][codeEvt].hdeb=response[codeEvt].heureDebut;
					dataEvtsTC[code][codeEvt].hfin=response[codeEvt].heureFin;
					dataEvtsTC[code][codeEvt].we=response[codeEvt].weekEnd;
					dataEvtsTC[code][codeEvt].comment=urlify(response[codeEvt].texte.replace(/\|/g,'<br>'));
					if (dataLignesTC && typeof(dataLignesTC[code]) != 'undefined') {
						var l = getLogoLgn(code,dataLignesTC[code].routeShortName,'#'+dataLignesTC[code].routeColor,false,'logoLgn','logoLgnRect');
						var logo = $('<div>').append(l).html();
						if (isEvenementEnCours(ddeb,dfin)) {
							if (!codeListe[code]) {
								lignesNow.append(l);
								codeListe[code]= loc;
							} else {
								codeListe[code]+= '\n' + loc;
								//lignesNow.find('svg[data-code='+code+'] title').html(codeListe[code]);
							}
							
							if (code.substr(0,3) == 'SEM') {
								listevtSEM += '<div data-code="'+code+'"><div class="anchor" id="'+codeEvt+'">'+logo+'&nbsp<span class="titreEvt">'+loc.split(':')[1]+'</span></div>';
								listevtSEM += '<p>'+dataEvtsTC[code][codeEvt].comment.replace(loc,'')+'</p></div>';
							}
					
							if (code.substr(0,3) == 'C38'){
								listevtC38 += '<div data-code="'+code+'"><div class="anchor" id="'+codeEvt+'">'+logo+'&nbsp<span class="titreEvt">'+loc.split(':')[1]+'</span></div>';
								listevtC38 += '<p>'+dataEvtsTC[code][codeEvt].comment.replace(loc,'')+'</p></div>';
							}
				
							if (code.substr(0,3) == 'SNC'){
								listevtSNC += '<div data-code="'+code+'"><div class="anchor" id="'+codeEvt+'">'+logo+'&nbsp<span class="titreEvt">'+loc.split(':')[1]+'</span></div>';
								listevtSNC += '<p>'+dataEvtsTC[code][codeEvt].comment.replace(loc,'')+'</p></div>';
								
							}
							codeListe[code.substr(0,3)]=true; //pour l'ajout de message 'aucune pertrubation
						}
					}
				}
				
				listevtSEM = $(listevtSEM).sort(function(a,b){
					return compareCodeLigne($(a).attr('data-code'),$(b).attr('data-code'));
				})
				listevtC38 = $(listevtC38).sort(function(a,b){
					return compareCodeLigne($(a).attr('data-code'),$(b).attr('data-code'));
				})
				listevtSNC = $(listevtSNC).sort(function(a,b){
					return compareCodeLigne($(a).attr('data-code'),$(b).attr('data-code'));
				})
	
				var appendText = '<p><br/>'+ lang.aucunePerturbation_full + '</p>';
				if (!codeListe['SEM'])
					$('#divEvtsTC .SEM').append(appendText);
				else
					$('#divEvtsTC .SEM').append(listevtSEM);
					
				if (!codeListe['C38'])
					$('#divEvtsTC .C38').append(appendText);
				else
					$('#divEvtsTC .C38').append(listevtC38);
				if (!codeListe['SNC'])
					$('#divEvtsTC .SNC').append(appendText);
				else
					$('#divEvtsTC .SNC').append(listevtSNC);
				
				//$('#updateEvtsTC .dateHeure').text(lang.appMobile.derniereMaj + moment().format('DD/MM/YYYY HH:mm'));
				fct_attente_horaires(false);
				if(!idTimeoutEvtsTC)
					idTimeoutEvtsTC = setTimeout(function () {$('#timesyncEvtsTC').show();idTimeoutEvtsTC=false;}, 30000);

			}
			
			$.ajax({
				type: "GET",
				url: urlSearch,
				success: successEvtsTC,
				dataType:'json'
			}).error(function(response) {
				fct_attente_horaires(false);
				console.log(response.statusText);
				});

		} catch(e) {
			fct_attente_horaires(false);
			console.log(e.lineNumber+' : '+e.message);
		}
	},
	//--------------------------------------//
	// playNotifSound
	//--------------------------------------//
	playNotifSound: function (e) {
		var soundfile = "";
		if (device.platform.toUpperCase() == 'ANDROID') {
			soundfile = "/android_asset/www/"+(e.soundname || e.sound);
		} else if (device.platform.toUpperCase() == 'IOS') {
			soundfile = e.soundname || e.sound;
		} else { //Windows
			soundfile = /*"ms-appx:///"+*/ e.soundname || e.sound;
		}
		//console.log('Media(soundfile) :' + soundfile);
		var my_media = new Media(soundfile,
							// success callback
							function () { /*console.log("playAudio():Audio Success");*/ },
							// error callback
							function (err) { console.log("playAudio():Audio Error: " + err); });
							
		my_media.play();
	},
	//--------------------------------------//
	// playNotification
	//--------------------------------------//
	playNotification:function(e) {		
		var status = window.localStorage.getItem('notificationStatus');
		if (status == 'notificationOff') { return; }
		if (status == 'notificationOn')  {  app.playNotifSound(e); }
		if (status == 'notificationVibrates')  { navigator.vibrate(300); return; }
	},
	//--------------------------------------//
	// initNotif
	//--------------------------------------//
    initNotif: function(){
        try
        {
			var push = PushNotification.init({ "android": {"senderID": "xxxxxxxxxxxxxxxxx"},
				"ios": {"alert": "true", "badge": "true", "sound": "true"}, "windows": {} } );

			push.on('registration', function(data) {
				//console.log("push.on registration : " + data.registrationId);
				// data.registrationId
				if (device.platform.toUpperCase() == 'IOS') {
					window.localStorage.setItem('os','1');
				} else if (device.platform.toUpperCase() == 'ANDROID') {
					window.localStorage.setItem('os','2');
				} else {
					window.localStorage.setItem('os','3');
				}
				window.localStorage.setItem('regId',data.registrationId);
				
				//Fait maintenant pour les 3 plateformes. (uniquement Android avant)
				if(data.registrationId != window.localStorage.getItem('registered') && window.localStorage.getItem('registered') != '') {
					//On met a jour le registerId dans le SIV
					loginSIV.updateRegister(window.localStorage.getItem('registered'),data.registrationId);
				}
			});		

			 push.on('notification', function(data) {
				var notif = {alert:data.message,title:data.title,soundname:data.sound};
				app.playNotification(notif);
				listeNotifs.addNotif(notif);
				if (data.additionalData && data.additionalData.type) app.displayScreen(data.additionalData.type); 
			});

			push.on('error', function(e) {
				// e.message
				console.log("push.on error: " + e.message);
				app.bNotificationAutorisee=false;
				window.localStorage.setItem('regId','');
				
			});
	    }
        catch(err)
        {
            alert("There was an error on this page.\n\nError description: " + err.message + "\n\n");
        }
        $('#registerNotif_link').click(function(){
        	var regId = window.localStorage.getItem('regId');
			var os = window.localStorage.getItem('os');
			loginSIV.login($('#userRegNotif').val(),$('#pwdRegNotif').val(),regId,os);
        });
    },
	//--------------------------------------//
	// jsonErrorHandler
	//--------------------------------------//
	jsonErrorHandler:function(error) {
		console.log("jsonErrorHandler error: " + error.code + " message: " + error.message);
	}
}; //end app

//--------------------------------------//
// listeNotifs : Objet notification
//--------------------------------------//
var listeNotifs = {
    //--------------------------------------//
	// addNotif
	//--------------------------------------//
    addNotif:function (n) {
        if (!n.id) {
			var myID = parseInt(window.localStorage.getItem('myID'));
			myID = myID + 1;
			window.localStorage.setItem('myID',myID);
			window.localStorage.getItem('myID');
			n.id = myID.toString();
		}
        var notifs = JSON.parse(window.localStorage.getItem('notifs'));
		notifs[n.id]=n;
		notifs[n.id].dateRecep = moment();
		//console.log('ID :' + myID + '  ' + JSON.stringify(notifs));
		window.localStorage.setItem('notifs',JSON.stringify(notifs));
		listeNotifs.afficheNotifs();
    },
    //--------------------------------------//
	// removeNotif
	//--------------------------------------//
    removeNotif:function (id) {
		var notifs = JSON.parse(window.localStorage.getItem('notifs'));
		delete notifs[id];
		window.localStorage.setItem('notifs',JSON.stringify(notifs));
		listeNotifs.afficheNotifs();
	},
	//--------------------------------------//
	// removeAllNotifs
	//--------------------------------------//
    removeAllNotifs:function () {
		window.localStorage.setItem('notifs','{}');
		listeNotifs.afficheNotifs();
	},
	//--------------------------------------//
	// afficheNotifs
	//--------------------------------------//
    afficheNotifs:function(){
        $('#listeNotifs').empty();
		/* pour test !!!*/
		//window.localStorage.setItem('notifs','{"1":{"alert":"Perturbation ligne  en cours jusqu au 18/2 14h52. ","title":"Test Notif","soundname":"ms-winsoundevent:Notification.SMS","id":"1","dateRecep":"2016-01-29T13:54:27.350Z"},"2":{"alert":"Perturbation ligne E : Incident technique terminé(e). ","title":"Ligne E : Incident technique","soundname":"ms-winsoundevent:Notification.SMS","id":"2","dateRecep":"2016-01-29T13:56:18.332Z"}}');
		/* pour test */
		
		//console.log(window.localStorage.getItem('notifs'));
		var notifs = JSON.parse(window.localStorage.getItem('notifs'));
		for (var n in notifs) {
			var notifToPrepend = '<div class="notifs col-xs-12" id="'+n+'"><h6>'+notifs[n].title+ '</h6><p>'+ notifs[n].alert +'</p></div>'
			notifToPrepend = urlify(notifToPrepend);
			$('#listeNotifs').prepend(notifToPrepend);
		}
		$('#listeNotifs').prepend('<div class="nom col-xs-12"><h6 class="">' /*+ lang.appMobile.bonjour*/ + ' ' + window.localStorage.getItem('user')+'<span id="changeUtil"><span class="glyphicon glyphicon-remove-circle"></span></span></h6><span class="vide"></span></div>');
		if($('#listeNotifs .notifs').length==0) $('#listeNotifs .vide').html(lang.aucuneNotif);
	},
	//--------------------------------------//
	// getTrajets
	//--------------------------------------//
    getTrajets:function(){
		loginSIV.getTrajetsSIV();
	}
};

//--------------------------------------//
//  initialize
//--------------------------------------//

app.initialize();
