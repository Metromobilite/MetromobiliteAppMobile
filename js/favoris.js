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

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
// *

//--------------------------------------//
// listeFavoris : Objet favoris
//--------------------------------------//
var listeFavoris = {
	currentLigneFavs:null,
	currentParkingFavs:null,
	//--------------------------------------//
	// addParking
	//--------------------------------------//
    addParking:function (id,libelle,type) {
        var fav = JSON.parse(window.localStorage.getItem('parkingsFavoris'));
		fav[id] = {Libelle:libelle,Type:type};
		window.localStorage.setItem('parkingsFavoris',JSON.stringify(fav));
    },
   //--------------------------------------//
	// removeParking
	//--------------------------------------//
    removeParking:function (id) {
		var fav = JSON.parse(window.localStorage.getItem('parkingsFavoris'));
		delete fav[id];
		window.localStorage.setItem('parkingsFavoris',JSON.stringify(fav));
		listeFavoris.afficheParkingFavoris();
	},
	//--------------------------------------//
	// isParkingFavoris
	//--------------------------------------//
    isParkingFavoris:function(id){
		var fav = JSON.parse(window.localStorage.getItem('parkingsFavoris'));
		return (fav!=null && typeof(fav[id])!='undefined');
	},
	//--------------------------------------//
	// addLigne
	//--------------------------------------//
    addLigne:function (codeLigne,idsArrets,nom) {
        var fav = JSON.parse(window.localStorage.getItem('lignesFavorites'));
		fav[codeLigne+','+idsArrets] = {codeLigne:codeLigne,idsArrets:idsArrets,nom:nom};
		window.localStorage.setItem('lignesFavorites',JSON.stringify(fav));
		this.currentLigneFavs = JSON.parse(window.localStorage.getItem('lignesFavorites'));
    },
    //--------------------------------------//
	// removeLigne
	//--------------------------------------//
    removeLigne:function (codeLigne,idsArrets) {
		var fav = JSON.parse(window.localStorage.getItem('lignesFavorites'));
		delete fav[codeLigne+','+idsArrets];
		window.localStorage.setItem('lignesFavorites',JSON.stringify(fav));
		this.currentLigneFavs = JSON.parse(window.localStorage.getItem('lignesFavorites'));
		listeFavoris.afficheLignesFavorites();
	},
	//--------------------------------------//
	// showLigneFav
	//--------------------------------------//
    showLigneFav:function(codeLigne,idsArrets,nom){
		var prochainsPassagesLink = ((typeof(codeLigne) != 'undefined') && (typeof(idsArrets) != 'undefined') && (typeof(nom) != 'undefined'))
		
		if (prochainsPassagesLink) {
			urlParams.codeLigne=codeLigne;
			urlParams.idsArretsTR=idsArrets;
			urlParams.nomArretsTR=nom;
		}
		
		$('#horaires_link').trigger('click');
		
		if (prochainsPassagesLink) {
			$('#prochainsPassages_link').trigger('click');
			$('#horaires>span').hide();
			ajouteLigne(codeLigne);
			ajouteLigneStatique(codeLigne);
			if(!isTaille('xxs'))
				togglePanneau(true);
		}
	},
	//--------------------------------------//
	// initParkingFavoris
	//--------------------------------------//
	initParkingFavoris:function(){
		$(document).on( 'evtPARfavorisupdated evtPKGfavorisupdated',function(e,data) {			
			var dispo;
			var now = new Date().getTime();
			for (var parking in data) {
				if (listeFavoris.isParkingFavoris(parking) && (data[parking][data[parking].length-1].dispo != -1)) {
					if (now - data[parking][data[parking].length-1].time < 9*60*1000)//On n'affiche pas les données de plus de 9min
						$('#rowFavoris #rowFavorisParking div#'+ parking + ' .delai').text(lang.appMobile.placesLibres + data[parking][data[parking].length-1].dispo);
					else
						$('#rowFavoris #rowFavorisParking div#'+ parking + ' .delai').text(lang.appMobile.placesLibres + '-');
					$('#rowFavoris #rowFavorisParking div#'+ parking + ' .placeLibre').show();
				}
			}
			if(!idTimeoutFav)
				idTimeoutFav = setTimeout(function () {$('#timesyncFav').show();idTimeoutFav=false;}, 30000);

		});
		$('#timesyncFav').click(function(e) {
			e.preventDefault();
			$('#timesyncFav').hide();
			urlParams.heure=new Date();
			listeFavoris.afficheCamFavoris();
			listeFavoris.afficheLignesFavorites();
			listeFavoris.afficheParkingFavoris();
			listeFavoris.afficheItiFavoris();	
			return; //false; supprimé pour WP
		});
		
	},
	//--------------------------------------//
	// afficheParkingFavoris
	//--------------------------------------//
    afficheParkingFavoris:function(){
		$('#rowFavoris #rowFavorisParking .fav, #rowFavoris #rowFavorisParking .vide').remove();
		
		var fav = JSON.parse(window.localStorage.getItem('parkingsFavoris'));
		
		var size=0;
		for (var n in fav) {
			var div = $('<div data-id="' + n + '" data-type="' + fav[n].Type + '" id="' + n + '" class="row fav ui-widget-content" draggable="true"><div class="col-xs-1 handle ui-draggable-handle"><span class="glyphicon glyphicon-sort-by-attributes"></span></div><div class="col-xs-11 noDrag"><span class="parking"></span><span class="arret">'+fav[n].Libelle+
			'</span><span class="pull-right"><div class="placeLibre"><div class="pull-right"><div class="delai pull-left">'+ lang.appMobile.placesLibres + '<span></span></div><div class="rss"><img  class="logoRssFav" src="img/rss.png"/></div></div></div></span>');
			$('#rowFavoris #rowFavorisParking').append(div);
			
			size++;
						
			//if (device.platform.toUpperCase() == 'ANDROID') { //sur WP et ios10, non  compatible avec le swipe
				div.find('.noDrag').click(function(){
					//if (attente) return;
					listeFavoris.showParkingFav();
				});
			//}
            
			$('#rowFavoris #rowFavorisParking > div.fav').draggable( //sur WP, le drag/drop ne fonctionne pas. On le cache en attendant une solution....
				{
					start: function( event, ui ) { 
							$(ui.helper).addClass('ui-state-highlight');
						},
					stop: function( event, ui ) { 
							$(ui.helper).removeClass('ui-state-highlight');
						},
					handle: ".handle",
					axis : 'y',
					delay: 300,
					iframeFix: true,
					opacity: 0.35,
					revert: true,
					scroll: true,
					scrollSensitivity: 100,
					scrollSpeed: 500,
					snap: true,
					snapMode: "outer"
				});
				
			$( "#rowFavoris #rowFavorisParking > div.fav" ).droppable({
				  drop: function( event, ui ) {
						attente = true;
						//sauvergarde de l'ordre
						var draggableId = ui.draggable.attr("data-id");//element à déplacer
						var droppableId = event.target.id;//element sur lequel on colle
						var saveFav = fav[draggableId];
						
						if (typeof(saveFav)=='undefined') {
							//attente = false;
							return;
						}
						
						delete fav[draggableId];
						var newFav = {};
						for (var element in fav)
						{
							//fav[id] = {Libelle:libelle};
							if (element == droppableId) {
								newFav[draggableId]  = {Libelle:saveFav.Libelle};
							}
							newFav[element] = {Libelle:fav[element].Libelle};
						}
						window.localStorage.setItem('parkingsFavoris',JSON.stringify(newFav));
						//reaffichage
						listeFavoris.afficheParkingFavoris(); 
						//attente = false;
					},
					accept:".fav",
					greedy:true
			});
			
		}
		if (size>0) {
			updatePKG("evtPKGfavorisupdated");
			updatePAR("evtPARfavorisupdated");			
		} else {
			/*$('#rowFavoris #rowFavorisParking').append('<div class="row vide"><div class="col-xs-12"><span class="arret">'+lang.aucunParkingFavoris+'</span></div></div>');
			$('#rowFavoris #rowFavorisParking .vide').click(function(){
					listeFavoris.showParkingFav();
			});*/
			listeFavoris.afficheAucunFavori();
		}
		
	},
	//--------------------------------------//
	// showParkingFav
	//--------------------------------------//
    showParkingFav:function(){
		$('#infoTrafic_link').trigger('click');
		$('#parking_link').trigger('click');
	},
	//--------------------------------------//
	// initLignesFavoris
	//--------------------------------------//
	initLignesFavoris:function(){
		$( document ).on( 'evtProchainsPassagesCharges',function(evt, type, codeArret, codeLigne, passages){
			if (!$('#rowFavoris').is(':visible')) return;
			var horaire;
			codeLigne = codeLigne.replace(':','_');
			var codes = codeLigne+'-'+codeArret;
			var dir = '.dir1';
			if(passages && passages[codeLigne] && passages[codeLigne].dir1) {
				$('#rowFavoris #rowFavorisLigne div[data-code="'+ codes +'"]'+dir+' .libDir').text(passages[codeLigne].dir1.name.toUpperCase());
				horaire = passages[codeLigne].dir1.times[0];
				if(horaire && !horaire.bTropLong) {
					$('#rowFavoris  #rowFavorisLigne div[data-code="'+ codes +'"]'+dir+' .delai').text(formatDelaiPP(moment(horaire.time)));
					$('#rowFavoris  #rowFavorisLigne div[data-code="'+ codes +'"]'+dir+'').css( "display","block");
		
					if (horaire.realtime) {
							$('#rowFavoris  #rowFavorisLigne div[data-code="'+ codes + '"]'+dir+' .rss').css( "display","inline");
							$('#rowFavoris  #rowFavorisLigne div[data-code="'+ codes +'"]'+dir+' .delai').css( "padding-right","0px");
					} else  {
							$('#rowFavoris  #rowFavorisLigne div[data-code="'+ codes +'"]'+dir+' .rss').css( "display","none");
							$('#rowFavoris  #rowFavorisLigne div[data-code="'+ codes +'"]'+dir+' .delai').css( "padding-right","18px");
					}
					var dir = '.dir2';
				}
			}
			if(passages && passages[codeLigne] && passages[codeLigne].dir2) {
				$('#rowFavoris #rowFavorisLigne div[data-code="'+ codes +'"]'+dir+' .libDir').text(passages[codeLigne].dir2.name.toUpperCase());
				horaire = passages[codeLigne].dir2.times[0];
				if(horaire && !horaire.bTropLong) {
					$('#rowFavoris #rowFavorisLigne div[data-code="'+ codes +'"]'+dir+' .delai').text(formatDelaiPP(moment(horaire.time)));
					$('#rowFavoris #rowFavorisLigne div[data-code="'+ codes +'"]'+dir).css( "display","inline-block");
					if (horaire.realtime) {

							$('#rowFavoris #rowFavorisLigne div[data-code="'+ codes +'"]'+dir+' .rss').css( "display","inline");
							$('#rowFavoris #rowFavorisLigne div[data-code="'+ codes +'"]'+dir+' .delai').css( "padding-right","0px");
					} else  {
							$('#rowFavoris #rowFavorisLigne div[data-code="'+ codes +'"]'+dir+' .rss').css( "display","none");
							$('#rowFavoris #rowFavorisLigne div[data-code="'+ codes +'"]'+dir+' .delai').css( "padding-right","18px");
					}
				}
			}	
			if(!idTimeoutFav)
				idTimeoutFav = setTimeout(function () {$('#timesyncFav').show();idTimeoutFav=false;}, 30000);
		});
	},
	//--------------------------------------//
	// afficheLignes
	//--------------------------------------//
    afficheLignesFavorites:function(){
    
		$('#rowFavoris #rowFavorisLigne .fav, #rowFavoris #rowFavorisLigne .vide').remove();
		
		var fav = JSON.parse(window.localStorage.getItem('lignesFavorites'));
		this.currentLigneFavs = fav;
		
		if (!dataLignesTC) { 
			chargeLignes(null,listeFavoris.afficheLignesFavorites);
			return;
		} 
		for (var n in fav) {
			
			var logo = getLogoLgn(fav[n].codeLigne,dataLignesTC[fav[n].codeLigne].routeShortName,'#'+dataLignesTC[fav[n].codeLigne].routeColor,false,'logoLgn','logoLgnRect');
			var name = getShortStopName(fav[n].nom);
			
			var div = $('<div data-id="'+n+'" id="'+n+'" class="row fav ui-widget-content" draggable="true"><div class="col-xs-1 handle ui-draggable-handle"><span class="glyphicon glyphicon-sort-by-attributes"></span></div><div class="col-xs-11 noDrag"><span class="ligne"></span><span class="arret">'+name+
			'</span><span class="pull-right"><div class="dir1" data-code="'+ fav[n].codeLigne + '-' + fav[n].idsArrets +'"><span class="libDir">--</span><div class="pull-right"><div class="delai pull-left"><span>--</span></div><div class="rss"><img  class="logoRssFav" src="img/rss.png"/></div></div></div><div class="dir2" data-code="'+ fav[n].codeLigne + '-' + fav[n].idsArrets+'"><span class="libDir">--</span><div class="pull-right"><div class="delai pull-left"><span>--</span></div><div class="rss"><img  class="logoRssFav" src="img/rss.png"/></div></div></div></div></div></span>');
			
			logo.appendTo(div.find('.ligne'));
			
			$('#rowFavoris #rowFavorisLigne').append(div);
			
			//if (device.platform.toUpperCase() == 'ANDROID') { //sur WP et ios10, non  compatible avec le swipe
				div.find('.noDrag').click(function(){
					//if (attente) return;
					var n = $(this).parent().attr('data-id');
					listeFavoris.showLigneFav(fav[n].codeLigne,fav[n].idsArrets,fav[n].nom);
				});
			//}
            
			$('#rowFavoris #rowFavorisLigne > div.fav').draggable( //sur WP, le drag/drop ne fonctionne pas. On le cache en attendant une solution....
				{
					start: function( event, ui ) { 
							$(ui.helper).addClass('ui-state-highlight');
						},
					stop: function( event, ui ) { 
							$(ui.helper).removeClass('ui-state-highlight');
						},
					handle: ".handle",
					axis : 'y',
					delay: 300,
					iframeFix: true,
					opacity: 0.35,
					revert: true,
					scroll: true,
					scrollSensitivity: 100,
					scrollSpeed: 500,
					snap: true,
					snapMode: "outer"
				});
				
			$( "#rowFavoris #rowFavorisLigne > div.fav" ).droppable({
				  drop: function( event, ui ) {
						attente = true;
						//sauvergarde de l'ordre
						var draggableId = ui.draggable.attr("data-id");//element à déplacer
						var droppableId = event.target.id;//element sur lequel on colle
						var saveFav = fav[draggableId];
						
						if (typeof(saveFav)=='undefined') {
							//attente = false;
							return;
						}
						
						delete fav[draggableId];
						var newFav = {};
						for (var element in fav) 
						{
							if (element == droppableId) {
								newFav[saveFav.codeLigne+','+saveFav.idsArrets]  = {codeLigne:saveFav.codeLigne,idsArrets:saveFav.idsArrets,nom:saveFav.nom};
							}
							newFav[fav[element].codeLigne+','+fav[element].idsArrets]  = {codeLigne:fav[element].codeLigne,idsArrets:fav[element].idsArrets,nom:fav[element].nom};
						}
						window.localStorage.setItem('lignesFavorites',JSON.stringify(newFav));
						//reaffichage
						listeFavoris.afficheLignesFavorites(); 
					},
					accept:".fav",
					greedy:true
			});

			getProchainsPassages('arret',fav[n].idsArrets,fav[n].codeLigne,1);
			//attente = false;
			
		}
		
		if($('#rowFavoris #rowFavorisLigne .fav').length==0) {
			listeFavoris.afficheAucunFavori();
			/*$('#rowFavoris #rowFavorisLigne').append('<div class="row vide"><div class="col-xs-12"><span class="arret">'+lang.aucuneLignesFavorites+'</span></div></div>');
			$('#rowFavoris #rowFavorisLigne .vide').click(function(){
					//if (attente) return;
					listeFavoris.showLigneFav();
				});*/
		} else {
			/*if (!$('#rowFavoris > div').hasClass('maj')) {
				$('#rowFavoris').prepend('<div class="row vide maj"><button id="rowFavorisButton" class="btn btn-default btn-xs glyphicon glyphicon-refresh pull-right" alt="Mise à jour" title="Mise à jour"></button><div id="textMajRowFavoris">' + lang.appMobile.derniereMaj + '<span class="dateHeure"></span></div></div>');
				$('#rowFavoris .dateHeure').text(moment().format('HH:mm') + '  ');
			}*/
		}
	},
	//--------------------------------------//
	// isLigneFavorite
	//--------------------------------------//
    isLigneFavorite:function(codeLigne,idsArrets){
		return (this.currentLigneFavs!=null && typeof(this.currentLigneFavs[codeLigne+','+idsArrets])!='undefined');
    },
    //--------------------------------------//
	// isCamFavorite
	//--------------------------------------//
    isCamFavorite:function(id){
        var fav = JSON.parse(window.localStorage.getItem('camFavoris'));
		return (fav!=null && typeof(fav[id])!='undefined');
    },
    //--------------------------------------//
	// addCam
	//--------------------------------------//
    addCam:function (id,lib) {
        var fav = JSON.parse(window.localStorage.getItem('camFavoris'));
		fav[id] = {libelle:lib};
		window.localStorage.setItem('camFavoris',JSON.stringify(fav));
    },
   //--------------------------------------//
	// removeCam
	//--------------------------------------//
    removeCam:function (id) {
		var fav = JSON.parse(window.localStorage.getItem('camFavoris'));
		delete fav[id];
		window.localStorage.setItem('camFavoris',JSON.stringify(fav));
		listeFavoris.afficheCamFavoris();
	},
	//--------------------------------------//
	// afficheCamFavoris
	//--------------------------------------//
    afficheCamFavoris:function(){
		$('#rowFavoris #rowFavorisCam .fav, #rowFavoris #rowFavorisCam .vide').remove();
		
		var fav = JSON.parse(window.localStorage.getItem('camFavoris'));
		
		var size=0;
		for (var n in fav) {
			var div = $('<div data-id="' + n + '" id="' + n + '" class="row fav ui-widget-content" draggable="true"><div class="col-xs-1 handle ui-draggable-handle"><span class="glyphicon glyphicon-sort-by-attributes"></span></div><div class="col-xs-10 noDrag"><span class="cam"></span><span class="camLib">'+fav[n].libelle+
			'</span></div><div class="camView pull-right"></div></div>');

			$('#rowFavoris #rowFavorisCam').append(div);

			size++;
						
			//if (device.platform.toUpperCase() == 'ANDROID') { //sur WP et ios10, non  compatible avec le swipe
			div.find('.noDrag').click(function(e){
				if (attente) return;
				e.preventDefault();
				if ($(this).parent().find('video').length) {
					$(this).parent().find('.camView').html('');	
					$("#rowFavoris > #rowFavorisCam .fav").css('display','flex');
				}					
				else
				{
					listeFavoris.afficheCam($(this));
					$("#rowFavoris > #rowFavorisCam .fav").css('display','block');
															
				}
				return false; //évite le rechargement de la page.	
			});
            
			$('#rowFavoris #rowFavorisCam > div.fav').draggable( //sur WP, le drag/drop ne fonctionne pas. On le cache en attendant une solution....
				{
					start: function( event, ui ) { 
							$(ui.helper).addClass('ui-state-highlight');
						},
					stop: function( event, ui ) { 
							$(ui.helper).removeClass('ui-state-highlight');
						},
					handle: ".handle",
					axis : 'y',
					delay: 300,
					iframeFix: true,
					opacity: 0.35,
					revert: true,
					scroll: true,
					scrollSensitivity: 100,
					scrollSpeed: 500,
					snap: true,
					snapMode: "outer"
				});
				
			$("#rowFavoris #rowFavorisCam > div.fav").droppable({
				  drop: function( event, ui ) {
						attente = true;
						//sauvergarde de l'ordre
						var draggableId = ui.draggable.attr("data-id");//element à déplacer
						var droppableId = event.target.id;//element sur lequel on colle
						var saveFav = fav[draggableId];
						
						if (typeof(saveFav)=='undefined') {
							//attente = false;
							return;
						}
						
						delete fav[draggableId];
						var newFav = {};
						for (var element in fav)
						{
							//fav[id] = {libelle:libelle};
							if (element == droppableId) {
								newFav[draggableId]  = {libelle:saveFav.libelle};
							}
							newFav[element] = {libelle:fav[element].libelle};
						}
						window.localStorage.setItem('camFavoris',JSON.stringify(newFav));
						//reaffichage
						listeFavoris.afficheCamFavoris(); 
						//attente = false;
					},
					accept:".fav",
					greedy:true
			});
			
		}
		if (size==0) {
			/*$('#rowFavoris #rowFavorisCam').append('<div class="row vide"><div class="col-xs-12"><span class="noCam">'+lang.aucuneCamFavorites+'</span></div></div>');
			
			$('#rowFavoris #rowFavorisCam .vide').click(function(){
				listeFavoris.showCamFav();
			});*/
			listeFavoris.afficheAucunFavori();
		}
		
	},
	//--------------------------------------//
	// showCamFav
	//--------------------------------------//
    showCamFav:function(){
		$('#infoTrafic_link').trigger('click');
		$('#traffic_link').trigger('click');
	},
	//--------------------------------------//
	// afficheCam
	//--------------------------------------//
    afficheCam:function(div){

		var id  = div.parent().attr('data-id');//.replace('CAM_','');

		var upToDate;
		var searchUrl;
		var details = '';
			
		searchUrl = url.ws();
		searchUrl += '/api/cam/time?';
		searchUrl += 'name=' + id + '.mp4&key='+ Math.random();
		
		$.ajax({
			type: "GET",
			url: searchUrl,
			error:error,
			dataType: 'json'
		}).then(function(response) {
			upToDate = (Math.abs(urlParams.heure.getTime() - response*1000) <= 1000*60*24) || urlParams.debug;
			
			if (upToDate) {
				searchUrl = url.ws();
				searchUrl += '/api/cam/video?name=' + id + '.mp4&key='+ Math.random();
				details = '<video width="320" height="240" controls loop><source src="' + searchUrl + '" type="video/mp4"></video>';
			} else {
				details='<p>'+lang.carteMobile.messageCAM+'</p>';
			}
			div.parent().find('.camView').html(details);
		});		
	},
	//--------------------------------------//
	// isItiFavoris
	//--------------------------------------//
    isItiFavoris:function(id){
		var fav = JSON.parse(window.localStorage.getItem('itiFavoris'));
		return (fav!=null && typeof(fav[id])!='undefined');
	},
    //--------------------------------------//
	// addIti
	//--------------------------------------//
    addIti:function (objet) {
		var fav = JSON.parse(window.localStorage.getItem('itiFavoris'));
		fav[listeFavoris.calculIdIti(objet.dep.lonlat,objet.arr.lonlat)] = objet;
		window.localStorage.setItem('itiFavoris',JSON.stringify(fav));
	},
	//--------------------------------------//
	// removeIti
	//--------------------------------------//
    removeIti:function (id) {
		var fav = JSON.parse(window.localStorage.getItem('itiFavoris'));
		delete fav[id];
		window.localStorage.setItem('itiFavoris',JSON.stringify(fav));
		listeFavoris.afficheItiFavoris();
	},
	//--------------------------------------//
	// calculIdIti
	//--------------------------------------//
    calculIdIti:function (dep,arr) {
		try {
		//Format 45.14796,5.71488 OU(!) 45.1479600001,5.7148800001
		dep  = dep.split(',')[0].substr(0,8).replace('.','') + dep.split(',')[1].substr(0,8).replace('.','');
		arr  = arr.split(',')[0].substr(0,8).replace('.','') + arr.split(',')[1].substr(0,8).replace('.','');
		return dep + arr;
		} catch(e) {
			console.log('calculIdIti, catch : ' + e.msg + ' : ' + e.lineNumber);
		}
		return '0';
	},
	//--------------------------------------//
	// afficheItiFavoris
	//--------------------------------------//
    afficheItiFavoris:function(){
		$('#rowFavoris #rowFavorisIti .fav, #rowFavoris #rowFavorisIti .vide').remove();
		
		var fav = JSON.parse(window.localStorage.getItem('itiFavoris'));
		
		var size=0;
		for (var n in fav) {
			var div = $('<div data-id="' + n + '" id="' + n + '" class="row fav ui-widget-content" draggable="true"><div class="col-xs-1 handle ui-draggable-handle"><span class="glyphicon glyphicon-sort-by-attributes"></span></div><div class="col-xs-11 noDrag"><span class="iti"></span><span class="itiLib">'+
			fav[n].dep.adresse + " - " + fav[n].arr.adresse + '</span></div><div class="itiView pull-right"></div></div>');

			$('#rowFavoris #rowFavorisIti').append(div);

			size++;
						
			//if (device.platform.toUpperCase() == 'ANDROID') { //sur WP et ios10, non  compatible avec le swipe
			div.find('.noDrag').click(function(e){
				if (attente) return;
				e.preventDefault();
				if ($(this).parent().find('video').length)
					$(this).parent().find('.itiView').html('');						
				else
					listeFavoris.showItiFav($(this).parent().attr('data-id'));
				return false; //évite le rechargement de la page.	
			});
            
			$('#rowFavoris #rowFavorisIti > div.fav').draggable( //sur WP, le drag/drop ne fonctionne pas. On le cache en attendant une solution....
				{
					start: function( event, ui ) { 
							$(ui.helper).addClass('ui-state-highlight');
						},
					stop: function( event, ui ) { 
							$(ui.helper).removeClass('ui-state-highlight');
						},
					handle: ".handle",
					axis : 'y',
					delay: 300,
					iframeFix: true,
					opacity: 0.35,
					revert: true,
					scroll: true,
					scrollSensitivity: 100,
					scrollSpeed: 500,
					snap: true,
					snapMode: "outer"
				});
				
			$( "#rowFavoris #rowFavorisIti > div.fav" ).droppable({
				  drop: function( event, ui ) {
						attente = true;
						//sauvergarde de l'ordre
						var draggableId = ui.draggable.attr("data-id");//element à déplacer
						var droppableId = event.target.id;//element sur lequel on colle
						var saveFav = fav[draggableId];
						
						if (typeof(saveFav)=='undefined') {
							//attente = false;
							return;
						}
						
						delete fav[draggableId];
						var newFav = {};
						for (var element in fav)
						{
							//fav[id] = {libelle:libelle};
							if (element == droppableId) {
								newFav[draggableId]  = {libelle:saveFav.libelle};
							}
							newFav[element] = {libelle:fav[element].libelle};
						}
						window.localStorage.setItem('itiFavoris',JSON.stringify(newFav));
						//reaffichage
						listeFavoris.afficheItiFavoris(); 
						//attente = false;
					},
					accept:".fav",
					greedy:true
			});
			
		}
		if (size==0) {
			listeFavoris.afficheAucunFavori();
			/*$('#rowFavoris #rowFavorisIti').append('<div class="row vide"><div class="col-xs-12"><span class="noIti">'+lang.aucunItiFavoris+'</span></div></div>');
			
			$('#rowFavoris #rowFavorisIti .vide').click(function(){
				listeFavoris.showItiFav();
			});*/
		}
		
		
	},
	//--------------------------------------//
	// showItiFav
	//--------------------------------------//
    showItiFav:function(id){

		if (id) {
			var fav = JSON.parse(window.localStorage.getItem('itiFavoris'));
			$('#dep').attr('data-lonlat', fav[id].dep.lonlat);
			$('#dep').attr('data-commune', fav[id].dep.commune);
			$('#dep').val(fav[id].dep.adresse);
			$('#arr').attr('data-lonlat', fav[id].arr.lonlat);
			$('#arr').attr('data-commune', fav[id].arr.commune);
			$('#arr').val(fav[id].arr.adresse);

			$('#car > input').prop('checked',fav[id].prop.car);
			$('#transit > input').prop('checked',fav[id].prop.transit);
			$('#transit_pmr > input').prop('checked',fav[id].prop.transit_pmr);
			$('#walk > input').prop('checked',fav[id].prop.walk);
			$('#bike > input').prop('checked',fav[id].prop.bike);
			$('#pmr > input').prop('checked',fav[id].prop.pmr);

		} else {
			$('#dep').attr('data-lonlat', '0,0');
			$('#dep').attr('data-commune', '');
			$('#dep').val('');
			$('#arr').attr('data-lonlat', '0,0');
			$('#arr').attr('data-commune', '');
			$('#arr').val('');

			$('#car > input').prop('checked',false);
			$('#transit > input').prop('checked',true);
			$('#transit_pmr > input').prop('checked',false);
			$('#walk > input').prop('checked',true);
			$('#bike > input').prop('checked',true);
			$('#pmr > input').prop('checked',false);
		}

		unSelectItiLogoFav();

		$('#iti_link').trigger('click');
	},
	//--------------------------------------//
	// afficheAucunFavori
	//--------------------------------------//
    afficheAucunFavori:function(){
		
		$('#rowFavoris #rowFavorisAucun').html('');

		if ((window.localStorage.getItem('itiFavoris') == '{}') && 
			(window.localStorage.getItem('camFavoris') == '{}') &&
			(window.localStorage.getItem('parkingsFavoris') == '{}') &&
			(window.localStorage.getItem('lignesFavorites') == '{}'))
		{
			$('#rowFavoris #rowFavorisAucun').append('<div class="row vide"><div class="col-xs-12"><span class="noIti">'+lang.aucunFavoris+'</span></div></div>');
		}
	}
	
};