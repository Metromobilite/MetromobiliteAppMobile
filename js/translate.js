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

function translate() {
	
	//Ecran d'accueil
	$('.autourDeMoi').text(lang.appMobile.AUTOUR);
	$('.parametres').text(lang.appMobile.PARAMETRES);
	$('.aPropos').text(lang.appMobile.APROPOS);
	$('.horaires').text(lang.appMobile.HORAIRES);
	$('.itineraire').text(lang.appMobile.ITINERAIRE);
	$('.infoTrafic').text(lang.appMobile.TRAFIC);
	$('.monCompte').text(lang.appMobile.MONCOMPTE);
	$('.atmo').text(lang.appMobile.ATMO);
	$('.favoris').text(lang.appMobile.FAVORIS);
	$('.afficher').text(lang.appMobile.afficher);
	
	//Itinéraire
	$('#detailFooter .voirSurCarte').text(lang.voirSurCarte);
	$('#panel-heading-itineraire > h1').text(lang.iti.itineraire);
	$("#dep").prop({placeholder: lang.iti.stopDepart});
	$("#arr").prop({placeholder: lang.iti.stopArrivee});
	$("#iti-params-inverse").prop({title: lang.iti.retour, alt: lang.iti.retour});
	$('#rowOptions h2').empty().append("<span class='glyphicon glyphicon-chevron-down'></span>" + lang.iti.plusOptions);
	$('#ap_av option[value="D"]').text(lang.iti.apres);
	$('#ap_av option[value="A"]').text(lang.iti.avant);
	$('#calculer').empty().append('<span class="glyphicon glyphicon-search"></span> ' + lang.iti.calculer);
	$("#panel-heading-resultats-precedent").prop({title: lang.iti.resultatsPrecedent, alt: lang.iti.resultatsPrecedent});
	$('#iti-resultat').text(lang.iti.resultats);
	$('#iti-dep-prec').text(lang.iti.departPrecedent);
	$("#resultat-detail").prop({title: lang.iti.trajetDetail, alt: lang.iti.trajetDetail});
	$('#resultat-trafic').empty().append(lang.iti.trafic + '<a href="#"></a>');
	$('.WALK  >figure img').prop({title: lang.iti.pieton, alt: lang.iti.pieton});
	$('.BICYCLE  >figure img').prop({title: lang.iti.velo, alt: lang.iti.velo});
	$('.BUS .TRAM .RAIL >figure img').prop({title: lang.iti.transportCommun, alt: lang.iti.transportCommun});
	$('.CABLE_CAR  >figure img').prop({title: lang.iti.teleferique, alt: lang.iti.teleferique});
	$('.CAR  >figure img').prop({title: lang.iti.voiture, alt: lang.iti.voiture});
	
	$('#imgPieton').prop({title: lang.iti.pieton, alt: lang.iti.pieton});
	$('#imgPmr').prop({title: lang.iti.pmr, alt: lang.iti.pmr});

	$('#transit > img').prop({title: lang.iti.transportCommun, alt: lang.iti.transportCommun});
	$('#transit_pmr > img').prop({title: lang.iti.transportCommun, alt: lang.iti.transportCommun});
	$('#logoModeTC').prop({title: lang.iti.transportCommun, alt: lang.iti.transportCommun});
	$('#bike > img').prop({title: lang.iti.velo, alt: lang.iti.velo});
	$('#logoModeVelo').prop({title: lang.iti.velo, alt: lang.iti.velo});
	$('#walk > img').prop({title: lang.iti.pieton, alt: lang.iti.pieton});
	$('#logoModePieton').prop({title: lang.iti.pieton, alt: lang.iti.pieton});
	$('#pmr > img').prop({title: lang.iti.pmr, alt: lang.iti.pmr});
	$('#car > img').prop({title: lang.iti.voiture, alt: lang.iti.voiture});
	$('#logoModeVoiture').prop({title: lang.iti.voiture, alt: lang.iti.voiture});
	$('#wait').prop({title: lang.iti.rechercheEnCours, alt: lang.iti.rechercheEnCours});

	$("#panel-footer-resultats-suivant").prop({title: lang.iti.prochainsResultats, alt: lang.iti.prochainsResultats});
	$('#iti-dep-suiv').text(lang.iti.prochainsDeparts);
	$('#itiDetails-ret').text(lang.iti.retourResultats);
	$('#panel-heading-details > h2').text(lang.iti.detail);
	$('#detailFooter > a:nth-child(1)').text(lang.iti.voirCarte);
	$('#detailFooter > a:nth-child(2)').text(lang.iti.imprimerCarte);
	$('#detailFooter > a:nth-child(3)').text(lang.iti.gps);
	
	//popup caméras trafic
	stylesTypes.agenceMtitre = lang.iti.AgenceMetromobilite;
	stylesTypes.pointService.titre = lang.appMobile.pointsServices;
	stylesTypes.dat.titre = lang.appMobile.venteTitres;
	stylesTypes.depositaire.titre = lang.appMobile.depositaires;
	stylesTypes.rue.titre = lang.appMobile.rue;
	stylesTypes.PMV.titre = lang.appMobile.pmv;
	stylesTypes.CAM.titre = lang.appMobile.camera;
	stylesTypes.PKG.titre = lang.appMobile.parking;
	stylesTypes.PAR.titre = lang.appMobile.PR;
	stylesTypes.covoiturage.titre = lang.appMobile.covoiturage;
	stylesTypes.MVA.titre = lang.iti.AgenceMetrovelo;
	stylesTypes.MVC.titre = lang.iti.ConsignesMetrovelo;
	stylesTypes.dep.titre = lang.instructions.depart;
	stylesTypes.arr.titre = lang.instructions.arrive;
	stylesTypes.search.titre = lang.appMobile.resulatrecherche;
	
	//signalement l'alerte
	$("#divAlerte > h4").text(lang.appMobile.signaler);
	$("#alerteTypeAccident").parent().text(lang.appMobile.accident);
	$("#alerteTypeBouchon").parent().text(lang.appMobile.bouchon);
	$("#alerteTypeObstacle").parent().text(lang.appMobile.obstacle);
	$("#alerteTypeAutre").parent().text(lang.appMobile.autre);
	
	$("#alerteMessage .form-control").prop({placeholder: lang.appMobile.descriptionEvenement});
	
	var htmlText  = '<input type="checkbox" value="pos">'  + lang.appMobile.inclurePosition + '</input>';
	$("#alertePosition").html(htmlText);
	htmlText  = '<input type="checkbox" value="pos">'  + lang.appMobile.inclurePositionDesc + '</input>';
	$("#alerteNoPosition").html(htmlText);
	$("#alerteNoPosition > input").text(lang.appMobile.inclurePositionDesc);
	$("#alertePhoto > button").text(lang.appMobile.prendrephoto);
	$("#alerteMail > button").text(lang.appMobile.envoyerMail);
	
	$('#mainAbout > p').text(lang.appMobile.application);
	$('#mainAbout .mainAboutCreditT').text(lang.appMobile.creditTechnique);
	$('#mainAbout .mainAboutCreditTa').text(lang.appMobile.mentionsLegales);
	$('#mainAbout .mainAboutCreditD').text(lang.appMobile.creditDonnees);
	$('#mainAbout .mainAboutCreditDa').text(lang.appMobile.mentionsLegales);
	$('#mainAbout .mainAboutSiteW').text(lang.appMobile.siteWeb);
	$('#mainAbout .mainAboutFAQ').text(lang.appMobile.faq);
	$('#mainAbout .mainAboutContact').text(lang.appMobile.contact);
	$('#mainAbout .mainAboutContacta').text(lang.appMobile.envoyerMail);
	$('#mainAbout .mainAboutVersion').text(lang.appMobile.version);
	
	$('#bonjourSIV').text(lang.appMobile.serviceSIV);
	$('#bonjourSIVId label').text(lang.appMobile.identifiant);
	$("#userRegNotif").prop({placeholder: lang.appMobile.entrezIdentifiant});
	$('#bonjourSIVPwd label').text(lang.appMobile.motDePasse);
	$("#pwdRegNotif").prop({placeholder: lang.appMobile.entrezMotDePasse});
	$('#registerNotif_link').text(lang.appMobile.valider);
	$('#rowRegisterNotif .help-block').text(lang.appMobile.cliquezValider);
	
	$('#popupZA #libelleArret').text(lang.appMobile.nbspArret);
	$('#popupZA #libelleDepart').text(lang.appMobile.departItineraire);
	$('#popupZA #libelleArrivee').text(lang.appMobile.arriveeeItineraire);
	$('#popupZA #passagesHoraires').text(lang.appMobile.horaires);
	
	$('#popupZA .PopupDetails-detailsCallback .icones .arret .libelle:nth-of-type(2)').text(lang.appMobile.nbspArret);
	$('#popupZA .PopupDetails-detailsCallback .icones .dep .libelle:nth-of-type(2)').text(lang.appMobile.departItineraire);
	$('#popupZA .PopupDetails-detailsCallback .icones .arr .libelle:nth-of-type(2)').text(lang.appMobile.arriveeeItineraire);
	$('#popupZA .PopupDetails-detailsCallback .header span').text(lang.appMobile.horaires);

	$('#horairesText').text(lang.appMobile.selectionnezPanneau);
	$('#horairesTextStatique').text(lang.appMobile.selectionnezPanneau);
	
	$('#push_link > a').text(lang.appMobile.notifications);
	$('#conf_link > a').text(lang.appMobile.mesAlertes);
	
	$('#rowParam #moncompte').text(lang.appMobile.monCompte);
	$('#rowParam #langage').text(lang.appMobile.langage);
	$('#rowParam #selhoraires').text(lang.appMobile.horaires);
	$('#rowParam #pagedemarrage').text(lang.appMobile.pagedemarrage);
	
	$('#horairesSelector option[value="tri-default"]').text(lang.appMobile.triParcours);
	$('#horairesSelector option[value="tri-oa"]').text(lang.appMobile.triAlphabetique);
		
	$('#startSelector option[value="start-accueil"]').text(lang.appMobile.accueil);
	$('#startSelector option[value="start-autour"]').text(lang.appMobile.autour);
	$('#startSelector option[value="start-horaires"]').text(lang.appMobile.horaires);
	$('#startSelector option[value="start-itineraire"]').text(lang.appMobile.itineraire);
	$('#startSelector option[value="start-tc"]').text(lang.appMobile.tc);
	$('#startSelector option[value="start-routier"]').text(lang.appMobile.reseauRoutier);
	$('#startSelector option[value="start-parking"]').text(lang.appMobile.parking);
	$('#startSelector option[value="start-atmo"]').text(lang.appMobile.Atmo);
	$('#startSelector option[value="start-favoris"]').text(lang.appMobile.favoris);	
};