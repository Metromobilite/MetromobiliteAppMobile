// *
// Metromobilité is the mobile application of Grenoble Alpes Métropole <http://www.metromobilite.fr/>.
// It provides all the information and services for your travels in Grenoble agglomeration.

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
var paramsModesOTP = {
	walk:{
		mode:'WALK'
	},
	transit:{
		mode:'WALK,TRANSIT',
		showIntermediateStops:true,
		minTransferTime:60,
		boardSlack:30,
		alightSlack:30,
		numItineraries:3,
		walkBoardCost:5*60,
		bikeBoardCost:10*60
	},
	bikeTransit:{
		mode:'BICYCLE,TRANSIT',
		showIntermediateStops:true,
		bikeSpeed:5.56,
		minTransferTime:60,
		boardSlack:30,
		alightSlack:30,
		numItineraries:3,
		walkBoardCost:5*60,
		bikeBoardCost:10*60,
		optimize:'TRIANGLE',
		triangleSlopeFactor:0.33,
		triangleTimeFactor:0.33,
		triangleSafetyFactor:0.34
	},
	bike:{
		mode:'BICYCLE',
		//bikeSpeed:5.56,//20km/h
		bikeSpeed:4.44,//16km/h
		optimize:'TRIANGLE',
		triangleSlopeFactor:0.33,
		triangleTimeFactor:0.33,
		triangleSafetyFactor:0.34
	},
	carPR:{
		mode:'WALK,CAR,TRANSIT',
		carParkCost:60 * 15,
		showIntermediateStops:true,
		minTransferTime:60,
		boardSlack:30,
		alightSlack:30,
		numItineraries:3,
		walkBoardCost:5*60,
		bikeBoardCost:10*60,
	},
	car:{
		mode:'CAR',
		carParkCost:60 * 15,
		carDropoffTime:120
	},
	walkSpeed:1.1112,
	walkReluctance:5
	//walkReluctance:2
};
if (urlParams.forceOtp2) {
	paramsModesOTP.carPR={
		mode:'WALK,CAR_PARK,TRANSIT',
//		carParkCost:60 * 15,
		showIntermediateStops:true,
		minTransferTime:60,
		transferPenalty:1800,
		boardSlack:30,
		alightSlack:30,
		numItineraries:1,
		walkBoardCost:5*60,
		bikeBoardCost:10*60,
		//maxPreTransitTime:60*60,
		//maxWalkDistance:1000,
		carDropoffTime:120,
		maxTransfers:1
	};
	paramsModesOTP.bike={
		mode:'BICYCLE',
		//bikeSpeed:5.56,//20km/h
		bikeSpeed:4.44,//16km/h
		optimize:'TRIANGLE',
		triangleSlopeFactor:0.33,
		triangleTimeFactor:0.33,
		triangleSafetyFactor:0.34,
		stairsReluctance:4.0
	};
	paramsModesOTP.bikeTransit={
		mode:'BICYCLE,TRANSIT',
		bikeSwitchCost:5*60,
		//bikeSpeed:5.56,//20km/h
		bikeSpeed:4.44,//16km/h
		optimize:'TRIANGLE',
		triangleSlopeFactor:0.33,
		triangleTimeFactor:0.33,
		triangleSafetyFactor:0.34,
		stairsReluctance:4.0
	};
	paramsModesOTP.transit={
		mode:'WALK,TRANSIT',
		showIntermediateStops:true,
		minTransferTime:60,//transferSlack
		boardSlack:30,
		alightSlack:30,
		transferPenalty:60,
		numItineraries:3,
		walkBoardCost:5*60,
		bikeBoardCost:10*60
	};
}
var paramsPmr ={
	maxWalkDistance:1000,
	wheelchair:true
};
var bAttente = false;
var tabAttentes = {};
//pour memoire
//map.getView().setCenter(evt.feature.getGeometry().getCoordinates());
var dragEnCours = false;
var featureDragged = false;
var sourceDepArr;
var sourceIti;
var layerIti;
var map;

//--------------------------------------//
// onClickCarte
//--------------------------------------//
function onClickCarte(coord) {
	var type;
	if(!sourceDepArr.dep) {
		type = 'dep';
	} else if(!sourceDepArr.arr) {
		type = 'arr';
		// on arrete d'ajouter des feature, 2 suffisent
		map.singleClickCallback=false;
	} else {
		map.singleClickCallback=false;
		return;
	}
	placeDepArr(type,coord);
	var coordDeg = ol.proj.transform(coord,"EPSG:3857" , "EPSG:4326");
	var lonlat = coordDeg[1]+','+coordDeg[0];
	getClickCarte(type,lonlat);
}

//--------------------------------------//
// finDrag
//--------------------------------------//
function finDrag(e,feature) {
	try{
		dragEnCours=false;
		var type = feature.get('typeDep');
		var coordDeg = ol.proj.transform(feature.getGeometry().getCoordinates(),"EPSG:3857" , "EPSG:4326");
		var lonlat = coordDeg[1]+','+coordDeg[0];
		getClickCarte(type,lonlat);
		unSelectItiLogoFav();
	} catch(ev){
		console.log(ev.msg+' : '+ev.lineNumber);
	}
}

//--------------------------------------//
// placeDepArr
//--------------------------------------//
function placeDepArr(type,coord) {
	var geom = new ol.geom.Point(coord);
	
	/*if (sourceDepArr[type]) {//migration OL4
		console.log(sourceDepArr[type]);
		map.featuresOverlay.getSource().removeFeature(sourceDepArr[type]);
	}*/
	
	var featureOldById = map.featuresOverlay.getSource().getFeatureById(type);
	
	if (featureOldById) {
		map.featuresOverlay.getSource().removeFeature(featureOldById);
	}
	
	var fe = new ol.Feature({
		'geometry': geom,
		'typeDep':type,
		'type':type
	});
	
	fe.setId(type);
	
	map.featuresOverlay.getSource().addFeature(fe);
	
	sourceDepArr[type] = fe;
	fe.on('change',function(e){ 
		try{
			if (!dragEnCours) {
				/*featureDragged = e.target;*/
				dragEnCours=true;
				map.once('pointerup', function(ev){
					finDrag(ev,e.target);
					ev.preventDefault();
					ev.stopPropagation();
				});
			}
		} catch(evt){
			console.log(evt.msg+' : '+evt.lineNumber);
		}
	});
}

//--------------------------------------//
// getClickCarte
//--------------------------------------//
function getClickCarte(depOuArr,lonlat) {
	switch(depOuArr) {
		case 'dep':
			urlParams.lonlatDep=lonlat;
			urlParams.dep=false;
			break;
		case 'arr':
			urlParams.lonlatArr=lonlat;
			urlParams.arr=false;
			break;
		default:
	}
	$('#'+depOuArr).val('');
	$('#'+depOuArr).attr('data-commune','');
	setParamsForm();
	unSelectItiLogoFav();
}

//--------------------------------------//
// SaisieReussie
//--------------------------------------//
function SaisieReussie(typeDepArr,item) {
	urlParams[typeDepArr]=item.label;
	urlParams['lonlat'+typeDepArr]=item.lat+','+item.lon;
	$('#'+typeDepArr).attr('data-lonlat',item.lat+','+item.lon);
	$('#'+typeDepArr).attr('data-commune',item.commune);
	$('#'+typeDepArr).attr('data-type',item.type);
	$('#'+typeDepArr).val(item.label);
	$('#'+typeDepArr).parents('.input-group').toggleClass('has-error',false);
	$('#'+typeDepArr).attr('data-maPosition',false);

	unSelectItiLogoFav();
	
	setTimeout(function () {$('#'+typeDepArr).blur();}, 0); //cache le clavier sur mobile
	
	if(item.numeroNonTrouve) {
		$('#'+typeDepArr).parent().after('<span class="help-block help-'+typeDepArr+'">'+lang.numeroNonTrouve+'</span>');
	} else {
		$('.help-'+typeDepArr).remove();
	}
	placeDepArr(typeDepArr,ol.proj.transform([item.lon,item.lat],"EPSG:4326" , "EPSG:3857"));
	lanceCalculAuto();
}

//--------------------------------------//
// initForm
//--------------------------------------//
function initForm() {
	try{
		//console.log(moment().format("HH:mm:ss.SSS") + ' initForm 0');
		ajouteAutocomplete('#dep', {
			arrets:true,
			lieux:true,
			rues:true,
			fnSaisieReussie:function(item){ return SaisieReussie('dep',item);},
			fnSaisieRatee:function(item){ 
				urlParams.lonlatDep='0,0'; 
				$('#dep').attr('data-lonlat','0,0');
				$('#dep').attr('data-maPosition',false);
			}
		});
		ajouteAutocomplete('#arr',{
			arrets:true,
			lieux:true,
			rues:true,
			fnSaisieReussie:function(item){ return SaisieReussie('arr',item);},
			fnSaisieRatee:function(item){
				urlParams.lonlatArr='0,0';
				$('#arr').attr('data-lonlat','0,0');
				$('#arr').attr('data-maPosition',false);
			}
		});
		
		//console.log(moment().format("HH:mm:ss.SSS") + ' initForm 1');
		
		$('#datepickerIti').datetimepicker({
					locale: lang.momentLocale,
					format: 'DD/MM/YYYY',
					allowInputToggle:true,
					defaultDate:urlParams.date,
					ignoreReadonly:true,
					showClose:true
					//showTodayButton:true
				});
		$('#timepickerIti').datetimepicker({
					locale: lang.momentLocale,
					format: 'HH:mm',
					allowInputToggle:true,
					defaultDate:urlParams.heure,
					ignoreReadonly:true,
					showClose:true
				});
		$('#datepickerIti,#timepickerIti').on('dp.hide',function(){
			var date = $('#datepickerIti').data("DateTimePicker").date().toDate();
			var heure = $('#timepickerIti').data("DateTimePicker").date().toDate();
			date.setHours(heure.getHours(),heure.getMinutes());
			urlParams.heure = date;
			urlParams.date = date;
		});

		//console.log(moment().format("HH:mm:ss.SSS") + ' initForm 2');
		//modes spécifiques (Hamo, Vélo,tc,voiture)
		if (urlParams.velo) {
			$('#car > input').prop('checked',false);
			$('#transit > input').prop('checked',false);
			$('#transit_pmr > input').prop('checked',false);
			$('#walk > input').prop('checked',false);
			$('#bike > input').prop('checked',true);
			$('#pmr > input').prop('checked',false);
		} else if (urlParams.tc) {
			$('#car > input').prop('checked',false);
			$('#transit > input').prop('checked',true);
			$('#transit_pmr > input').prop('checked',true);
			$('#walk > input').prop('checked',false);
			$('#bike > input').prop('checked',false);
			$('#pmr > input').prop('checked',false);
		} else if (urlParams.voiture) {
			$('#car > input').prop('checked',true);
			$('#transit > input').prop('checked',false);
			$('#transit_pmr > input').prop('checked',false);
			$('#walk > input').prop('checked',false);
			$('#bike > input').prop('checked',false);
			$('#pmr > input').prop('checked',false);
		}		
		//gestion des combinaisons de modes
		$('#modes input, #modesPieton input').click(function(e){
			e.stopImmediatePropagation();
			//$(this).input('toggle');
			
			var car=$('#car > input').prop('checked');
			var transit=$('#transit > input').prop('checked') || $('#transit_pmr > input').prop('checked');
			var walk=$('#walk > input').prop('checked');
			var bike=$('#bike > input').prop('checked');
			var pmr=$('#pmr > input').prop('checked');
			
			switch(e.target.value) {
				case 'car':
					break;
				case 'transit':
					break;
				case 'walk':
					break;
				case 'bike':
					if (bike && pmr) {
						$('#pmr > input').prop('checked',false);
						pmr = false;
					}
					break;
				case 'pmr':
					if (bike && pmr) {
						$('#bike > input').prop('checked',false);
						bike = false;
					}
					break;
				default:
			}
						
			if (!car && !transit && !walk  && !bike) {
				$('#transit > input').prop('checked',true);
				$('#walk > input').prop('checked',true);
			}			
		});
		
		$('#itiDetails .lien-resultats').click(function(e){
				$('#itiDetails').addClass('removed').on('animationend webkitAnimationEnd oAnimationEnd',function(){
					$('#itiDetails').toggle(false);
					$('#itiDetails').removeClass('removed');
					$('#iti').toggle(true);
				});
				
			return false;
		});
		
		$('#calculer').click(function(e){
		
			if (($('#dep').attr('data-lonlat')=='0,0') || ($('#arr').attr('data-lonlat')=='0,0')) {
				alert(lang.alert[0]);
			} else if ($('#dep').attr('data-lonlat') == $('#arr').attr('data-lonlat')) {
				alert(lang.alert[1]);
			} else {
				lanceCalcul();
			}
			
			return false;
		});
		
		$('#ongletPieton, #ongletPmr').click(function(e) {
			$('#ongletsPietonPmr > div').removeClass('active');
			$(this).addClass('active');
			
			$('#bike, #walk').toggle($('#ongletPieton').hasClass('active'));
			$('#pmr').toggle($('#ongletPmr').hasClass('active'));
			$('#transit_pmr').toggle($('#ongletPmr').hasClass('active'));
			$('#transit').toggle(!$('#ongletPmr').hasClass('active'));
				
		});

		$('#togglePanelsParams').click(toggleParams);
		$('#togglePanelsResultats').click(toggleResultats);
		
		$('#iti-params-inverse').click(function(e){
			var nom = $('#arr').val();
			var lonlat = $('#arr').attr('data-lonlat');
			var commune = $('#arr').attr('data-commune');
			
			$('#arr').val($('#dep').val());
			$('#arr').attr('data-lonlat', $('#dep').attr('data-lonlat'));
			$('#arr').attr('data-commune',$('#dep').attr('data-commune'));

			$('#dep').val(nom);
			$('#dep').attr('data-lonlat', lonlat);
			$('#dep').attr('data-commune',commune);

			if (sourceDepArr.dep) {
				sourceDepArr.dep.set('type','arr');
				sourceDepArr.arr.set('type','dep');
				sourceDepArr.dep.set('typeDep','arr');
				sourceDepArr.arr.set('typeDep','dep');
				
				var f = sourceDepArr.arr;
				sourceDepArr.arr = sourceDepArr.dep;
				sourceDepArr.dep = f;
			}
			unSelectItiLogoFav();
			
			lanceCalculAuto();
			return false;
		});
		$('#ap_av').change(function(){
			urlParams.ap_av=$('#ap_av').val();
		});
		$(".hasclear").keyup(function () {
			var t = $(this);
			t.nextAll('.saisie_clear').toggle(Boolean(t.val()));
		});
		$(".saisie_clear").hide($(this).prevAll('input').val());
		$(".saisie_clear").click(function () {
			$(this).prevAll('input').val('').focus();
			$(this).hide();
			unSelectItiLogoFav();
		});
		
		$('#panel-heading-resultats-precedent').click(function(e){
			urlParams.heure.setMinutes(urlParams.heure.getMinutes() - 15);
			$('#timepickerIti').data("DateTimePicker").date(urlParams.heure);
			$('#datepickerIti').data("DateTimePicker").date(urlParams.date);
			$('#calculer').click();
		});
		$('#panel-footer-resultats-suivant').click(function(e){
			urlParams.heure.setMinutes(urlParams.heure.getMinutes() + 15);
			$('#timepickerIti').data("DateTimePicker").date(urlParams.heure);
			$('#datepickerIti').data("DateTimePicker").date(urlParams.date);
			$('#calculer').click();
		});

	} catch(e) {
		console.log(e.msg+' : '+e.lineNumber);
	}
}

//--------------------------------------//
// toggleParams
//--------------------------------------//
function toggleParams(e,bMasquer) {
	if (typeof(bMasquer)=='undefined') bMasquer = $('#togglePanelsParams .glyphicon').hasClass('glyphicon-resize-small');
	$('#itiParams .panel-body').toggle(!bMasquer);
	$('#itiParams .panel-footer').toggle(!bMasquer);
	$('#itiParams').parent().toggleClass('headingMini',bMasquer);
	$('#itiParams h1').toggle(!bMasquer);
	if(bMasquer) {
		$('#togglePanelsParams .glyphicon').removeClass('glyphicon-resize-small').addClass('glyphicon-resize-full');
	} else {
		$('#togglePanelsParams .glyphicon').removeClass('glyphicon-resize-full').addClass('glyphicon-resize-small');
	}
	return false;
}

//--------------------------------------//
// toggleResultats
//--------------------------------------//
function toggleResultats(e,bMasquer) {
	if (typeof(bMasquer)=='undefined') bMasquer = $('#togglePanelsResultats .glyphicon').hasClass('glyphicon-resize-small');
	$('#iti ul.list-group').toggle(!bMasquer);
	$('#iti').parent().toggleClass('headingMini',bMasquer);
	$('#iti h2').toggle(!bMasquer);
	
	if(bMasquer)
		$('#togglePanelsResultats .glyphicon').removeClass('glyphicon-resize-small').addClass('glyphicon-resize-full');
	else 
		$('#togglePanelsResultats .glyphicon').removeClass('glyphicon-resize-full').addClass('glyphicon-resize-small');
		
	return false;
}

//--------------------------------------//
// erreurPosition
//--------------------------------------//
function erreurPosition(error) {
	$('#dep').val('');
	fct_attente(false,'geoloc');
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
	alert(info);
}

//--------------------------------------//
// maPosition
//--------------------------------------//
function maPosition(position) {
	if ((typeof(app) != 'undefined') && app.watchID) navigator.geolocation.clearWatch(app.watchID);
	var coord = ol.proj.transform([position.coords.longitude,position.coords.latitude],"EPSG:4326" , "EPSG:3857");
	var type='dep';
	$('#' + type).attr('data-maPosition',true);
	placeDepArr(type,coord);
	getClickCarte(type,position.coords.latitude + ',' + position.coords.longitude);
	fct_attente(false,'geoloc');
}

//--------------------------------------//
// geolocClick
//--------------------------------------//
function geolocClick() {
	if (!bAttente) {
		$('#dep').val(lang.rechercheEnCours);
		navigator.geolocation.getCurrentPosition(maPosition, erreurPosition,{maximumAge: 10000, timeout: 10000, enableHighAccuracy:true});
		fct_attente(true,'geoloc');
	}
	return false;
}

//--------------------------------------//
// $('#geoloc').click
//--------------------------------------//
$('#geoloc').click(function(){
	return geolocClick();
});

//--------------------------------------//
// setParamsForm
//--------------------------------------//
function setParamsForm() {
try{
		if(urlParams.lonlatDep!="0,0") {
			$('#dep').attr('data-lonlat',urlParams.lonlatDep);
			if(urlParams.dep) $('#dep').val(urlParams.dep);
			if(urlParams.communeDep) $('#dep').attr('data-commune',urlParams.communeDep);
			placeDepArr("dep",ol.proj.transform([parseFloat(urlParams.lonlatDep.split(',')[1]),parseFloat(urlParams.lonlatDep.split(',')[0])],"EPSG:4326" , "EPSG:3857"));
		}
		if(urlParams.lonlatArr!="0,0") {
			$('#arr').attr('data-lonlat',urlParams.lonlatArr);
			if(urlParams.arr) $('#arr').val(urlParams.arr);
			if(urlParams.communeArr) $('#arr').attr('data-commune',urlParams.communeArr);
			placeDepArr("arr",ol.proj.transform([parseFloat(urlParams.lonlatArr.split(',')[1]),parseFloat(urlParams.lonlatArr.split(',')[0])],"EPSG:4326" , "EPSG:3857"));
		}
		
		completeDepArr('dep');
		completeDepArr('arr');
		$('#ap_av').val(urlParams.ap_av);
		if (urlParams.pmr) {
			$('#pmr').toggleClass('active',true);
			$('#transit').toggleClass('active',true);
			$('#transit_pmr').toggleClass('active',true);
			$('#ongletPmr').trigger('click');
		}
		
		if (urlParams.centerDep && urlParams.lonlatDep!="0,0") {
			map.getView().setCenter(ol.proj.transform([parseFloat(urlParams.lonlatDep.split(',')[1]), parseFloat(urlParams.lonlatDep.split(',')[0])], "EPSG:4326", "EPSG:3857"));
			urlParams.centerDep = false;
		} 
		else if (urlParams.centerArr && urlParams.lonlatArr!="0,0") {
			map.getView().setCenter(ol.proj.transform([parseFloat(urlParams.lonlatArr.split(',')[1]), parseFloat(urlParams.lonlatArr.split(',')[0])], "EPSG:4326", "EPSG:3857"));
			urlParams.centerArr = false;
		}		
		lanceCalculAuto();
		
		

	} catch(e) {
		console.log(e);
		fct_attente(false);
	}
}

//--------------------------------------//
// completeDepArr
//--------------------------------------//
function completeDepArr(type) {
	var champ = $('#'+type);
	if ((champ.attr('data-lonlat') != '0,0') && (champ.val() =='')) {
		champ.attr('data-type','RUE');
		if ($('#dep').attr('data-maPosition'))
			champ.val(lang.maPosition);
		else
			champ.val(lang.pointCarte);
	}
}

//--------------------------------------//
// validateParamsForm
//--------------------------------------//
function validateParamsForm() {
	$('#dep').parents('.input-group').toggleClass('has-error',$('#dep').attr('data-lonlat')=="0,0");
	$('#arr').parents('.input-group').toggleClass('has-error',$('#arr').attr('data-lonlat')=="0,0");
	return $('#itiParams .has-error').length==0;
}

//--------------------------------------//
// getParamsForm
//--------------------------------------//
function getParamsForm() {

	var car=$('#car > input').prop('checked');
	var transit=$('#transit> input').prop('checked');
	var walk=$('#walk> input').prop('checked');
	var bike=$('#bike> input').prop('checked') && $('#ongletPieton').hasClass('active');
	var pmr = $('#pmr> input').prop('checked') && $('#ongletPmr').hasClass('active');
	var keyModes = car+'|'+transit+'|'+walk+'|'+bike;
	var modes = [];
	
	if (walk && !transit) modes.push(paramsModesOTP.walk);
	if (transit && (!(transit && bike) || (transit && bike && walk))) modes.push(paramsModesOTP.transit);
	if (transit && bike) modes.push(paramsModesOTP.bikeTransit);
	if (bike) modes.push(paramsModesOTP.bike);
	//mode voiture avec P+R tout le temps
	if(car) {
		modes.push(paramsModesOTP.car);
		modes.push(paramsModesOTP.carPR);
	}
	
	var urlPlan =  url.otp() + '/plan?routerId='+url.routerChoisi;

	var paramsOTP = {
		fromPlace:$('#dep').attr('data-lonlat'),
		toPlace:$('#arr').attr('data-lonlat'),
		arriveBy:''+($('#ap_av').val()=='A'),
		time:$('#timepickerIti input').val(),
		date:moment($('#datepickerIti').data("DateTimePicker").date()).format('YYYY-MM-DD'),
		ui_date:$('#datepickerIti').val(),
		walkSpeed:paramsModesOTP.walkSpeed,
		walkReluctance:paramsModesOTP.walkReluctance,
		locale:lang.OTPlocale
	};
	
	var stdParams='';
	for (var p in paramsOTP) {
		stdParams+='&'+p+'='+paramsOTP[p];
	}
	if (pmr) {
		for (var p in paramsPmr) {
			stdParams+='&'+p+'='+paramsPmr[p];
		}
	}
	while (req = modes.shift()) {
		var modeParams ='';
		for (var pa in req) {
			if(pa && req[pa])
				modeParams+='&'+pa+'='+req[pa];
		}
		requetes.push({url:urlPlan+modeParams+stdParams,key:keyModes+stdParams});
	}
	keyAAfficher = keyModes+stdParams;
}

//--------------------------------------//
// fct_attente
//--------------------------------------//
function fct_attente(bAtt,nom) {
try {
	if (bAtt) {
		if(nom) tabAttentes[nom]=true;
	} else {
		if(nom && tabAttentes[nom]) delete tabAttentes[nom];
	}
	
	var bAttendre = (Object.keys(tabAttentes).length != 0);

	if (bAttendre) {
		$('#calculer').addClass('disabled');//.button(lang.calculEnCours);
		$('#iti-params-inverse').addClass('disabled');
		//map.removeInteraction(modify);
		$('#map').addClass('attenteCurseur');
		if ($('#logoMetroMobilite').size()) setTimeout(function() {$('#logoMetroMobilite').find('animateTransform')[0].beginElement();}, 400);
		if ($('#wait').size()) $('#wait').show();
	} else {
		$('#calculer').removeClass('disabled');//.button('reset');
		$('#iti-params-inverse').removeClass('disabled');
		//map.addInteraction(modify);
		$('#map').removeClass('attenteCurseur');
		if ($('#logoMetroMobilite').size()) setTimeout(function() {$('#logoMetroMobilite').find('animateTransform')[0].endElement();}, 500);
		if ($('#wait').size()) $('#wait').hide();
	}
	bAttente = bAttendre;
	
	} catch(e) {
		console.log(e.msg+' : '+e.lineNumber);
		fct_attente(false);
	}
}

//--------------------------------------//
// lanceCalculAuto
//--------------------------------------//
function lanceCalculAuto() {
	if($('#dep').attr('data-lonlat')!="0,0" && $('#arr').attr('data-lonlat')!="0,0")
	if(requetes.length==0) lanceCalcul();
		
}

//--------------------------------------//
// lanceCalcul
//--------------------------------------//
function lanceCalcul() {
	if (!validateParamsForm()) return;
	getParamsForm();
	sourceIti.clear();fct_attente(true,'calcul');	
	lanceRequete();
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

	$.ajax({
		type: "GET",
		url: req.url,
		timeout:10000,
		success:function(data){ return parseResultats(data,req);},
		error:errorOTP,
		dataType:(urlParams.forceOtp2?'json':'jsonp') //json pour WP8 -> surcharge en attendant OTP2!
	}).error(function (error) {
		lanceRequete();
		fct_attente(false,'calcul');
	});
	
	trackPiwik("MetroMobilité : Demande calcul d'itinéraire");
}

//--------------------------------------//
// parseResultats
//--------------------------------------//
function parseResultats(data,req) {
	
	if (!resultats[req.key]) {
		resultats[req.key]={itineraries:[],req:{}};
	}
	resultats[req.key].req[req.url]={};
	resultats[req.key].req[req.url].error = data.error;
	resultats[req.key].req[req.url].requestParameters = data.requestParameters;
	if(data.plan) {
		for (var i=0;i< data.plan.itineraries.length;i++) {
			var iti = data.plan.itineraries[i];
			iti.requestParameters=data.requestParameters;
			resultats[req.key].itineraries.push(iti);
		}
		//resultats[req.key].itineraries = resultats[req.key].itineraries.concat(data.plan.itineraries);
		resultats[req.key].from = data.plan.from;
		resultats[req.key].to = data.plan.to;
		resultats[req.key].date = data.plan.date;
	}
	lanceRequete();
}

//--------------------------------------//
// analyseResultats
//--------------------------------------//
function analyseResultats(key){
	if (!resultats[keyAAfficher]) {
		console.log('analyseResultats : Pas de résultat!');
		return;
	}
	var requetes = resultats[keyAAfficher].req;
	resultats[keyAAfficher].nbReqOk=0;
	resultats[keyAAfficher].errors={};
	for (var r in requetes) {
		if(!requetes[r].error || requetes[r].error == null) {
			resultats[keyAAfficher].nbReqOk++;
			continue;
		} else {
			resultats[keyAAfficher].errors[""+requetes[r].error.id]=requetes[r].error.msg;
		}
	}
	//console.log('ok : '+resultats[keyAAfficher].nbReqOk+(resultats[keyAAfficher].errors?' Err : '+Object.keys(resultats[keyAAfficher].errors).length:''));
}

//--------------------------------------//
// prepareResultats
//--------------------------------------//
function prepareResultats(key) {
	//todo filtre resultats a completer
	resultats[keyAAfficher].itineraries = resultats[keyAAfficher].itineraries.filter(function(iti,indexIti){
		var distanceTotale = 0;
		var consoCO2Totale = 0;
		var alerts = "";
		var communeDep = $('#dep').attr('data-commune');
		var communeArr = $('#arr').attr('data-commune');
		iti.legs=iti.legs.filter(function(leg,i,legs) {
		if(iti.requestParameters.mode.indexOf('TRANSIT')!=-1
			&& $('#dep').attr('data-type')=='ARRET'
			&& ($('#dep').attr('data-commune')+' '+$('#dep').val()).toUpperCase()==leg.to.name.toUpperCase()
			&& (leg.mode == 'WALK' || leg.mode == 'BICYCLE') //Depart de la zone d'arrêt pour aller au poteau
			) {
				iti.startTime=legs[i+1].startTime;
				// a priori walkTime et walkDistance ont l'air de designer le velo aussi
				iti.walkTime=iti.walkTime-(leg.endTime-leg.startTime);
				iti.walkDistance=iti.walkDistance-(leg.distance);
				return false||urlParams.debug;
			}
			if(iti.requestParameters.mode.indexOf('TRANSIT')!=-1
			&& $('#arr').attr('data-type')=='ARRET'
			&& ($('#arr').attr('data-commune')+' '+$('#arr').val()).toUpperCase()==leg.from.name.toUpperCase()
			&& (leg.mode == 'WALK' || leg.mode == 'BICYCLE') //Arrivée à la zone d'arrêt depuis le poteau
			) {
				iti.endTime=legs[i-1].endTime;
				// a priori walkTime et walkDistance ont l'air de designer le velo aussi
				iti.walkTime=iti.walkTime-(leg.endTime-leg.startTime);
				iti.walkDistance=iti.walkDistance-(leg.distance);
				return false||urlParams.debug;
			}
			leg.from.name = getShortStopName(leg.from.name);
			leg.to.name = getShortStopName(leg.to.name);
			
			if (leg.from.name) {
				var indexCommune = leg.from.name.toUpperCase().indexOf(communeDep);
				if(indexCommune==0) {
					leg.from.name = leg.from.name.substr(indexCommune+communeDep.length);
				}
				indexCommune = leg.from.name.toUpperCase().indexOf(communeArr);
				if(indexCommune==0) {
					leg.from.name = leg.from.name.substr(indexCommune+communeArr.length);
				}
			}
			if (leg.to.name) {
				indexCommune = leg.to.name.toUpperCase().indexOf(communeDep);
				if(indexCommune==0) {
					leg.to.name = leg.to.name.substr(indexCommune+communeDep.length);
				}
				indexCommune = leg.to.name.toUpperCase().indexOf(communeArr);
				if(indexCommune==0 && leg.to.name) {
					leg.to.name = leg.to.name.substr(indexCommune+communeArr.length);
				}
			}
			
			//Si on se gare en voiture à Grenoble et environs, on rajoute 'DELAI_STATIONNEMENT_PARKING' minutes
			var DELAI_STATIONNEMENT_PARKING = 10;

			if ((i == legs.length-1) && (legs[i].mode == 'CAR') && estDansZoneStationnement(communeArr)) {
						legs[i].arrivalDelay = DELAI_STATIONNEMENT_PARKING * 60 *1000;
						iti.arrivalDelay = legs[i].arrivalDelay;
			} else 	iti.arrivalDelay = 0;
					
			distanceTotale+=leg.distance;
			leg.consoCO2=calculCO2(leg.mode,leg.distance);
			consoCO2Totale += leg.consoCO2;
			if (!iti.typeTrajet) {
				iti.typeTrajet='';
			}
			iti.typeTrajet = typeTrajet(iti.typeTrajet,leg.mode);
			if (leg.alerts) {
				for (var a=0;a< leg.alerts.length;a++) {
					if (leg.alerts[a].alertHeaderText.someTranslation != "PME") {
						if (leg.alerts[a].alertDescriptionText)
							if(leg.alerts[a].alertDescriptionText.someTranslation)
								alerts+=leg.alerts[a].alertDescriptionText.someTranslation+'<br/>';
							else
								alerts+=leg.alerts[a].alertDescriptionText+'<br/>';
						else if(leg.alerts[a].someTranslation)
								alerts+=leg.alerts[a].someTranslation+'<br/>';
						else 
							alerts+=leg.alerts[a].alertHeaderText;
					}
				}
			}
		
			return true;
		});

		iti.distanceTotale=distanceTotale;
		iti.consoCO2Totale=consoCO2Totale;
		iti.messageCO2=buildMessage(distanceTotale, iti.typeTrajet, consoCO2Totale);
		iti.alerts=alerts;
		
		//filtre les velo+tc si il retournent que du velo car on a forcement aussi demandé le velo tout seul dans une autre requete.
		if(iti.typeTrajet == 'Velo' && iti.requestParameters.mode=='BICYCLE,TRANSIT') {
			return false||urlParams.debug;
		}
		//filtre les resultat iRoad sans iRoad si dans les autres trajets si on a du TC
		/*if(iti.typeTrajet.substr(0,16) != 'Voiture partagée' && iti.typeTrajet.substr(0,16) != 'Voiture partagée' && iti.requestParameters.mode=='WALK,TRANSIT,CUSTOM_MOTOR_VEHICLE') {
			for (var j=0; j<resultats[keyAAfficher].itineraries.length-1; j++) {
				if (resultats[keyAAfficher].itineraries[j].typeTrajet == "TC" && resultats[keyAAfficher].itineraries[j].requestParameters.mode!='WALK,TRANSIT,CUSTOM_MOTOR_VEHICLE')
					return false||urlParams.debug;
			}
			return false||urlParams.debug;
		}*/
		return true;
	});
}

//--------------------------------------//
// 
//--------------------------------------//
function initSwipe(element) {
	return; //utilisé par les appli mobile dans surcharge
}

//--------------------------------------//
// afficheResultats
//--------------------------------------//
function afficheResultats() {
	fct_attente(false,'calcul');
	if(isTaille('xs') || isTaille('xxs')) toggleParams(false,true);
	$('#iti').toggle(true);
	$('#itiDetails').toggle(false);
	//$('#iti > .list-group > li:not(:first-child)').remove();
	$('#iti > .list-group > li').remove();
	analyseResultats(keyAAfficher);
	//tester le nombre d'erreurs
	if (!resultats[keyAAfficher]) {
		return; //TODO a traiter
	}
	if (resultats[keyAAfficher].nbReqOk==0) {
		
		var li = $('#iti .template li.list-group-item').clone();
		li.find('.col-xs-12').empty();
		for (m in resultats[keyAAfficher].errors) {
			if ((m == '500' && resultats[keyAAfficher].errors.count>1) || m!='500') {
			li.append('<p>'+resultats[keyAAfficher].errors[m]+'</p>');
			console.error(m+' : '+resultats[keyAAfficher].errors[m]);
			}
		}
		li.appendTo('#iti > .list-group');
		
		//todo ameliorer affichage des erreurs
	} else {
	
		if(($('#dep').val()==lang.pointCarte) || ($('#dep').val()==lang.maPosition)) $('#dep').val(resultats[keyAAfficher].from.name);
		if(($('#arr').val()==lang.pointCarte) || ($('#arr').val()==lang.maPosition)) $('#arr').val(resultats[keyAAfficher].to.name);
		
		if(!resultats[keyAAfficher].itineraries[0].distanceTotale) {
			prepareResultats(keyAAfficher);
		}
		//sourceIti.clear();
		for (var i=0;i< resultats[keyAAfficher].itineraries.length;i++) {
			var iti = resultats[keyAAfficher].itineraries[i];
			var li = $('#iti .template li.list-group-item').clone();
			
			li.find('.lien-details').attr('data-resultat',i);
			li.find('.legs').attr('data-resultat',i);
			
			for (var j=0;j<iti.legs.length;j++) {
				var leg=iti.legs[j];
				var div=$('#iti .template .'+leg.mode).clone();
				remplissageDonneesLeg(div,leg);
				traceLeg(i,j);
				if ((leg.distance<150 && j!=0 && j!= iti.legs.length-1) && !urlParams.debug) continue; //on affiche seulement les grande distances dans le resumé
					li.find('.legs').append(div);
			}
			
			remplissageDonneesGenerales(li,iti,'#iti');
			li.appendTo('#iti > .list-group');
			initSwipe(li);
		}
		$('#iti > .list-group > li').sort(function(a, b){//console.log(a.getAttribute('data-duree')+' '+b.getAttribute('data-duree'));
			//return (parseInt(a.getAttribute('data-duree')) < parseInt(b.getAttribute('data-duree'))? -1:1);
			var diff = parseInt(a.getAttribute('data-duree')) - parseInt(b.getAttribute('data-duree'));
			if (diff == 0) {
				return (parseInt(a.getAttribute('data-hdep')) < parseInt(b.getAttribute('data-hdep'))? -1:1)
			} else {
				return (diff < 0?-1 :1);
			}
		}).detach().appendTo('#iti > .list-group');
		
		if( !isTaille('xs') && !isTaille('xxs'))
			$('.legs').click(function(e){
				var res= $(this).attr('data-resultat');
				if (res) afficheItiOuLeg(res);
				return false;
			});
		
		$('.lien-details').click(clickLienDetails);
		afficheItiOuLeg(0);
	}
}

//--------------------------------------//
// clickLienDetails
//--------------------------------------//
function clickLienDetails(e){
	$('#iti').addClass('removed').on('animationend webkitAnimationEnd oAnimationEnd',function(){
		$('#iti').toggle(false);
		$('#iti').removeClass('removed');
		$('#itiDetails').toggle(true);
	});
	
	var res= $(this).attr('data-resultat');
	if (res) afficheItiOuLeg(res);
	if (res) afficheDetail(res);
	return false;
}

//--------------------------------------//
// afficheDetail
//--------------------------------------//
function afficheDetail(indexResultat) {
	var iti = resultats[keyAAfficher].itineraries[indexResultat];
	remplissageDonneesGenerales($('#itiDetails .panel-body, #itiDetails .panel-footer'),iti,'#itiDetails');
	$('#itiDetails .legs div').remove();
	for (var j=0;j<iti.legs.length;j++) {
		var leg=iti.legs[j];
		var div=$('#itiDetails .template .'+leg.mode).clone();
		if (j==iti.legs.length-1) {
			var divhdep = div.find('span.text-v-top');
			var divharr = divhdep.clone();
			divharr.removeClass('text-v-top').addClass('text-v-bottom');
			divharr.find('.hdep').removeClass('hdep').addClass('harr');
			divharr.find('img').remove();
			divhdep.parent().append(divharr);
			divharr.find('.harr').addClass('last');
			divharr.find('.harr').after('<span class="legarr glyphicon glyphicon-map-marker" title="Arrivée" alt="Arrivée"> </span>');
		}
		if (j==0) {
			var divhdep = div.find('span.text-v-top');
			divhdep.find('.hdep').addClass('first');
			divhdep.find('.hdep').after('<span class="legdep glyphicon glyphicon-map-marker" title="Départ" alt="Départ"> </span>');
		}
		
		remplissageDonneesLeg(div,leg);
		div.find('.steps .step').remove();
		if(j==0) {
			var divStep=$('#itiDetails .template .step').clone();
			var txtStep= lang.instructions.depart+' <strong>'+leg.from.name+'</strong>';
			divStep.html(txtStep);
			div.find('.steps').append(divStep);
		}
		remplissageDonneesSteps(div,leg);
		
		if (j==iti.legs.length-1) {
			var divStep=$('#itiDetails .template .step').clone();
			var txtStep= lang.instructions.arrive+' <strong>'+leg.to.name+'</strong>';
			divStep.html(txtStep);
			div.find('.steps').append(divStep);
		}
		$('#itiDetails .legs').append(div);
		
		if ((leg.mode == 'CAR') && (leg.arrivalDelay != 0)) {
			$("<span>" + lang.iti.tempsStationnement + "  : " + leg.arrivalDelay/60000 + " " + lang.iti.minutes + "</span>").appendTo(div.find('.info'));
		}
		
		if (leg.mode == 'CAR') {
			var detailZoneDeCovoiturageDep = estDansZoneDeCovoiturage(leg.from.lat + ',' + leg.from.lon);
			var detailZoneDeCovoiturageArr = estDansZoneDeCovoiturage(leg.to.lat + ',' + leg.to.lon);
			var detailZoneDeCovoiturage ="";
			if (detailZoneDeCovoiturageDep != ""){
				detailZoneDeCovoiturage = detailZoneDeCovoiturageDep+'<br>';
			}
			if (detailZoneDeCovoiturageArr != "" && detailZoneDeCovoiturageDep != detailZoneDeCovoiturageArr){ 
				detailZoneDeCovoiturage += detailZoneDeCovoiturageArr;
			}
			if (detailZoneDeCovoiturage != '') {
				var elem = div.find('.info .cov').show();
				
				elem.popover('destroy');
				elem.popover({
					content:detailZoneDeCovoiturage,
					title: lang.iti.covoiturage,
					trigger: 'focus',
					html:true,
					viewport:{ selector: '#itiDetails', padding: 0 },
					container:'#itiDetails',
					//placement: 'auto left'
					placement: 'auto auto'
				}).click(function(e) { /*e.preventDefault();*/ $(this).focus(); return false;}); //pour chrome
			}
		}
		
		if (leg.mode =='TRAM' || leg.mode == 'BUS' || leg.mode =='RAIL') {
				var numLigne = leg.route;
				if ($.isNumeric(numLigne) && numLigne>=40 && numLigne<=70 && numLigne!=69) {

					var lienTag ="";
					var hRefTag ="";
										
					lienTag =  url.ws() + '/api/ficheHoraires/pdf?route=SEM:'+numLigne;
					
					hRefTag = '<a href="' + lienTag + '" target="_blank"> ' + lang.iti.flexo + '</a>';

					var elemFlexo = div.find('.info .flexo').show();
					var elemInfo = div.find('.info');
					var message = (numLigne!=62?lang.iti.reservation:lang.iti.reservationSemaine);
					
					elemInfo.show();
					
					elemFlexo.attr('title',message);
					
					elemFlexo.popover('destroy');
					elemFlexo.popover({
						content:hRefTag,
						title: message,
						trigger: 'focus',
						html:true,
						viewport:{ selector: '#itiDetails', padding: 0 },
						container:'#itiDetails',
						placement: 'auto left'
					}).click(function(e) { /*e.preventDefault();*/ $(this).focus(); return false;}); //pour chrome
					
					elemFlexo.attr('href','javascript:void(0);');
					//elemInfo.text(message);
					elemInfo.append(" " + message + hRefTag);
					
					elemInfo.attr('href','javascript:void(0);');
					elemInfo.click(function(e) {window.open(lienTag, "_blank",null);});
			}
		}
		
		if(!leg.routeId){
			var logo=div.find('.logoMode').css('background-image').split('img/')[1]; //on recupere le nom de icone dans le css (probleme ie et chrome)
			logo = logo.split(')')[0];
			logo = logo.replace('"','');
			div.find('.logoMode').attr('src','img/' + logo);
			div.find('.logoMode').attr('style','background-size:0;');
		}	

		div.attr('data-resultat',indexResultat);
		div.attr('data-leg',j);
		div.click(function(){ //zoom la carte depuis la section
			//var res= $(this).attr('data-resultat');
			var leg= $(this).attr('data-leg');
			var f = resultats[keyAAfficher].itineraries[indexResultat].legs[leg].feature;
			if (f && map)
				map.getView().fitExtent(f.getGeometry().getExtent(),map.getSize());
			return false;
		});

		div.find('.plusDeDetail').click(function(e){
			var parent = $(this).parent();
			parent.find('.etape').show();
			parent.find('.etape').removeClass('visible-print-block');
			parent.find('.plusDeDetail').hide();
			parent.find('.moinsDeDetail').show();
			return false;
		});
		$('.moinsDeDetail').click(function(e){
			var parent = $(this).parent();
			parent.find('.etape').addClass('visible-print-block');
			parent.find('.etape').hide();
			parent.find('.moinsDeDetail').hide();
			parent.find('.plusDeDetail').show();
			return false;
		});
		
	}
}

//--------------------------------------//
// remplissageDonneesGenerales
// remplacement des données dans les elements web (resultat et detail)
//--------------------------------------//
function remplissageDonneesGenerales(elem,iti,container) {
	var hdep = moment(iti.startTime);
	var harr = moment(iti.endTime + iti.arrivalDelay);
	var duree = harr.diff(hdep,'seconds');
	elem.attr('data-hdep',iti.startTime);
	elem.attr('data-harr',iti.endTime + iti.arrivalDelay);
	elem.attr('data-duree',duree);
	elem.attr('data-co2',iti.consoCO2Totale);
	elem.find('.hdep .heure').text(hdep.format('HH:mm'));
	elem.find('.harr .heure').text(harr.format('HH:mm'));


	if (elem.hasClass('hPrefixLong')) {
			elem.find('.headIti .hdep').text(hdep.format('HH:mm'));
			elem.find('.headIti .harr').text(harr.format('HH:mm'));
			elem.find('.hdep .hPrefixLong').text(lang.itineraire['depart'] +': ');
			elem.find('.harr .hPrefixLong').text(lang.itineraire['arrivee'] +': ');
	} else if (elem.hasClass('hPrefixCourt')) {
			elem.find('.headIti .hdep').text(hdep.format('HH:mm'));
			elem.find('.headIti .harr').text(harr.format('HH:mm'));
			elem.find('.hdep .hPrefixCourt').text(lang.itineraire['dep'] +': ');
			elem.find('.harr .hPrefixCourt').text(lang.itineraire['arr'] +': ');
	} else {
			elem.find('.headIti .hdep').text(lang.itineraire['depart'] +': ' + hdep.format('HH:mm'));
			elem.find('.headIti .harr').text(lang.itineraire['arrivee'] +': ' + harr.format('HH:mm'));
	}
		
	
	elem.find('.duree').text(lang.itineraire['duree'] +': ' + formatSecondes(duree));
	
	elem.find('.co2 > a').text(iti.consoCO2Totale+'g');
	elem.find('.co2 > a').popover('destroy');
	elem.find('.co2 > a').popover({
		content:iti.messageCO2,
		title: lang.itineraire.emission,
		trigger: 'focus',
		html:true,
		viewport:{ selector: container, padding: 0 },
		container:container,
		//placement: 'auto left'
		placement: 'auto auto'
	}).click(function(e) { /*e.preventDefault();*/ $(this).focus(); return false;}); //pour chrome
	
	if (iti.alerts && iti.alerts.length>0) {
		elem.find('.traffic > a').text(lang.trafficPerturbe);
		elem.find('.traffic > a').css("color","#f00");
	} else {
		elem.find('.traffic > a').text(lang.trafficFluide);
	}

	elem.find('.traffic > a').popover('destroy');
	elem.find('.traffic > a').popover({
		content:(iti.alerts && iti.alerts.length>0)?iti.alerts:lang.aucunePerturbation,
		title: lang.perturbations,
		trigger: 'focus',
		html:true,
		viewport:{ selector: container, padding: 0 },
		container:container,
		//placement: 'auto left'
		placement: 'auto auto'
	}).click(function(e) { /*e.preventDefault();*/ $(this).focus();return false;}); //pour chrome
}

//--------------------------------------//
// remplissageDonneesLeg
//--------------------------------------//
function remplissageDonneesLeg(elem,leg) {
	var hdep = moment(leg.startTime);
	var harr = moment(leg.endTime + leg.arrivalDelay);
	var duree = harr.diff(hdep,'seconds');
	elem.find('.hdep').text(hdep.format('HH:mm'));
	elem.find('.harr').text(harr.format('HH:mm'));
	//elem.find('.duree').text(moment.duration(duree,'seconds').humanize());
	elem.find('.duree').text(formatSecondes(duree));
	//elem.find('.distance').text(formatDistance(leg.distance));
	var from = (leg.from.name?leg.from.name.capitalize():'');
	elem.find('.from').text(from).attr('title',from).attr('alt',from);
	if(leg.routeId && leg.routeId !="BUL_1") {
		var logoLigne = getLogoLgn(leg.agencyId+'_'+leg.routeId,leg.route,'#'+leg.routeColor,false,'logoSvg','logoSvgRect');
		elem.find('.logoMode').replaceWith(logoLigne);
	}
}

//--------------------------------------//
// remplissageDonneesSteps
//--------------------------------------//
function remplissageDonneesSteps(elem,leg) {

	var elevationsLeg = [];
	var cumulDist=0;
	var minElevation = 4810;
	var maxElevation = 0;
	var positiveElevation = 0;
	var negativeElevation = 0;
	var premierStep = true;

	for (var i=0;i<leg.steps.length;i++) {
		var step=leg.steps[i];
		var div=$('#itiDetails .template .step').clone();
		var txt= makeInstructionStepsNodes(leg.mode,step,i);
		
		div.html(txt);
		
		div.addClass('etape');
		div.addClass('visible-print-block');
		div.attr('style','display:none;');
		if (premierStep) {
			premierStep=false;
			elem.find('.steps').append('<span class="col-xs-12 step">' + lang.iti.Distance  + " : " +  formatDistance(leg.distance) + '</span>');
			elem.find('.steps').append('<div class="hidden-print plusDeDetail"><span class="glyphicon glyphicon-zoom-in"></span>' +  lang.iti.plusDeDetails + '</div>');
			elem.find('.steps').append('<div class="hidden-print moinsDeDetail" style="display:none"><span class="glyphicon glyphicon-zoom-out"></span>' +  lang.iti.moinsDeDetails + '</div>');
		}
		elem.find('.steps').append(div);
			

		for (var j=0;j<leg.steps[i].elevation.length;j++) {
			elevationsLeg.push(leg.steps[i].elevation[j].first+cumulDist);
			elevationsLeg.push(leg.steps[i].elevation[j].second);
			if (minElevation>leg.steps[i].elevation[j].second) minElevation=leg.steps[i].elevation[j].second;
			if (maxElevation<leg.steps[i].elevation[j].second) maxElevation=leg.steps[i].elevation[j].second;
			
			if (j>1) {
				var d = leg.steps[i].elevation[j].second-leg.steps[i].elevation[j-1].second;
				if (d>0)
					positiveElevation += d;
				else
					negativeElevation += Math.abs(d);
			}
		}
		if (leg.steps[i].elevation && leg.steps[i].elevation.length > 0)
			cumulDist=cumulDist+leg.steps[i].elevation[leg.steps[i].elevation.length-1].first;
		else 
			cumulDist=cumulDist+leg.steps[i].distance;
	}
	if (leg.mode =='TRAM' || leg.mode == 'BUS' || leg.mode =='RAIL' || leg.mode =='CABLE_CAR') {
		var div=$('#itiDetails .template .step').clone();
		
		var route = leg.route;
		var txt = "";
		if(leg.mode =='RAIL') {route = lang.modes.RAIL;};
		if(leg.mode =='CABLE_CAR') {
			route = lang.modes.CABLE_CAR;
			txt= lang.instructions.transit_towards + ' <strong>'+ route+ ' ' + lang.directions.at+ ' '+ leg.from.name.capitalize()+'</strong> ';
		} else {
			txt= lang.instructions.transit_toward + ' <strong>'+ route+ ' ' + lang.directions.at+ ' '+ leg.from.name.capitalize()+'</strong> ' + lang.directions.to + ' ' + leg.headsign ;
			txt+= ' - '+(leg.to.stopSequence-leg.from.stopSequence)+' '+lang.directions.stops;
		}
		div.html(txt);
		elem.find('.steps').append(div);
		if(leg.mode !='CABLE_CAR') {
			div=$('#itiDetails .template .step').clone();
			var txt= lang.instructions.step_out + ' <strong>'+ leg.to.name.capitalize()+'</strong>';
			div.html(txt);
			elem.find('.steps').append(div);
		}
	} else {
		if ((maxElevation-minElevation)/cumulDist<0.01) {
			elem.find('.profil canvas').remove();
			return;
		}
		//if (maxElevation-minElevation<50) maxElevation= minElevation+50;
		drawProfil(elem,elevationsLeg,cumulDist,minElevation,maxElevation,negativeElevation,positiveElevation);
	}
}

//--------------------------------------//
// drawProfil
//--------------------------------------//
function drawProfil(elem,elevationsLeg,cumulDist,minElevation,maxElevation,negativeElevation,positiveElevation) {
	respondCanvas(elem);
	// elevations pour routier
	
	var	canvas = elem.find('.profil canvas')[0],
		ctx = canvas.getContext("2d"),
		w = canvas.width,
		h = canvas.height;
	
	var points=[0,15];
	for (var i=0;i<elevationsLeg.length;i=i+2) {
		points.push(elevationsLeg[i]*(w-35)/elevationsLeg[elevationsLeg.length-2]);
		points.push((elevationsLeg[i+1]-minElevation)*(h-30)/(maxElevation-minElevation)+15);
	}
	points.push(points[points.length-2]);
	points.push(15);
	
	ctx.clearRect(0, 0, w, h);
	
	ctx.font = "10px Arial";
	ctx.fillStyle = 'black';
	ctx.strokeStyle = 'black';
	
	var texte = lang.iti.DenivPos +  Math.floor(positiveElevation) + ' m, ' + lang.iti.DenivNeg + Math.floor(negativeElevation) + ' m';
	ctx.fillText(Math.floor(maxElevation)+' m',w-32,12);
	ctx.fillText(Math.floor(minElevation)+' m',w-32,h-3);
	ctx.fillText(texte,0/*w/2-20*/,h-3);
	

	ctx.translate(0, canvas.height);
	ctx.scale(1, -1);
	//ctx.translate(0.5, 0.5);
	ctx.lineJoin = 'round';
	

	// draw our cardinal spline
	ctx.beginPath();
	ctx.moveTo(points[0], points[1]);
	ctx.curve(points, 0, 25, false);
	ctx.strokeStyle = '#a0a0a0';
	ctx.lineWidth = 3;

	ctx.fillStyle = '#a0a0a0';
	ctx.fill();

	ctx.stroke();
}

//--------------------------------------//
// respondCanvas
//--------------------------------------//
function respondCanvas(e){
	//efface le tracé dans le canvas
	var profil = e.find('.profil');
	var width = $('#itiParams').width();
	//if (width > ($('body').width()-150)) width = $('body').width()-200;
	if (isTaille('xs') || isTaille('xxs')) width = $('body').width()-200;
	else if (isTaille('sm')) width = width-150;
	else if (isTaille('md')) width = width-50;
	else if (isTaille('lg')) width = width-15;
	//else width = $('body').width()-200;
	else width = width-15;
	profil.find('canvas').attr('width', width ); //max width
	//profil.find('canvas').attr('height', profil.height() ); //max height

}

//--------------------------------------//
// calculCO2
//--------------------------------------//
function calculCO2(mode, distance) {
	//Voiture : 200g/Km ;Train : 5g/Km ;Tramway : 8g/Km ;Bus : 100g/Km anciennes valeurs
	//Voiture : 205g/Km ;Train : 30g/Km ;Tramway : 6,62g/Km ;Bus : 144g/Km
	switch(mode)
	{
	case 'RAIL':
	case 'CABLE_CAR':
	  return Math.round(distance/1000*30);
	case 'TRAM':
		return Math.round(distance/1000*6.62);
	case 'BUS':
	  return Math.round(distance/1000*144);
	case 'CAR':
	  return Math.round(distance/1000*205);
	default:
	  return 0;
	};
}

//--------------------------------------//
// typeTrajet : retourne le type global du trajet 'Velo' ou 'Pieton' ou 'Voiture' ou 'TC' ou 'VoitureTC' ou 'Mixte'
//--------------------------------------//
function typeTrajet(typeTrajetGlobal,mode) {
	if (typeTrajetGlobal == '') {
		switch(mode) {
			case 'CAR':
				return 'Voiture';
			case 'RAIL':
			case 'TRAM':
			case 'BUS':
				return 'TC';
			case 'BICYCLE':
				return 'Velo';
			case 'WALK':
				return 'Pieton';
		}
	} 
	else if (typeTrajetGlobal == 'Pieton') {
		switch(mode) {
			case 'RAIL':
			case 'TRAM':
			case 'BUS':
				return 'TC';
			case 'CAR':
				return 'Voiture';
			default : return typeTrajetGlobal;
		}
	}
	else if (typeTrajetGlobal == 'TC') {
		switch(mode) {
			case 'CAR':
				return 'VoitureTC';
			default : return typeTrajetGlobal;
		}
	}
	else if (typeTrajetGlobal == 'Velo') {
		switch(mode) {
			case 'RAIL':
			case 'TRAM':
			case 'BUS':
				return 'TC';
			default : return typeTrajetGlobal;
		}
	}
	else if (typeTrajetGlobal == 'Voiture') {
		return typeTrajetGlobal;
	}
	else if (typeTrajetGlobal == 'VoitureTC') {
		return typeTrajetGlobal;
	}
	else if (typeTrajetGlobal == 'Voiture partagée') {
		return typeTrajetGlobal;
	}
	else if (typeTrajetGlobal == 'Voiture partagéeTC') {
		return typeTrajetGlobal;
	}
	
	
	return typeTrajetGlobal;
}

//--------------------------------------//
// afficheCO2
//--------------------------------------//
function afficheCO2(index) {
	reg = new RegExp("\n",'g');
	$('#emissionCO2_resultat_text').html(res.plan.itineraries[index].messageCO2.replace(reg,'<br/>'));
	$("#popupemissionCO2").show();
}

//--------------------------------------//
// buildMessage
//--------------------------------------//
function buildMessage(distanceTotale, typeTrajet, consoCO2Totale) {
	switch(typeTrajet) {
		case ('Velo'):
			return lang.messagesEmissionCO2['Velo'];
		case 'Pieton':
			return lang.messagesEmissionCO2['Pieton'];
		case ('Voiture'):
			var tmpRetour;
			if (distanceTotale/1000 <= 3)
				tmpRetour = lang.messagesEmissionCO2['Voiture'].replace("$2", lang.messagesEmissionCO2['SiTrajetInferieurA3Km']);
			else
				tmpRetour = lang.messagesEmissionCO2['Voiture'].replace("$2", "");
			return tmpRetour.replace("$1", consoCO2Totale).replace("$3", calculCO2('BUS', distanceTotale)).replace("$4", Math.round(distanceTotale/1000));
		case ('TC'):
		case ('Voiture partagéeTC'):
		   return lang.messagesEmissionCO2['TC'].replace("$1", calculCO2('CAR', distanceTotale) - consoCO2Totale).replace("$2", consoCO2Totale).replace("$3", Math.round(distanceTotale/1000));
		case ('VoitureTC'):
			return lang.messagesEmissionCO2['VoitureTC'].replace("$1", consoCO2Totale).replace("$2", calculCO2('CAR', distanceTotale) - consoCO2Totale);
		case ('Mixte'):
			return lang.messagesEmissionCO2['Mixte'].replace("$1", consoCO2Totale);
		case ('Voiture partagée'):
			return lang.messagesEmissionCO2['Voiture partagée'];
			
		}
	return "";
}

//--------------------------------------//
// makeInstructionStepsNodes
//--------------------------------------//
function makeInstructionStepsNodes (mode, step,stepNum) {
	mode = mode.toLowerCase();
	if (step.streetName == "street transit link") {
		return '';
	}
	
	if (mode === 'walk') {
		verb = lang.instructions.walk_toward;
	}
	else if (mode === 'bicycle') {
		verb = lang.instructions.bike_toward;
		template = 'TP_BICYCLE_LEG';
		containsBikeMode = true;
	} else if (mode === 'drive') {
		verb = lang.instructions.drive_toward;
		template = 'TP_CAR_LEG';
		containsDriveMode = true;
	} else {
		verb = lang.instructions.move_toward;
	}

	var text = this.addNarrativeToStep(step, verb, stepNum);

	return filtreNomDeRue(text);
}

//--------------------------------------//
// filtreNomDeRue
//--------------------------------------//
function filtreNomDeRue(text) {
	if (urlParams.debug) return text;
	
	try {
		var i=1;
		var textSansVoieSansNom = text;
		
		//Cas du null
		if (textSansVoieSansNom == null) return lang.detail.voieSansNom;
		
		
		while (typeof(lang.resultatsASupprimer[i]) != "undefined") {
			textSansVoieSansNom = text.replace(lang.resultatsASupprimer[i],lang.resultatsARemplacer[i]);
			i++;
		}
		
		//osm:node:311828706 -> lang.detail.voieSansNom
		if (textSansVoieSansNom.indexOf('osm:node') != -1)
			return lang.detail.voieSansNom;
			
		//coin de way 4377349 from 0 et Rue Duguesclin -> coin de voie sans nom et Rue Duguesclin
		while (textSansVoieSansNom.indexOf('way ') != -1) {
			var textSansVoieSansNomSplit = textSansVoieSansNom.split(' ');
			var j=-1;
			for (i=0; i<textSansVoieSansNomSplit.length; i++)
			{
				if (textSansVoieSansNomSplit[i] == "way" || textSansVoieSansNomSplit[i] ==  "<strong>way") {
					j=i;
					break;
				}
			}
			if ((j >= 0) && ((j+4) <= textSansVoieSansNomSplit.length)) {
				textSansVoieSansNom = "";
				for (i=0; i<textSansVoieSansNomSplit.length; i++)
				{
					if (i < j || i >= j+4) {
						textSansVoieSansNom = textSansVoieSansNom + " " + textSansVoieSansNomSplit[i];
						}
					else {
						if (i == j )
							textSansVoieSansNom = (textSansVoieSansNom!=""?textSansVoieSansNom + " ":"") + lang.detail.voieSansNom;
					}
				} 
			}
		}
		var premiereLettre = 0;//textSansVoieSansNom.indexOf('</strong> ')+'</strong> '.length;
		var txt = textSansVoieSansNom.substring(0,premiereLettre) + textSansVoieSansNom.substr(premiereLettre,1).toUpperCase().latinise()+textSansVoieSansNom.substr(premiereLettre+1);
		return txt.replace(" de une "," d'une ");
	 } catch(e) {
		return (text);
	}
}

//--------------------------------------//
// addNarrativeToStep
//--------------------------------------// 
function addNarrativeToStep (step, verb, stepNum, dontEditStep) {
	var stepText   = "";
	var iconURL  = null;

	var relativeDirection = step.relativeDirection;
	
	if (step.exit != null && relativeDirection !="CIRCLE_COUNTERCLOCKWISE" && step.bogusName) {
				stepText += " " + lang.instructions.exit + " <STRONG>" + step.exit+"</STRONG>";
	}
			
	else if ((relativeDirection == null || stepNum == 1) && step.absoluteDirection != null)
	{
		var absoluteDirectionText = lang.directions[step.absoluteDirection.toLowerCase()];
		stepText += verb + ' <strong>' + absoluteDirectionText + '</strong> ' + lang.directions.on;
	} else {
		relativeDirection = relativeDirection.toLowerCase();

		var directionText = lang.directions[relativeDirection];

		if (relativeDirection == "continue") {
			stepText += directionText;
		}
		else if (relativeDirection == "elevator") {
		  // elevators are handled differently because, in English
		  // anyhow, you want to say 'exit at' or 'go to' not
		  // 'elevator on'
		  stepText += directionText;
		}
		else if (step.stayOn == true) {
			stepText += directionText + " " + lang.directions['to_continue'];
		}
		else {
			stepText += directionText;
			if (step.exit != null) {
				stepText += " " + lang.ordinal_exit[step.exit] + " ";
			}
			stepText += " " + lang.directions['on']; //if (!step.bogusName)
		}
	}
	if (step.bogusName && step.exit != null) {
		if (relativeDirection == "CIRCLE_COUNTERCLOCKWISE") {
			stepText += ' ' + lang.detail.rondPoint;
		} else if (step.exit == null) {
			//stepText += ' <strong>' + lang.bogusName + '</strong>';
			var absoluteDirectionText = lang.directions[step.absoluteDirection.toLowerCase()];
			//stepText = "<strong>" + stepNum + ".</strong> "+verb + ' <strong>' + absoluteDirectionText + '</strong> ';
			stepText = verb + ' <strong>' + absoluteDirectionText + '</strong> ';
		}
			
	} else {
		stepText += ' <strong>' + step.streetName + '</strong>';
	}

	// don't show distance for routes which have no distance (e.g. elevators)
	if (step.distance > 0) {
		stepText += ' - ' + formatDistance(step.distance) + '';
	}

	// edit the step object (by default, unless otherwise told)
	if(!dontEditStep) {
		// SIDE EFFECT -- when param dontEditStep is null or false, we'll do the following side-effects to param step
		step.narrative  = stepText;
		step.iconURL    = iconURL;
		step.bubbleHTML = '<img src="' + iconURL + '"></img> ' + ' <strong>' + stepNum + '.</strong> ' + step.streetName;
		step.bubbleLen  = step.streetName.length + 3;
	}

	return stepText;
}

//--------------------------------------//
// traceLeg
//--------------------------------------//
function traceLeg(i,j) {
	var leg=resultats[keyAAfficher].itineraries[i].legs[j];
	var lat = 0;
	var lon = 0;
	var n = leg.legGeometry.points;
	var strIndex = 0;
	var points = new Array();

	while (strIndex < n.length) {

	  var rLat = decodeSignedNumberWithIndex(n, strIndex);
	  lat = lat + rLat.number * 1e-5;
	  strIndex = rLat.index;

	  var rLon = decodeSignedNumberWithIndex(n, strIndex);
	  lon = lon + rLon.number * 1e-5;
	  strIndex = rLon.index;

	  var p = ol.proj.transform([lon,lat], "EPSG:4326", "EPSG:3857");
	  points.push(p);
	}
	var geom = new ol.geom.LineString(points);
	var feature;

	feature = new ol.Feature({
		'geometry': geom,
		'iti':i,
		'leg':j,
		
	});
	
	if (leg.route && leg.route != "BUL") {
		var logo = $('<div>').append(getLogoLgn(leg.agencyId+'_'+leg.routeId,leg.route,'#'+leg.routeColor,false,'logoSvg','logoSvgRect')).html();
		feature.set('details',logo+' '+leg.headsign);
		feature.set('description','Ligne');
	}
	
	sourceIti.addFeature(feature);
	leg.feature=feature;
	var geom = new ol.geom.Point(points[0]);
	var f;

	f = new ol.Feature({
		'geometry': geom,
		'iti':i,
		'leg':j,
		'type':'startLeg'
	});
	
	sourceIti.addFeature(f);

	if(leg.intermediateStops) {
		for (var k=0; k<leg.intermediateStops.length; k++) {
			var stop = leg.intermediateStops[k];
			var geom = new ol.geom.Point(ol.proj.transform([stop.lon,stop.lat], "EPSG:4326", "EPSG:3857"));
			var f;

			f = new ol.Feature({
				'geometry': geom,
				'iti':i,
				'leg':j,
				'stop':k,
				'type':'intermediate'
			});
			
			sourceIti.addFeature(f);
		}
	}
}

//--------------------------------------//
// decodeSignedNumberWithIndex
//--------------------------------------//
function decodeSignedNumberWithIndex(value,index) {
	var r =  {"number": 0, "index": 0}; 
	r = decodeNumberWithIndex(value, index);
	var sgn_num = r.number;
	if ((sgn_num & 0x01) > 0) {
	  sgn_num = ~(sgn_num);
	}
	r.number = sgn_num >> 1;
	return r;
}

//--------------------------------------//
// getLeg
//--------------------------------------//
function getLeg(i,j) {
	return resultats[keyAAfficher].itineraries[i].legs[j];
	
}

//--------------------------------------//
// isLegAffiche
//--------------------------------------//
function isLegAffiche(i,j) {
	return resultats[keyAAfficher].itineraries[i].legs[j].visible || resultats[keyAAfficher].itineraries[i].visible;
}

//--------------------------------------//
// afficheItiOuLeg
//--------------------------------------//
function afficheItiOuLeg(iti,leg) {
	if (resultats[keyAAfficher]) {
		for (var i=0;i< resultats[keyAAfficher].itineraries.length;i++) {
			resultats[keyAAfficher].itineraries[i].visible = false;
			for (var j=0;j< resultats[keyAAfficher].itineraries[i].legs.length;j++) {
				resultats[keyAAfficher].itineraries[i].legs[j].visible=false ;
			}
		}
		//console.info('iti : ' + iti + ' leg : ' + leg);
		if(!leg) {
			resultats[keyAAfficher].itineraries[iti].visible=true;
		} else {
			resultats[keyAAfficher].itineraries[iti].legs[leg].visible=true;
		}
		//sourceIti.dispatchChangeEvent();
		sourceIti.changed();
	}
}

//--------------------------------------//
// decodeNumberWithIndex
//--------------------------------------//
function decodeNumberWithIndex(value, index) {

	if (value.length == 0)
		throw "string is empty";

	var num = 0;
	var v = 0;
	var shift = 0;

	do {
	  v1 = value.charCodeAt(index++);
	  v = v1 - 63;
	  num |= (v & 0x1f) << shift;
	  shift += 5;
	} while (v >= 0x20);

	return {"number": num, "index": index};
}

//--------------------------------------//
// errorOTP
//--------------------------------------//
function errorOTP(xhr, status, erreur) {
	try {
	fct_attente(false,'calcul');
	var err;
	if (xhr && xhr.responseText)
		err= eval("(" + xhr.responseText + ")");
	if (typeof(err) == "undefined") {
		err = xhr.statusText;
		if (typeof(err) != "undefined") {
			console.log(err + " errorOTP, xhr :" + JSON.stringify(xhr) + " status :" + status + " erreur :" + erreur);
			}
		else
			console.log("errorOTP");
	}
	else
		console.log(err.Message);

	} catch (e) { console.log("catch errorOTP iti.js"); }
}

//--------------------------------------//
// $('#rowOptions').click 
//--------------------------------------//
$('#rowOptions').click (function() {
	if( $('#itiOptions').hasClass('in')) {
			$('#itiOptions').collapse('hide');
			$('#rowOptions h2').empty().append("<span class='glyphicon glyphicon-chevron-down'></span>" + lang.iti.plusDOption);
		}
	else  {
			$('#itiOptions').collapse('show');
			$('#rowOptions h2').empty().append("<span class='glyphicon glyphicon-chevron-up'></span>" + lang.iti.moinsDOption);
		}
	}
);

//--------------------------------------//
// zoomCarte
//--------------------------------------//
function zoomCarte(idcarte) {
	if(!idcarte) idcarte='map';
	toggleParams(false,true);
	$('#iti').show();
	toggleResultats(false,true);
	$('#itiDetails').hide();
	var map=getMap(idcarte);
	map.getView().fitExtent(sourceIti.getExtent(),map.getSize());
}

//--------------------------------------//
// imprimeFeuilleDeRoute
//--------------------------------------//
function imprimeFeuilleDeRoute() {
	window.print();
}

//--------------------------------------//
// downloadFile
// Function to download data to a file
//--------------------------------------//
function downloadFile(data, filename, type) {
    var a = document.createElement("a"),
        file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

//--------------------------------------//
// exportGPX
//--------------------------------------//
function exportGPX(_this) {
	try {
		var res = $('#itiDetails .leg[data-resultat]').first().attr('data-resultat');
		var features = sourceIti.getFeatures().filter(function( f ) {
			return (f.get('iti') == res);
		});
		var format = new ol.format.GPX();
		var gpx = format.writeFeatures(features,{dataProjection:"EPSG:4326",featureProjection:"EPSG:3857"});
		//On supprime les balises <wpt> afin que le format soit supporté par Garmin (MapSource)
		var wpt = $(gpx).find('wpt').remove();
		$(gpx).prepend(wpt);
		$(gpx).attr('version','1.1');
		$(gpx).attr('creator','MetroMobilite');
		gpx = (new XMLSerializer()).serializeToString($.parseXML( gpx ));
		var gpxData = 'data:application/gpx+xml;charset=utf-8,' + encodeURIComponent( gpx );
		//$(_this).attr( { 'href': gpxData ,'download': 'traceGPX.gpx' } );//Non supporté par IE
		downloadFile(gpxData, 'traceGPX.gpx', 'text/plain')
		return "";
	    	    
	} catch(e) {
		console.log(e.msg+' : '+e.lineNumber);
		return "";
	}
}

//----------------------------------------//
// estDansZoneStationnement
// Retour true si le nom de la ville fait parti des ville avec un temps de stationnement de x minutes.
//----------------------------------------//
function estDansZoneStationnement(ville) {
	try {
		if (!ville) return false;
		var villeU = ville.latinise().toUpperCase();
		return (villeU.indexOf("GRENOBLE")==0 || 
			villeU.indexOf("SEYSSINET-PARISET")==0 ||
			villeU.latinise().toUpperCase().indexOf("ECHIROLLES")==0 ||
			villeU.indexOf("SAINT-MARTIN-D'HERES")==0 ||
			villeU.indexOf("ST-MARTIN-D'HERES")==0 ||
			villeU.indexOf("GIERES")==0 ||
			villeU.indexOf("LA TRONCHE")==0 ||
			villeU.indexOf("FONTAINE")==0 ||
			villeU.indexOf("MEYLAN")==0);
		}
	catch(e) {
		console.error(e.message);
		return false;
		}
}

//--------------------------------------//
// estDansZoneDeCovoiturage
// Indique si un point est dans une zone de covoiturage
//--------------------------------------//
function estDansZoneDeCovoiturage(lonlat) {
	try {
		if (!sourceCov) return "";
		var listeCov = sourceCov.getFeaturesAtCoordinate(ol.proj.transform([parseFloat(lonlat.split(',')[1]),parseFloat(lonlat.split(',')[0])], "EPSG:4326", "EPSG:3857"));
		if (listeCov.length > 0) {
			return listeCov[0].get('commentaires');
		}
		else  return "";
	} catch(e) {
			console.log(e.msg+' : '+e.lineNumber);
			return "";
	}
}
