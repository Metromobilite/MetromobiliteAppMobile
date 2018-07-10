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
// global
//--------------------------------------//
var dataLignesTC;

//--------------------------------------//
// validateParamsForm
//--------------------------------------//
function validateParamsForm() {
	return true;
}
//--------------------------------------//
// getDetailPA2
//--------------------------------------//
function getDetailPA2(feature) {
	// voir pb data:[] dans reponse serveur a chavant
	var pop = $('#popupZA').clone();

	var divIcones = pop.find( '> .icones');
	divIcones.attr('data-featureId',feature.get('id'));
	divIcones.attr('data-featureLayer','arret');
	
	//gethoraires
	var searchUrl;
	if(feature.get('type')=='pointArret') {
		searchUrl = (url.saisieChoisie=='local'?url.hostnameLocal+url.portWSTest:url.hostnameData);
		searchUrl += '/api/routers/default/index/stops/'+feature.get('CODE').replace('_',':')+'/stoptimes';
	} else {
		searchUrl = (url.saisieChoisie=='local'?url.hostnameLocal+url.portWSTest:url.hostnameData);
		searchUrl += '/api/routers/default/index/clusters/'+feature.get('CODE').replace('_',':')+'/stoptimes';
	}

	fct_attente_horaires(true);
	$.ajax({
		type: "GET",
		url: searchUrl,
		error:error,
		dataType: 'json'
	}).then(function(res) {
		fct_attente_horaires(false);
		var passages = {};
		res.forEach(function(r){
			if(r.pattern) {
				var code = r.pattern.id.split(':',2).join('_');
				if(!passages[code]) passages[code] = {dir1:{name:'',times:[]},dir2:{name:'',times:[]}}
				p = passages[code];
				//quelle direction on remplit
				var dir = (r.pattern.dir?p['dir'+r.pattern.dir]:(p.dir1.times.length>0?p.dir2:p.dir1));
				dir.name = r.pattern.desc;
				//recup des horaires
				for (var i=0;i<r.times.length && i<2;i++) {
					var time = (r.times[i].realtimeDeparture? r.times[i].realtimeDeparture : r.times[i].scheduledDeparture);
					dir.times.push({ dest:r.pattern.desc,
									 time:(time*1000)+(r.times[i].serviceDay*1000),
									 realtime:r.times[i].realtime,
									 bTropLong:(time*1000)+(r.times[i].serviceDay*1000) > (new Date().getTime())+(65*60*1000)
									});
				}
			}
		});
		var popup = $('#popupMap .PopupDetails-detailsCallback');
		//affichage du resultat
		var ligneModele = $('#popupZA').find('> .passages > .ligne');
		for (var code in passages) {
			
			var maligne = ligneModele.clone();
			var p = passages[code];
			maligne.addClass(code);
			maligne.attr('data-code',code);
			maligne.find('> .logoLigne').append($('#'+code).clone());
			//destination

			for (var d=1;d<3;d++) {
				var maDir = maligne.find('> .dir'+d);
				var dir;
				if(d==1) dir = (p.dir1.times.length>0?p.dir1:p.dir2);
				if(d==2 && p.dir1.times.length>0) dir = p.dir2;
				if(d==2 && p.dir1.times.length==0) break;
				
				dir.times.sort(function(a,b){
					return a.time - b.time;
				});
				
				maDir.find('> .libDir').text(dir.name);
				for (var i=0;i<dir.times.length && i<2;i++) {
					var text = '--:--';
					if(!dir.times[i].bTropLong){
						text = formatDelaiPP(moment(dir.times[i].time))+(!dir.times[i].realtime?'*':'');
					}
					maDir.find('> div > .delai > span:nth-of-type('+(i+1)+')').text(text);
				}
				maDir.find('> div > a').click(function(){
					var codeLigne = $(this).closest('div.ligne').attr('data-code');
					//console.log(codeLigne + " " + feature.get('CODE') + " " + feature.get('LIBELLE'));
					listeFavoris.showLigneFav(codeLigne,feature.get('CODE'),feature.get('LIBELLE'));
					return false;
				});
				
				if(d==2 && p.dir2.times.length>0) maDir.addClass('nonReduit');
			}
			for (var e in dataEvtsTC[code]) {
				//maligne.find('> .evt').append('<span class="glyphicon glyphicon-warning-sign"></span><a href="index.html?page=Evts#'+e+'" target="_blank"> '+dataEvtsTC[code][e].loc+'</a><br>');
				maligne.find('> .evt').append('<span class="glyphicon glyphicon-warning-sign"></span><a href="#" onclick="app.showAlertesTC();"> '+dataEvtsTC[code][e].loc+'</a><br>');
			}
			popup.find('> .passages').append(maligne);
		}
		//tri
		popup.find('> .passages > div.ligne').sort(function(a,b){
			return compareCodeLigne($(a).attr('data-code'),$(b).attr('data-code'));
		}).detach().appendTo(popup.find('> .passages'));

		popup.find('> .passages').removeClass('dynVide');
	});
	pop.find('> .passages > .ligne').remove();
	return pop.html();
}

//--------------------------------------//
// getDetailMetroVelo
//--------------------------------------//
function getDetailMetroVelo(feature) {
	var divLignes='';
	var coord= ol.proj.transform(feature.getGeometry().getCoordinates(), "EPSG:3857", "EPSG:4326");
	var lonlat = coord[1]+','+coord[0];
	divLignes = getLignesProches(lonlat,afficheListeLgn,null,null,"mapProxi");
	
	var div = '';
	var rue = feature.get('RUE');
	if (rue) div += '<span>'+rue+'</span>';
	var commune = feature.get('COMMUNE');
	if (commune) div += '<span>'+commune+'</span>';
	var divPrefixe = '';
	if (feature.get('type')=='dat') divPrefixe = lang.popup.arret+' ';
	return '<span>'+divPrefixe+'<span class="nomArret">'+feature.get(stylesTypes[feature.get('type')].text)+'</span>'+'</span>'+ div + divLignes;
}

//--------------------------------------//
// getDetailsParking
//--------------------------------------//
function getDetailsParking(feature) {
	var nomPopup = '';
	if (stylesTypes[feature.get('type')]) {
		nomPopup = feature.get(stylesTypes[feature.get('type')].text)
	}
	var coord= ol.proj.transform(feature.getGeometry().getCoordinates(), "EPSG:3857", "EPSG:4326");
	var lonlat = coord[1]+','+coord[0];
	var divPrefixe = '';
	var div = '';
	
	var idmap = "mapProxi";
	
	if ($('#traffic_link').is(':visible')) idmap = "mapTraffic";

	if (feature.get('type')=='PKG' || feature.get('type')=='PAR') {
		if (feature.get('TOTAL')) div += '<span>'+feature.get('TOTAL')+' '+lang.carteMobile.places+'</span>';
		div += '<span class="dyn dynVide" data-type="'+feature.get('type')+'"><span class="dispo"></span> '+lang.carteMobile.placesdisponibles+'</span>';
		div += getLignesProches(lonlat,afficheListeLgn,null,null,idmap);
	}
	if (feature.get('type')=='citelib') {
		divPrefixe = lang.station+' : ';
		div += getLignesProches(lonlat,afficheListeLgn,null,null,idmap);
	}
	if (feature.get('type')=='evtTr') {
		
		div = '<span class="text-left" data-type="'+feature.get('type')+'">'+feature.get('contenu')+'</span>';
	}
	return '<span>'+divPrefixe+'<span class="nomPopup">'+nomPopup+'</span>'+'</span>'+ div;
}

//--------------------------------------//
// enablePopupProxi
//--------------------------------------//
function enablePopupProxi(){
	var map = getMap('mapProxi');
	map.popupSelector="#popupMap";
	//$('#iti,#itiDetails').hide();
}

//--------------------------------------//
// initIti
//--------------------------------------//
function initIti() {
//rien
}

//--------------------------------------//
// lanceCalculAuto
//--------------------------------------//
function lanceCalculAuto() {
//rien
}

//--------------------------------------//
// getDetailsLanceIti
//--------------------------------------//
function getDetailsLanceIti() {
	//return $('#modelePopupLanceIti').html();

	return '<div id="modelePopupLanceIti">\
				<div class="row header">Itineraire</div>\
				<div id="modes" class="col-xs-12 input-group input-group-sm" data-toggle="checkbox">\
					<ul id="transit" class="col-xs-2">\
					<div title="Transports en commun" alt="Transports en commun"></div>\
					<input type="checkbox" checked="checked" value="transit"></input>\
					</ul>\
					<ul id="bike" class="col-xs-2">\
					<div title="Vélo" alt="Vélo"></div>\
					<input type="checkbox" checked="checked" value="bike"></input>\
					</ul>\
					<ul id="walk" class="col-xs-2">\
					<div title="Piéton" alt="Piéton"></div>\
					<input type="checkbox" checked="checked" value="walk"></input>\
					</ul>\
					<ul id="car" class="col-xs-2">\
					<div title="Voiture"  alt="Voiture"></div>\
					<input type="checkbox" value="car"></input>\
					</ul>\
					<ul id="pmr" class="col-xs-2">\
					<div title="Personne à mobilité réduite" alt="Personne à mobilité réduite"></div>\
					<input type="checkbox" value="pmr"></input>\
					</ul>\
				</div>\
				<a id="lanceCalculIti" href="#" onclick="lanceCalculIti();">Go</a>\
			</div>';
}

//--------------------------------------//
// lanceCalculIti
//--------------------------------------//
function lanceCalculIti(){
	lanceCalculAuto();
}

//--------------------------------------//
// lanceRequete
//--------------------------------------//
function lanceRequete() {
	var req = requetes.shift();
	if (!req) {
		afficheResultats();
		return ;
	}
	//déjà executé
	if (resultats[req.key] && resultats[req.key].req[req.url]) {
		return lanceRequete();
	}

	var dataType = 'json';  //json pour WP8 -> surcharge en attendant OTP2!
	
	if (device.platform.toUpperCase() == 'BROWSER') {
		dataType = 'jsonp'; 
	}
	//console.log(req.url);
	$.ajax({
		type: "GET",
		url: req.url,
		timeout:10000,
		success:function(data){ return parseResultats(data,req);},
		error:errorOTP,
		dataType:dataType
	}).error(function (error) {
		lanceRequete();
		fct_attente(false,'calcul');
	});
	
	trackPiwik("MetroMobilité : Demande calcul d'itinéraire");
}

//--------------------------------------//
// clickLienDetails
//--------------------------------------//
function clickLienDetails(e){
	var res;
	if (typeof(e.attr) == "function") {
		res = e.attr('data-resultat');//Cas du swipe
	}
	else
		res = $(this).attr('data-resultat');//cas de l'appui sur fleche
	
	if (typeof(res) != 'undefined') {
		afficheItiOuLeg(res);
		afficheDetail(res);
	}
	
	$('#iti').toggle(false);
	$('#itiDetails').toggle(true);
	return false;
}

//--------------------------------------//
// zoomCarte
//--------------------------------------//
function zoomCarte(idcarte) {
	toggleParams(false,true);
	$('#iti').hide();
	$('#itiDetails').hide();
	var map=getMap(idcarte);
	//map.getView().fitExtent(sourceIti.getExtent(),map.getSize()); migration OL4
	map.getView().fit(sourceIti.getExtent(),map.getSize());
}

//--------------------------------------//
// onDblClickCarte
//--------------------------------------//
function onDblClickCarte(evt) {
	if($('#popupMap').is(':visible')) {
		return;
	}
	var type;
	if(!sourceDepArr.dep) {
		type = 'dep';
	} else if(!sourceDepArr.arr) {
		type = 'arr';
		// on arrete d'ajouter des feature, 2 suffisent
		//getMap('mapIti').singleClickCallback=false;
		getMap('mapIti').un('dblclick', onDblClickCarte);
	} else {
		getMap('mapIti').un('dblclick', onDblClickCarte);
		//getMap('mapIti').singleClickCallback=false;
		return;
	}
	var coordDeg = ol.proj.transform(evt.coordinate,"EPSG:3857" , "EPSG:4326");
	var lonlat = coordDeg[1]+','+coordDeg[0];
	app.placeSearch(lonlat,'mapIti','depArr',type);
	return false;
}

//--------------------------------------//
// placeDepArr
//--------------------------------------//
function placeDepArr(type,coord) {
	var coordDeg = ol.proj.transform(coord,"EPSG:3857" , "EPSG:4326");
	var lonlat = coordDeg[1]+','+coordDeg[0];
	app.placeSearch(lonlat,'mapIti','depArr',type);
}

//--------------------------------------//
// getStylesPA
//--------------------------------------//
function getStylesPA(feature,resolution) {
	var styles;

		var text = '';//resolution < 1 ? feature.get('LIBELLE') : '';

		if (!styleCache['pa_'+text]) {
		  styleCache['pa_'+text] = new ol.style.Style({
				zIndex: 13,
				image: iconePArret,//imageLgnArret,
			});
		} 
		styles = resolution < 3 ? [styleCache['pa_'+text]] : [];
		return styles ;
}

//--------------------------------------//
// trackPiwik
//--------------------------------------//
function trackPiwik(detail) {
	try {
		if (typeof(Piwik) =='undefined') {
			console.log('Error : trackPiwik Piwik=undefined' + detail);
			return;
		}
		var site;
		urlParams.site="metromobiliteAppMobile";
		switch(urlParams.site) {
		case 'metromobilite':
			site=3;
			break;
		case 'metromobiliteAppMobile':
			site=6;
			break;
		case 'metrovelo':
			site=4;
			break;
		case 'tag':
			site=5;
			break;
		default:
			site=3;
		}

		if (isMobile()) {
			if (typeof(device)=='undefined')
				detail = detail + ' (undefined)';
			else
				detail = detail + ' (' + device.platform + ')';
		}
		
		var piwikTracker = Piwik.getTracker(url.urlPiwik, site);
		piwikTracker.setCustomUrl( 'http://app.metromobilite.fr' );
		function getOriginalVisitorCookieTimeout() {
			var maintenant = new Date();
			var nowTs = Math.round(maintenant.getTime() / 1000);
			var visitorInfo = piwikTracker.getVisitorInfo();
			var createTs = parseInt(visitorInfo[2]);
			var cookieTimeout = 33696000; // 13 mois en secondes
			var originalTimeout = createTs + cookieTimeout - nowTs;
			return originalTimeout;
		}
		piwikTracker.setVisitorCookieTimeout( getOriginalVisitorCookieTimeout() );
		piwikTracker.trackPageView(detail);
		piwikTracker.enableLinkTracking();
		
	} catch(err) {
		console.log('trackPiwik fatal error:' + err.message);
		}
}

//--------------------------------------//
// alert
//--------------------------------------//
//TODO NB if (typeof(navigator.notification) != 'undefined') { // Override default HTML alert with native dialog
window.alert = function (txt) {
	navigator.notification.alert(txt, null, "MétroMobilité", "OK");
}
//TODO NB}

//--------------------------------------//
//clickLienCarte
//--------------------------------------//
function clickLienCarte(e) {
	
	var index = e.attr('data-resultat');
	
	$('#iti').toggle(false);
	$('#itiDetails').toggle(false);
	
	afficheItiOuLeg(index);
	afficheDetail(index);
	
	zoomCarte('mapIti');
	activeLayer('itineraires');
}

//--------------------------------------//
//itiSwipeStatus
//--------------------------------------//
function itiSwipeStatus(event, phase, direction, distance) {
	var leg = $(event.target).closest('li.list-group-item').find('div > div > div > div.resultat[data-resultat]');
	//console.info('leg : ' + leg);
	if (phase == "end" && leg) {
		setTimeout(function(){
			if (direction == "right" || direction == "left") {
				if (direction == "right") {
					clickLienDetails(leg);
				} else if (direction == "left") {
					clickLienCarte(leg);
				}
			}
		} ,500);
	}
}

//--------------------------------------//
//initSwipe
//--------------------------------------//
function initSwipe(element) {

		var swipeOptions = {
				triggerOnTouchEnd: true,
				swipeStatus: itiSwipeStatus,
				allowPageScroll: "vertical",
				threshold: 150
		};
		element.swipe(swipeOptions);
}

//--------------------------------------//
//onLocalize
//--------------------------------------//
function onLocalize(options){
		
		if (options.type && options.type == 'watch') {
			app.watchID = navigator.geolocation.watchPosition(function(pos) {posSucces(pos,options.mapName,options.layerName);}, posErreur,{maximumAge: 90000, timeout: 20000, enableHighAccuracy:false});
		}
		else {
			navigator.geolocation.getCurrentPosition(function(pos) {posSucces(pos,options.mapName,options.layerName);}, posErreur,{maximumAge: 90000, timeout: 20000, enableHighAccuracy:false});
		}
		
		fct_attente_horaires(true);
}

//--------------------------------------//
//unSelectItiLogoFav
//--------------------------------------//
function unSelectItiLogoFav(){

	var rowIti = $('#bookmarkIti');

	if (($('#dep').attr('data-lonlat')=='0,0') || ($('#dep').val()=="") || ($('#dep').attr('data-commune')=="") ||
		($('#arr').attr('data-lonlat')=='0,0') || ($('#arr').val()=="") || ($('#arr').attr('data-commune')=="") ||
		($('#dep').attr('data-lonlat')==$('#arr').attr('data-lonlat'))) {
		rowIti.removeClass('favori').removeClass('favori-empty');
		return; //Il manque des champs remplis on sort.
	}
	else 
	{
		var objIti = { dep : {'lonlat' : $('#dep').attr('data-lonlat'), 'commune' : $('#dep').attr('data-commune'), 'adresse' :  $('#dep').val()},  
					   arr : {'lonlat' : $('#arr').attr('data-lonlat'), 'commune' : $('#arr').attr('data-commune'), 'adresse' :  $('#arr').val()},
					   prop : {'car' : $('#car > input').prop('checked'),'transit' : $('#transit > input').prop('checked'),"transit_pmr" : $('#transit_pmr > input').prop('checked'),
					   "walk": $('#walk > input').prop('checked'),"bike": $('#bike > input').prop('checked'),"pmr" : $('#pmr > input').prop('checked')}};

					   /*$('#car > input').prop('checked',false);
					   $('#transit > input').prop('checked',false);
					   $('#transit_pmr > input').prop('checked',false);
					   $('#walk > input').prop('checked',false);
					   $('#bike > input').prop('checked',true);
					   $('#pmr > input').prop('checked',false);*/


		//Si le favoris n'existe pas on rajouter l'icon vide sinon plein
		if (listeFavoris.isItiFavoris(listeFavoris.calculIdIti(objIti.dep.lonlat,objIti.arr.lonlat))) 
			rowIti.removeClass('favori-empty').addClass('favori');
		else 
			rowIti.removeClass('favori').addClass('favori-empty');

		rowIti.off("click").click(function(e){

			e.preventDefault();

			var objIti = { dep : {'lonlat' : $('#dep').attr('data-lonlat'), 'commune' : $('#dep').attr('data-commune'), 'adresse' :  $('#dep').val()},  
			arr : {'lonlat' : $('#arr').attr('data-lonlat'), 'commune' : $('#arr').attr('data-commune'), 'adresse' :  $('#arr').val()},
			prop : {'car' : $('#car > input').prop('checked'),'transit' : $('#transit > input').prop('checked'),"transit_pmr" : $('#transit_pmr > input').prop('checked'),
			"walk": $('#walk > input').prop('checked'),"bike": $('#bike > input').prop('checked'),"pmr" : $('#pmr > input').prop('checked')}};
			
			var id = listeFavoris.calculIdIti(objIti.dep.lonlat,objIti.arr.lonlat);
			if(listeFavoris.isItiFavoris(id))  {
				listeFavoris.removeIti(id);
				rowIti.removeClass('favori').addClass('favori-empty');
			} else {
				listeFavoris.addIti(objIti);
				rowIti.removeClass('favori-empty').addClass('favori');
			}
			return false; //évite le rechargement de la page.

		});
	}
}