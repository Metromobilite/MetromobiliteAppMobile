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

var colorsFavoris={actif:'orange',inactif:'buttonface'};
var modeleListeLigne = $('#modele > ul > li > a');
var modeleDivLigne = $('#modele > div.ligne.contenu');
var modeleDivLigneOnglet = $('#modele > div.ligne.onglet');
var modeleDivContenuHoraires = $('#modele > div.horaires.contenu');
var modeleDivPassage = $('#modele > div.passage');
var modeleDivFicheHoraire = $('#modele > div.ficheHoraire');
var selectedDir = 'dir1';
var idTimeoutPP =false;
var idTimeoutPKG =false;
var idTimeoutEvtsTC =false;
var idTimeoutFav =false;


//--------------------------------------//
// togglePanneau
//--------------------------------------//
function togglePanneau(bVisible) {

	if(typeof(bVisible)!= 'undefined') {
		$('#liste').toggle(bVisible);
	} else {
		$('#liste').toggle();
	}
}

//--------------------------------------//
// getLisLgn
//--------------------------------------//
function getLisLgn(data) {
	for (r in data) {
		var route = data[r];
		var li = modeleListeLigne.clone();
		//li.addClass(nomLayer.replace(' ','_'));
		var code = route.code;
		var color = '#'+route.routeColor;
		var numero = route.routeShortName;
		var libelle = route.routeLongName;
		li.attr('id',code).attr('title',numero+' - '+libelle).attr('href','#'); ; //pour Chrome
		var logo = getLogoLgn(code,numero,color,0,'logo','logoRect');
		$(logo).find('title').text(numero+' - '+libelle); //pour vieux Firefox
		li.append(logo);
		$('#listeLignes').find('.'+route.type).append(li);
	}
	tri('#listeLignes .TRAM','a','','id');
	tri('#listeLignes .CHRONO','a','','id');
	tri('#listeLignes .PROXIMO','a','','id');
	tri('#listeLignes .FLEXO','a','','id');
	tri('#listeLignes .C38','a','','id');
	
	$('#panel').show();
}

//--------------------------------------//
// showLigne
//--------------------------------------//
function showLigne(code) {
	$('#ppOnglets div.active').removeClass('active');
	$('#ppOnglets > div[data-code='+code+']').addClass('active');
	$('#pp > div').hide();
	$('#pp > div[data-code='+code+']').show();
}
function showLigneStatique(code) {
	$('#horairesOnglets div.active').removeClass('active');
	$('#horairesOnglets > div[data-code='+code+']').addClass('active');
	$('#horaires > div').hide();
	$('#horaires > div[data-code='+code+']').show();
}
//--------------------------------------//
// ajouteLigne
//--------------------------------------//
function ajouteLigne(code) {
	var _this = $('#'+code)[0];
	$('#timesyncPP').hide();
	if (typeof(_this)=='undefined') {
		console.log('ajouteLigne $(#+code)[0] undefined');
		return;
	}
	$('#horairesText').hide();
	var ligne = {code:_this.id,libelle:_this.title};
	if($('#pp div[data-code='+_this.id+']').length ==0) {
		var divHoraire = modeleDivLigne.clone();
		divHoraire.attr('data-code',_this.id);
		$('#pp').append(divHoraire);				
		var onglet = modeleDivLigneOnglet.clone();
		onglet.attr('data-code',_this.id);
		var lgn = dataLignesTC[_this.id];
		onglet.css('background-color','#'+lgn.color);
		onglet.css('color','#'+lgn.textColor);
		var pictoMode = getPictoMode(lgn.mode.toLowerCase());
		$(pictoMode).css('fill','#'+lgn.textColor);
		onglet.find('.modeLigne').append(pictoMode);
		onglet.find('.numLigne').text(lgn.shortName);		
		$('#ppOnglets').append(onglet);
	}
	
	showLigne(_this.id);
	getListeArretsLigne(_this.id);
	
	var nombreOnglet = $('#ppOnglets div.ligne').length;
	if ((isTaille('xxs') || isTaille('xs') || isTaille('sm')) && (nombreOnglet>1)) { supprimePremiereLigne(); }
	else if (nombreOnglet>5) { supprimePremiereLigne(); }
	
	if(isTaille('xxs') || isTaille('xs')) togglePanneau(false);

}
function ajouteLigneStatique(code) {
	var _this = $('#'+code)[0];
	
	if (typeof(_this)=='undefined') {
		console.log('ajouteLigneStatique $(#+code)[0] undefined');
		return;
	}
	$('#horairesTextStatique').hide();
	var ligne = {code:_this.id,libelle:_this.title};
		
		
	if($('#horaires div[data-code='+_this.id+']').length ==0) {
		var divHoraire = modeleDivLigne.clone();
		divHoraire.attr('data-code',_this.id);
		$('#horaires').append(divHoraire);				
		var onglet = modeleDivLigneOnglet.clone();
		onglet.attr('data-code',_this.id);
		var lgn = dataLignesTC[_this.id];
		onglet.css('background-color','#'+lgn.color);
		onglet.css('color','#'+lgn.textColor);
		var pictoMode = getPictoMode(lgn.mode.toLowerCase());
		$(pictoMode).css('fill','#'+lgn.textColor);
		onglet.find('.modeLigne').append(pictoMode);
		onglet.find('.numLigne').text(lgn.shortName);		
		$('#horairesOnglets').append(onglet);
	}
	
	showLigneStatique(_this.id);
	lanceHoraires();
	
	var nombreOnglet = $('#horairesOnglets .ligne').length;
	if ((isTaille('xxs') || isTaille('xs') || isTaille('sm')) && (nombreOnglet>3)) { supprimePremiereLigneStatique(); }
	else if (nombreOnglet>5) { supprimePremiereLigneStatique(); }
}
function getPictoMode(mode) {
	var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 48 48">';
	switch(mode){
		case('bus'):
			svg += '<path d="M8,32c0,1.76,0.78,3.34,2,4.439V40c0,1.1,0.9,2,2,2h2c1.1,0,2-0.9,2-2v-2h16v2c0,1.1,0.9,2,2,2h2c1.1,0,2-0.9,2-2v-3.561c1.221-1.1,2-2.68,2-4.439V12c0-7-7.16-8-16-8S8,5,8,12V32z M15,34c-1.66,0-3-1.34-3-3s1.34-3,3-3s3,1.34,3,3S16.66,34,15,34zM33,34c-1.66,0-3-1.34-3-3s1.34-3,3-3s3,1.34,3,3S34.66,34,33,34z M36,22H12V12h24V22z"/>';
		break;
		case('pieton'):
			svg += '<path d="M27,11c2.2,0,4-1.8,4-4s-1.8-4-4-4s-4,1.8-4,4S24.8,11,27,11z M19.6,17.8L14,46h4.2l3.6-16l4.2,4v12h4V31l-4.2-4l1.2-6c2.6,3,6.6,5,11,5v-4c-3.8,0-7-2-8.6-4.8l-2-3.2c-0.801-1.2-2-2-3.4-2c-0.6,0-1,0.2-1.6,0.2L12,16.6V26h4v-6.8L19.6,17.8"/>';
		break;
		case('train'):
			svg += '<path d="M24,4C16,4,8,5,8,12v19c0,3.859,3.14,7,7,7l-3,3v1h4.46l4-4H28l4,4h4v-1l-3-3c3.859,0,7-3.141,7-7V12C40,5,32.84,4,24,4zM15,34c-1.66,0-3-1.34-3-3s1.34-3,3-3s3,1.34,3,3S16.66,34,15,34z M22,20H12v-8h10V20z M26,20v-8h10v8H26z M33,34c-1.66,0-3-1.34-3-3s1.34-3,3-3s3,1.34,3,3S34.66,34,33,34z"/>';
		break;
		case('tram'):
			svg += '<path d="M38,33.88V17c0-5.58-5.221-6.8-12.02-6.98L27.5,7H34V4H14v3h9.5l-1.52,3.04C15.72,10.22,10,11.46,10,17v16.88c0,2.9,2.38,5.32,5.18,5.94L12,43v1h4.46l4-4H28l4,4h4v-1l-3-3h-0.16C36.221,40,38,37.26,38,33.88z M24,37c-1.66,0-3-1.34-3-3s1.34-3,3-3s3,1.34,3,3S25.66,37,24,37z M34,28H14V18h20V28z"/>';
		break;
		case('velo'):
			svg += '<path d="M31,11c2.2,0,4-1.8,4-4s-1.8-4-4-4s-4,1.8-4,4S28.8,11,31,11z M10,24C4.4,24,0,28.4,0,34s4.4,10,10,10s10-4.4,10-10S15.6,24,10,24z M10,41c-3.8,0-7-3.2-7-7s3.2-7,7-7s7,3.2,7,7S13.8,41,10,41z M21.6,21l4.8-4.8l1.6,1.6c2.6,2.6,6,4.2,10.2,4.2v-4c-3,0-5.4-1.2-7.2-3l-3.8-3.8c-1-0.8-2-1.2-3.2-1.2s-2.2,0.4-2.8,1.2l-5.6,5.6c-0.8,0.8-1.2,1.8-1.2,2.8c0,1.2,0.4,2.2,1.2,2.8L22,28v10h4V25.6L21.6,21z M38,24c-5.6,0-10,4.4-10,10s4.4,10,10,10s10-4.4,10-10S43.6,24,38,24z M38,41c-3.8,0-7-3.2-7-7s3.2-7,7-7s7,3.2,7,7S41.8,41,38,41z"/>';
		break;
		case('voiture'):
			svg += '<path d="M37.84,12.02C37.439,10.84,36.32,10,35,10H13c-1.32,0-2.42,0.84-2.84,2.02L6,24v16c0,1.1,0.9,2,2,2h2c1.1,0,2-0.9,2-2v-2h24v2c0,1.1,0.9,2,2,2h2c1.1,0,2-0.9,2-2V24L37.84,12.02z M13,32c-1.66,0-3-1.34-3-3s1.34-3,3-3s3,1.34,3,3S14.66,32,13,32z M35,32c-1.66,0-3-1.34-3-3s1.34-3,3-3s3,1.34,3,3S36.66,32,35,32z M10,22l3-9h22l3,9H10z"/>';
		break;
		default:
			svg='';
	}
	svg+='</svg>'
	return $(svg);
}

function checkSaisie(ligne) {
		return ligne && ligne.code;
}

function lanceHorairesAuto() {
	if (attente) return;
	var ligne = dataLignesTC[$('#horairesOnglets > div.active').attr('data-code')];
	if(checkSaisie(ligne)) {
		var date = getDateHeureSaisie();
		getDataHoraires(ligne,date.getTime());
	}
}

function getDataHoraires(ligne,time) {
	var searchUrl = (url.saisieChoisie=='local'?url.hostnameLocal+url.portWSTest:url.hostnameData);
	searchUrl += '/api/ficheHoraires/json?route='+ligne.code.replace('_',':')+'&time='+time+(url.otp2Router=='local'?'':'&router='+url.otp2Router);
	fct_attente_horaires(true);
	$.ajax({
		type: "GET",
		url: searchUrl,
		error:error,
		dataType: 'json'
	}).then(function(res) {
		fct_attente_horaires(false);
		$( document ).trigger( 'evtHorairesCharges', [ligne, time,res] );
		if(!!res['0'].pivot2 || !!res['1'].pivot2) {
			var searchUrl = url.ws();
			searchUrl += '/api/ficheHoraires/json?route='+ligne.code.replace('_',':')+'&time='+time+(url.otp2Router=='local'?'':'&router='+url.otp2Router);
			if(!!res['0'].pivot2) {
				searchUrl += '&pivot_0_stop_id='+res['0'].pivot2.stop_id+'&pivot_0_delai='+res['0'].pivot2.delai;
			}
			if(!!res['1'].pivot2) {
				searchUrl += '&pivot_1_stop_id='+res['1'].pivot2.stop_id+'&pivot_1_delai='+res['1'].pivot2.delai;
			}
			fct_attente_horaires(true);
			$.ajax({
				type: "GET",
				url: searchUrl,
				error:error,
				dataType: 'json'
			}).then(function(res) {
				fct_attente_horaires(false);
				$( document ).trigger( 'evtHorairesCharges', [ligne, time,res,true] );
			});
		}
	});
}

function getDateHeureSaisie() {
	// on decale la demande si elle est entre 0h et 3h car sinon pas de resultat
	var d = $('#datepickerStatique input').val();
	var t = $('#timepickerStatique input').val();
	if (parseInt(t.split(':')[0]) < 3) {
		var date = moment.utc(d+' 23:59:59','DD/MM/YYYY HH:mm:ss').subtract(24,'hours').toDate();
		// on commence par l'heure car ca redeclenche l'evt et ca donne une boucle infinie si on commence par la date
		$('#timepickerStatique').data("DateTimePicker").date(date);
		$('#datepickerStatique').data("DateTimePicker").date(date);
	}
	return moment.utc($('#datepickerStatique input').val()+' '+$('#timepickerStatique input').val(), 'DD/MM/YYYY HH:mm').toDate();
}
function lanceHoraires() {
	//uniquemet pour les horaires statiques
	var date = getDateHeureSaisie();
	var codeligne=$("#horairesOnglets .ligne.active").attr('data-code');
	var ligne = dataLignesTC[$('#horairesOnglets > div.active').attr('data-code')];
	getDataHoraires(ligne,date.getTime());
}

//--------------------------------------//
// supprimePremiereLigne
//--------------------------------------//
function supprimePremiereLigne() {
	$('#ppOnglets > div.ligne:nth-of-type(1)').remove();
	$('#pp > div.ligne:nth-of-type(1)').remove();
}
function supprimePremiereLigneStatique() {
	$('#horairesOnglets > div.ligne:nth-of-type(1)').remove();
	$('#horaires > div.ligne:nth-of-type(1)').remove();
}

//--------------------------------------//
// initPageHoraires
//--------------------------------------//
function initPageHoraires() {
	getLisLgn(dataLignesTC);
			
	$('#rowHoraires .toggleListe').click(function(){
		togglePanneau();
	});
	$('#listeLignes').on('click','a.svgLigne',function(e){
		var code = this.id;
		//On ajoute la ligne aux 2 écrans
		ajouteLigne(code);
		ajouteLigneStatique(code);
		//$('#pp>span').hide();!!!!!!!!!!!!!!!
	});
	
	$( document ).on( "evtHorairesCharges", {}, function( event, ligne, time,res,b2Contenus) {
				afficheHoraires(ligne, time,res,b2Contenus);
			});

	$( document ).on( 'evtProchainsPassagesCharges',function(evt, type, codeArret, codeLigne, passages){
		if (!$('#rowHoraires').is(':visible')) return;
		//var rows='';
		//var bAucunPassage = true;
		var codeLgn = codeLigne.replace(':','_');
		var divArret= $('#ppOnglets div[data-code='+codeLgn+'] .arret');
		afficheContenu(passages, codeLgn, divArret, $('#pp div[data-code='+codeLgn+'] .tableau'));
	});
	function afficheContenu(passages, codeLgn, divArret, divConteneur) {
		var bAucunPassage = true;
		var arretName = divArret.text();
		divConteneur.find('.contenu').remove();
		var contenu = modeleDivContenuHoraires.clone();

		if(passages[codeLgn]) {
		//ajout icon favori - Elhadj
			if (isfavorisPresent(codeLgn.substring(0, 3))){
				var idFav = divArret.attr('data-code').replace('_',':');
				var logoFav = getLogoFav(lang.appMobile.FAVORIS,colorsFavoris,idFav ,idFav + " favorisArret",isArretfavori(codeLgn ,divArret.attr('data-code')));
				contenu.find('.favori').append(logoFav);
				logoFav.click(function(){
					//var codeligne=$("#ppOnglets .ligne.active").attr('data-code').replace('_',':');
					var parentStation= divArret.attr('data-code') ;//$("#ppOnglets .ligne.active .arret"); 
					//ajout de l'arret sélectionné
					toogleProchainPassageArretFavori ($(this), codeLgn.replace('_',':'), parentStation,colorsFavoris);
				});
			}
			for (var d in passages[codeLgn]) {
				var bAucunPassageDestination = true;
				var dir = passages[codeLgn][d];
				dir.class = d;
				if(dir && (dir.name.trim().toUpperCase().latinise().split(arretName).length<2)) {
					dir.times.forEach(function(e){
						if(!e.bTropLong) {
							var divPassage = modeleDivPassage.clone();
							divPassage.find('.destination .texte').text(e.dest);
							divPassage.find('.delai .texte').text(formatDelaiPP(moment(e.time)));
							if(!e.realtime) divPassage.find('.delai .logoRss').hide();
							contenu.find('.'+dir.class).append(divPassage);
							bAucunPassage=false;
							bAucunPassageDestination=false;
						}
					});
					if(!bAucunPassageDestination)
						1==1;
				}
			}
			if(!bAucunPassage) {
				var texte = $('<div aria-hidden="true"><img alt="'+lang.horairesTheoriques+'" src="img/rss.png"/>' + lang.horairesTheoriques+'</div>');
				contenu.append(texte);
				var infoComplementaire = contenu.find('.cellEvenement');
				if (dataEvtsTC[codeLgn]) { // Evenement sur la ligne
					var cpt = 0;
					for(var index in dataEvtsTC[codeLgn]) {
						if (isEvenementEnCours(dataEvtsTC[codeLgn][index].ddeb,dataEvtsTC[codeLgn][index].dfin))
						{
							if 	(cpt++ == 0) {
								infoComplementaire.append('<span>' + lang.horaires.perturbation + '</span><br><br>');
							}
							infoComplementaire.append('<span>'+ dataEvtsTC[codeLgn][index].comment + '</span><br><br>');
						infoComplementaire.show();
						}
					}
				}
			} else {
				contenu.append('<div>'+lang.aucunHoraireTR+'</div>');
			}
		} else {
			contenu.append('<div>'+lang.donneesManquantes+'</div>');
		}
		divConteneur.append(contenu);
		if(!idTimeoutPP)
			idTimeoutPP = setTimeout(function () {$('#timesyncPP').show();idTimeoutPP=false;}, 30000);
	}

	$( document ).on( 'evtArretsLigneCharges',function(evt,ligne,zones){
		var opts = "";
		var divLigneEnCours = $('#pp div[data-code='+ligne+']');
		divLigneEnCours.find('.tableau .contenu').remove();
		var orderedList = [];
		zones.forEach(function(z,i){
			var name;
			if(ligne.substr(0,3)!='C38')
				name = z.name;
			else
				name = z.name+' - '+z.city;
			orderedList.push({arr:z.code,name:name});
		});

		/*for(arr in zones) {
			var name;
			if(ligne.substr(0,3)!='C38')
				name = getShortStopName(zones[arr]);
			else
				name = zones[arr].split(',').reverse().join(' - ');
			orderedList.push({arr:arr,name:name});
		}*/
		var triOrdreAlphabetique = window.localStorage.getItem('horairestries');
		if ( triOrdreAlphabetique != null && triOrdreAlphabetique =='tri-oa'){
			orderedList = orderedList.sort(function (a, b) {
				if (a.name > b.name) return 1;
				if (a.name < b.name) return -1;
				return 0;
			});
		}
		var arretToTrigger = false;
		// id fav
		var idFav = 'fav_'+ligne.replace('_','');
		
		for (var j=0;j<orderedList.length;j++) {
			var selected = '';
			if ((urlParams.nomArretsTR || urlParams.idsArretsTR) && (
				decodeURI(urlParams.nomArretsTR) == orderedList[j].name
				|| urlParams.idsArretsTR == orderedList[j].arr)
			) {
				arretToTrigger = orderedList[j].arr;
				urlParams.nomArretsTR=false;
				urlParams.idsArretsTR=false;
			}
			var logoF = getLogoFav(lang.appMobile.FAVORIS,colorsFavoris,idFav,idFav + " favorisArret", true) //divArret.attr('data-code')));
			opts+='<li class="arrets" data-code="'+orderedList[j].arr+'"><span style="width:calc( 100% - 88px )">' + orderedList[j].name +  '</span>'+(isArretfavori(ligne ,orderedList[j].arr)?'<div style="width:88px" class="logofav"> </div>': ' ')+'</li>';
		} 
		var arrets = $('<div class="list-arrets"><ul><li class="arrets" data-code="">' + lang.horaires.choixArret + '</li>'+ opts +'</ul></div>');
		
		divLigneEnCours.find('.tableau .list-arrets').remove();
		divLigneEnCours.find('.tableau').append(arrets);
		divLigneEnCours.find('.logofav').append(logoF);
		divLigneEnCours.find('.arrets').click(onChangeArretTR);
			
		if(arretToTrigger) {
			if (urlParams.codeLigne) {
				showLigne(urlParams.codeLigne);
				showLigneStatique(urlParams.codeLigne);
			}
			divLigneEnCours.find('.arrets[data-code="'+arretToTrigger+'"]').trigger('click');
		}					
	});

	function onChangeArretTR(e,val) {
		var code = $('#ppOnglets > div.active').attr('data-code');
		if (!code)
			code = $('#horairesOnglets > div.active').attr('data-code');
		var ligne = {code:code,libelle:$('#ppOnglets > div.active title').text()};
		if (!ligne)
			ligne = {code:code,libelle:$('#horairesOnglets > div.active title').text()};
		//if (!val) val = $(this).val();
		var maligne = $('#pp .ligne[data-code='+code+']');
		var monOngletBookmark = $('#ppOnglets .ligne[data-code='+code+'] .bookmark');
		if (!val) val = $(this).attr("data-code");
		if (val != "") {
			var arr = val;
			var divLigneOngletEnCours = $('#ppOnglets div[data-code='+ligne.code+']');
			divLigneOngletEnCours.find('.groupeArret.hidden').removeClass('hidden');
			if(divLigneOngletEnCours.find('.arret').attr('data-code')!=arr) {
				divLigneOngletEnCours.find('.arret').attr('data-code',arr).text($(this).text());
			}
			
			getProchainsPassages('arret',val.replace('_',':'),ligne.code.replace('_',':'),5);
			
			
			maligne.find('.list-arrets').hide();
			//maligne.find('.bookmark').remove();
			//maligne.find('select').parent().append('<div class="favori-empty bookmark"></div>');
			//maligne.find('.bookmark').click(onClickBookmark);
			//maligne.find('.bookmark').show();
		} else {
			monOngletBookmark.removeClass('favori favori-empty');
		}
		if(listeFavoris.isLigneFavorite(ligne.code,val)) //TODO passer egalement le nom pour recherche par code ou  nom
			monOngletBookmark.removeClass('favori-empty').addClass('favori');
		else 
			monOngletBookmark.removeClass('favori').addClass('favori-empty');
		return;
	}

	$('#ppOnglets').on('click','div.ligne:not(.active)',function(e){
		var code = $(this).attr('data-code');
		showLigne(code);
		showLigneStatique(code);
	});
	$('#horairesOnglets').on('click','div.ligne:not(.active)',function(e){
		var code = $(this).attr('data-code');
		showLigneStatique(code);
		ajouteLigne(code);
	});
	/*$('#pp').on('change','select.onglets',function(e){
		$(this).parent().next().find('table').hide();
		var selectedIndex = $(this)[0].selectedIndex+1;
		$(this).parent().next().find(':nth-child('+selectedIndex+')').show();
		$(':nth-child('+selectedIndex+') .glyphicon-screenshot').hide();
	});
	
	$('#horaires').on('change','select.onglets',function(e){
		$(this).parent().next().find('.contenuDir').hide();
		var selectedIndex = $(this)[0].selectedIndex+1;
		$(this).parent().next().find('.contenuDir:nth-child('+selectedIndex+')').show();
		$('.contenuDir:nth-child('+selectedIndex+') .glyphicon-screenshot').hide();
	});*/
	$('#horaires').on('click','.ficheHoraireDirection',function(e){
		$(this).closest('.ligne').find('div.direction').toggleClass('active');
	});
	$('#horaires').on('click','.boutonsHoraires > .ficheHoraireInfos',function(e){
		$(this).closest('.ligne').find('div.horairesTextInfos').toggle();
		$(this).toggleClass('active');
	});
	$('#horaires').on('click','.boutonsHoraires > .ficheHoraireEvenement',function(e){
		$(this).closest('.ligne').find('div.horairesEvtLigne').toggle();
		$(this).toggleClass('active');
	});
	$('#horaires').on('click','.horairesPrecedents, .horairesSuivants',function(e){
		var time = $(this).attr('data-time');
		//TODO selectedDir = $(this).closest('.tableau').find('select.onglets').val();
		selectedDir = ($(this).closest('.tableau').find('div.contenu > .direction.active').hasClass('dir2')?'dir2':'dir1');
		var code = $(this).closest('.ligne').attr('data-code');
		var ligne = dataLignesTC[code];
		getDataHoraires(ligne,time);
	});		

	$('#ppOnglets').on('click','.bookmark',onClickBookmark);
	$('#ppOnglets').on('click','.groupeArret',function(e){
		e.preventDefault();
		var codeLigne = $('#ppOnglets div.ligne.active').attr('data-code');
		getListeArretsLigne(codeLigne);
		return false;
	});
	$('#timepickerStatique input').val(moment().format("HH:mm"));

	$('#timesyncPP').click(function(e) {
		e.preventDefault();
		var arretToTrigger = $('#ppOnglets div.ligne.active .arret').attr('data-code');
		onChangeArretTR(null,arretToTrigger);
		$('#timesyncPP').hide();
		return false; //évite le rechargement de la page.
	});	
	
	/*var parent;
	
	if (getMobileOperatingSystem() == 'iOS')
		parent = $('#datepickerStatique > .input-group-addon');
	else
		parent = $('#timepickerStatique > .input-group-addon');
	*/
	$('#datepickerStatique').datetimepicker({
		locale: 'fr',
		format: 'DD/MM/YYYY',
		allowInputToggle:true,
		defaultDate:urlParams.date,
		ignoreReadonly:true,
		//todayHighlight:true,
		//clearBtn:true, marche pas...
		//widgetParent:$('#timepickerStatique > .input-group-addon'),
		showClose:true,
		//debug:true
});

	$('#timepickerStatique').datetimepicker({
		locale: 'fr',
		format: 'HH:mm',
		allowInputToggle:true,
		defaultDate:urlParams.heure,
		ignoreReadonly:true,
		//widgetParent:$('#datepickerStatique > .input-group-addon'),
		showClose:true,
		//debug:true
	});

	$('#datepickerStatique, #timepickerStatique').on('dp.hide',function(){
		lanceHorairesAuto();
	});
}
//--------------------------------------//
// afficheHoraires
//--------------------------------------//
function afficheHoraires(ligne, time,res,b2Contenus) {
	var divConteneur = $('#horaires div[data-code='+ligne.code+'] .tableau');
	selectedDir = (divConteneur.find('div.contenu > .direction.active').hasClass('dir2')?'dir2':'dir1');
	if(!b2Contenus) divConteneur.find('.contenu').remove();
	var contenu = modeleDivContenuHoraires.clone();
	divConteneur.append(contenu);
	
	//divConteneur.empty();
	var span = $('<span><label for="arretSelect'+ligne.code+'">' + lang.horaires.Direction + ' </label></span>');
	var onglets = $('<select id="arretSelect'+ligne.code+'" class="onglets form-control"></select>');
	//var contenuOnglets = $('<div class="contenuOnglets"></div>');
	var codeLigne = ligne.code.split('_')[1];

	/*if (ligne.shortName == '66') {
		divConteneur.append($('<div id="messageErreurHoraires">'  + lang.libelleMessageErreurHoraires + '</div>'));
		contenuOnglets.attr('style','height: calc(100% - 100px);');
		if ( ligne.code.indexOf( "SEM_" ) != -1 ) {
			var liensFicheTag = $('<tfoot><tr><td colspan="8"><span class="pull-left glyphicon glyphicon-plus-sign"></span><a href="http://www.tag.fr/ftp/fiche_horaires/fiche_horaires_2014/HORAIRES_'+ligne.code.replace('SEM_','')+'" target="_blank" class="fichesHorairesTag">' + lang.libelleFicheTag + '</a></td></tr></tfoot>');
			
			divConteneur.append(liensFicheTag);
		}
		return;
	}*/
	
	var deuxDirectionsVides = true;
	for (var i=0;i<2;i++) {
		var contenuDir = contenu.children('.dir'+(i+1));
		var ficheHoraire = modeleDivFicheHoraire.clone();
		var tableauVide = true;
		var dir = res[i].arrets;

		//var table = $('<table></table>');
		//var tbody = $('<tbody></tbody>');
		//table.append(tbody);
		var tbody = ficheHoraire.find('tbody');
		
		for (var j=0;j<dir.length;j++) {
			var arr = dir[j];
			var row = $('<tr></tr>');
			var arret = "";
			var stopName = (ligne.type=='TRAM' || ligne.type=='NAVETTE' || ligne.type=='CHRONO' || ligne.type=='PROXIMO'?getShortStopName(arr.stopName):arr.stopName) ;
			if (urlParams.tc)
				var arret = $('<td title="'+arr.stopName.split(',')[0]+'"><span style="display:none;"></span>&nbsp;' + stopName +'</td>');
			else
				var arret = $('<td title="'+arr.stopName.split(',')[0]+'"><span class="glyphicon glyphicon-screenshot" style="display:none;"></span>&nbsp;' + stopName +'</td>');
			row.append(arret);
			row.attr('data-lonlat',arr.lat+','+arr.lon);
			row.attr('data-arr-code',arr.stopId);
			
			//icone rond.
			var rond = $('<td class="rondhoraire"><div></div></td>');
			row.append(rond);
			
			for (var k=0;k<arr.trips.length;k++) {
				var heure = "|";
				var h = parseInt(arr.trips[k]);
				if (!isNaN(h)) heure = moment.utc(h*1000).format('HH:mm');
				var date = moment.utc(new Date(Math.floor(time))).format('DD/MM/YYYY');
				var tripHoraire = $('<td title="'+date+'" alt="'+date+'">'+ heure +'</td>');
				row.append(tripHoraire);
			}
			tbody.append(row);
			if (tableauVide) tableauVide=false;
		}
		deuxDirectionsVides = tableauVide && deuxDirectionsVides;
		//var contenuDir = $('<div class="contenuDir"></div>');
		//contenuOnglets.append(contenuDir);
		/*if(dir.length>0) {
			onglets.append('<option>'+dir[dir.length-1].stopName+'</option>');
			
		}*/
		
		var nbTripsAffiches = 4;
		var heureSuivant = res[i].nextTime;
		var heurePrecedent  = res[i].prevTime;
		
		if (tableauVide) {
			var message = $('<span>'+lang.alertHoraire[1]+' : '+moment.utc(new Date(Math.floor(time))).format('HH:mm')+'</span><br/>');
			ficheHoraire.find('.horairesText').append(message);
			ficheHoraire.find('.horairesPrecedents, .horairesSuivants').hide();
		} else {
			ficheHoraire.find('.horairesPrecedents')
				.attr('data-time',heurePrecedent)
				.attr('title',lang.libelleAffiche_1 + nbTripsAffiches + lang.libelleHorairePrec_2)
				.attr('alt',lang.libelleAffiche_1 + nbTripsAffiches + lang.libelleHorairePrec_2);
			ficheHoraire.find('.horairesSuivants')
				.attr('data-time',heureSuivant)
				.attr('title',lang.libelleAffiche_1 + nbTripsAffiches +lang.libelleHoraireSuivant_2)
				.attr('alt',lang.libelleAffiche_1 + nbTripsAffiches +lang.libelleHoraireSuivant_2);
			
			ficheHoraire.find('.directionLabel').text(lang.horaires.Direction);
			ficheHoraire.find('.directionText').text(dir[dir.length-1].stopName);
		}
		//ficheHoraire.find('.matable').append(table);
		//divConteneur.find('.dir'+(i+1)).append(ficheHoraire);
		contenu.find('.dir'+(i+1)).append(ficheHoraire);

		tbody.on('click','td',function(e){
			$( this ).parents('tr').toggleClass( 'highlightLigne',this.clicked );
		});
		tbody.on('click','.glyphicon-screenshot',function(e){
			app.afficheLien($('#rowMapProxi'),lang.appMobile.autour);
			$('body').css({"background-color":"#E4E4E4"});
			app.initProxi(true);
			
			var map=getMap('mapProxi');
			var lonlat = $(this ).parents('tr').attr('data-lonlat').split(',');
			
			if (map && lonlat && lonlat.length==2) {
				map.getView().setCenter(ol.proj.transform([parseFloat(lonlat[1]),parseFloat(lonlat[0])], "EPSG:4326", sm));
			}
			
			trackPiwik("Application Mobile : Autour de moi");
			//window.open('planTC.html?lonlatDep='+$(this ).parents('tr').attr('data-lonlat') + '&codeArr='+$(this ).parents('tr').attr('data-arr-code'))
		});
	}
	divConteneur.find('.boutonDirection').toggle(!deuxDirectionsVides);
	
	if (ligne.type == 'FLEXO') {
		
		contenu.find('.boutonsHoraires > .ficheHoraireInfos').show();
		divConteneur.find('.horairesTextInfos').text((codeLigne != "62"?lang.libelleMessageFlexo:lang.libelleMessageFlexo62));
	}
	if ( ligne.code.indexOf( "SEM_" ) != -1 ) {
		//var liensFicheTag = $('<tfoot><tr><td colspan="8"><span class="pull-left glyphicon glyphicon-plus-sign"></span><a href="" target="_blank" class="fichesHorairesTag">' + lang.libelleFicheTag + '</a></td></tr></tfoot>');
		var lienPdf = contenu.find('.boutonsHoraires > .ficheHorairePdf');
		lienPdf.attr('href',url.ws() + '/api/ficheHoraires/pdf?route='+ligne.code.replace('_',':'));
		lienPdf.show();
	}
	if (dataEvtsTC[ligne.code]) {
		var lienEvt = contenu.find('.boutonsHoraires > .ficheHoraireEvenement');
		lienEvt.show();
		var evts='';
		for(var evt in dataEvtsTC[ligne.code]){
			evts += dataEvtsTC[ligne.code][evt].comment+'<br>';
		}
		contenu.find('.horairesEvtLigne').html(evts);
	}
	var boutonDirection = contenu.find('.ficheHoraireDirection');
	boutonDirection.attr('data-codeLigne',ligne.code);
	contenu.find('.boutonsHoraires').show();
	if (selectedDir) {
		divConteneur.find('.direction.active').removeClass('active');
		divConteneur.find('.'+selectedDir).addClass('active');
	}
}

//--------------------------------------//
// onClickBookmark
//--------------------------------------//
//TODO a remanier (ids > code ZA
function onClickBookmark(e){
	e.preventDefault();
	//bookmark
	var divLigne = $('#ppOnglets div.ligne.active');
	var code = divLigne.attr('data-code');
	var divArret = divLigne.find('.arret');
	var arr = divArret.attr('data-code');
	var nom = divArret.text();
	
	if(listeFavoris.isLigneFavorite(code,arr)) {
		listeFavoris.removeLigne(code,arr);
		divLigne.find('.bookmark').removeClass('favori').addClass('favori-empty');
	} else {
		listeFavoris.addLigne(code,arr,nom);
		divLigne.find('.bookmark').removeClass('favori-empty').addClass('favori');
	}
}
