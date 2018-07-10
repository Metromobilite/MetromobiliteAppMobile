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
// global translation
//--------------------------------------//
var lang = {
	momentLocale:'en-gb',
	pointCarte:"Seized map",
	maPosition:"Current location",
	rafraichir:"Refresh",
	rechercheEnCours:"Searching...",
	numeroNonTrouve:"Address number not found",
	OTPlocale:"en_US",
	modifChoix: "Modify your choice...",
	calculEnCours: "Processing...",
	trafficFluide: "light",
	trafficPerturbe: "disrupted",
	perturbations: "Disruptions",
	aucunePerturbation: "None",
	aucunePerturbation_full: "No current disruption",
	aucunFavoris: "Find here the schedules of passage of your favorite lines, favorites cameras,  parking space and itineraries.",
	aucuneLignesFavorites: "Find here the schedules of passage of your favorite lines",
	aucunParkingFavoris: "Find here number of available favorite parking space",
	aucuneCamFavorites: "Find here your favorites cameras",
	aucunItiFavoris: "Find here your favorites itineraries",
	aucuneNotif: "No notification",
	libelleAddresseNonTrouvee: "Address not found",
	localisationEvenement: "Localize it on the map",
	station: "Stop",
	affichageDesCartographie: "Layers",
	affichageDes: "Display of ",
	voirSurCarte: " See map",
	messagesEmissionCO2 : { // Message affiché pour l'émission de CO2
		// Pour les trajets à vélo
		'Velo' : "CO2 emission for this route is almost zero.\nCongratulations, by using bike, you contribute to a better air quality.",
		// Pour les trajets piétons
		'Pieton' : "CO2 emission for this route is zero.\nCongratulations, you contribute to a better air quality.",
		// Pour les trajets en voiture
		'Voiture' : "Using an individual car for this $4km route (not electric) : \n- you produce around $1g of CO2.\nThis emission would be almost zero by bicycle and $2g by public transport.\nUsing these modes would allow you to contribute to a better air quality.",
		// morceau rajouté dans le message pour les trajets en voiture dans la variable $2 si le trajet est inférieur à 3km -->
		'SiTrajetInferieurA3Km' : "zero CO2 produced for this route by feet, ",
		// Pour les trajets TC
		'TC' : "By using public transport for this $3km route, you produce around :\n	- $2g of CO2,\n	- but save $1g of CO2 compare of using an individual car.\nBy bicycle this emission would be almost zero.",
		// Pour les trajets TC + Voiture
		'VoitureTC' : "With this combined route, you generate about $1g of CO2.\nUsing public transport allows you to reduce the emission $2g of C02 compared with a route by car only.",
		// Pour les trajets ne correspondant à aucun des cas précédents. Ce message n'apparait éventuellement que pour un cas oublié théoriquement
		'Mixte' : "The realized mixed route generate about $1g of CO2.",
		// Pour les trajets en iRoad
		'Voiture partagée' : "If you are using electric car for this route, the emission of CO2 is almost zero.<br/>Congratulations, by using this means of transport, you contribute to a better air quality."
	},
	bogusName : "Nameless road",
	
	horaires :
	{
		direction : "to:",
		Direction : "To:",
		choixArret : "Select your stop",
		arret : "Stop:",
		
		//Specifique pour la traduction de js
		horaires : "Schedules ",
		prochainArret : "Departures ",
		selectPanel : "Select line into the left panel",
		toutDeselctionner : "Unselect all",
		clickOnTag : "Click on the TAG or Transisère line you want, then select the stop you want to take your bus or tram. Métromobilité delivers, in real time, the waiting time before the next passage in both directions.",
		fromTram : "From 4h30 to 1h, from 4 to 10 min frequency  (peak hour)",
		fromChrono : "From 5h to 1h, from 4 to 10 min frequency (peak hour)",
		fromProximo : "From 5H to 21h, from 7 à 15 min frequency (peak hour)",
		fromFlexo : "From 6h30 to 20h, regular offer and service on reservation",
		descReseauNav : "In function during major works on the lines of tram",
		update : "Update current time",
		
		fermerBtnClosedatePicker :"Close the picker",
		btnPreviousdatePicker :"Previous Month",
		btnMonthdatePicker :"Select Month",
		btnNextdatePicker :"Next Month", 
		
		fermerBtnClosetimepicker:"Close the picker",		
		btnIncHrtimepicker :"Increment Hour",
		btnInCMntimepicker :"Increment Minute",		
		showHrtimepicker :"Pick Hour",
		showMntimepicker :"Pick Minute",		
		btnDecHrtimepicker :"Decrement Hour",
		btnDecMntimepicker :"Decrement Minute"
	},
	
	iti : {
		Autopartage : "Car sharing",
		Parking : "Car Park",
		Metrovelo : "Métrovélo",
		AgenceMetrovelo : "Métrovélo agency",
		ConsignesMetrovelo : "Métrovélo lockers",
		AgenceMetromobilite : "Métromobilité agency",
		Autres : "Others",
		plusDeDetails: "more details...",
		moinsDeDetails: "less details...",
		Distance : "Distance",
		DenivNeg : "D- ",
		DenivPos : "D+ ",
		tempsStationnement : "Parking time",
		minutes : "minutes",
		covoiturage : "Car polling",
		reservation : "On-demand trip only. To know more :",
		reservationSemaine : "On-demand trip only during the week. To know more :",
		lienTag : "Timetable",
		flexo : "TAG website",
		plusDOption : " More options",
		moinsDOption : " Less options",
		
		//Specifique pour la traduction de js
		itineraire :  "Itinerary",
		stopDepart : "Stop or address of departure",
		stopArrivee : "Stop or address of arrival",
		retour : "Return route",
		plusOptions : 'More options',
		apres : 'After',
		avant : 'Before',
		calculer : 'Plan',
		resultatsPrecedent : "Previous results",
		resultats : "Results",
		departPrecedent : "Previous departure",
		trajetDetail : "Route details",
		trafic : "traffic :",
		pieton : "Walk",
		velo : "Bike",
		transportCommun : "Public transport",
		teleferique : "Cable railway",
		voiture : "Car",
		pmr : "Wheelchair access",
		rechercheEnCours : "Current search",
		prochainsResultats : "Next results",
		prochainsDeparts : "Next departure",
		retourResultats : "Back to results",
		detail : "Details",
		voirCarte : "See all on map",
		imprimerCarte : "Print the road map",
		gps : "GPS track"
	},
	
	carteMobile : {
		nbTotVehicule : "Total number of available vehicles",
		nbTotPlace : "Total number of available parking spaces",
		photoStation : "Station picture",
		lignesProches : "Nearby ligne :",
		messageCAM : "Coming soon",
		messageCAMError : "Your browser does not support the video tag.",
		messagePMV : "No data",									 
		disponibles : " available : ",
		places : "park place(s)",
		velos : "bike(s)",
		velosdisponibles : "available bikes",
		placesdisponibles : "available parking places",
		etatDisponible : "Available",
		etatNonDisponible : "Not available"
	},
		
	// note: keep these lower case (and uppercase via template / code if needed)
	directions : {
			depart : 		"Departure",
			southeast:      "southeast",
			southwest:      "southwest",
			northeast:      "northeast",
			northwest:      "northwest",
			north:          "north",
			west:           "west",
			south:          "south",
			east:           "east",
			bound:          "bound",
			left:           "left",
			right:          "right",
			slightly_left:  "slight left",
			slightly_right: "slight right",
			hard_left:      "hard left",
			hard_right:     "hard right",
			'continue':     	"continue on",
			to_continue:    "to continue on",
			becomes:        "becomes",
			at:             "at",
			on:             "on",
			to:             "to",
			via:            "via",
			circle_counterclockwise: "take roundabout counterclockwise",
			circle_clockwise:        "take roundabout clockwise",
			// rather than just being a direction, this should be
			// full-fledged to take just the exit name at the end
			elevator: "take elevator to",
			stops : "stops"
	},
	// see otp.planner.Templates for use ... these are used on the trip
	// itinerary as well as forms and other places
	instructions : {
			walk         : "Walk",
			walk_toward  : "Walk",
			walk_verb    : "Walk",
			bike         : "Bike",
			bike_toward  : "Bike",
			bike_verb    : "Bike",
			drive        : "Drive",
			drive_toward : "Drive",
			drive_verb   : "Drive",
			move         : "Proceed",
			move_toward  : "Proceed",
			transfer     : "transfer",
			transfers    : "transfers",
			transit_toward : "transit toward",
			transit_towards : "transit towardS",
			step_out 	 : "step out",
			continue_as  : "Continues as",
			stay_aboard  : "stay on board",
			depart       : "Departure",
			arrive       : "Arrival",
			start_at     : "Start at",
			end_at       : "End at",
			exit 		 : "Exit"
	},
	// see otp.planner.Templates for use -- one output are the itinerary leg
	// headers
	modes : {
			WALK:           "Walk",
			BICYCLE:        "Bicycle",
			CAR:            "Car",
			TRAM:           "Tram",
			SUBWAY:         "Subway",
			RAIL:           "Rail",
			BUS:            "Bus",
			FERRY:          "Ferry",
			CABLE_CAR:      "Cable Car",
			GONDOLA:        "Gondola",
			FUNICULAR:      "Funicular"
	},

	ordinal_exit : {
			1:  "to first exit",
			2:  "to second exit",
			3:  "to third exit",
			4:  "to fourth exit",
			5:  "to fifth exit",
			6:  "to sixth exit",
			7:  "to seventh exit",
			8:  "to eighth exit",
			9:  "to ninth exit",
			10: "to tenth exit"
	},
	detail : {
			detailTrajet : "Detailed route",
			fermerDetailTrajet : "Close the detailed route",
			voieSansNom : "Nameless route",
			rondPoint : "at roundabout"
	},

	resultatsASupprimer : {
		1 : " on <strong>Nameless road</strong>"
	},
	resultatsARemplacer : {
		1 : ""
	},
	alert: [ 	"WARNING! Please fill your address of departure and arrival!",
				"WARNING! Please enter an arrival address different from departure!",
				"WARNING! Address not found...<br/> Please select another one...",
				"Warning, you do not have internet connection... this app may not work correctly. Try to reconnect and restart the application.",
				"Back of the Internet connection , this application will work properly again..",
				"Please enable receipt of notification for this application, restart and try again",
				"Please correctly enter your login and password and try again",
				"Echec de l'authentification, merci de vérifier votre abonnement",
				"Authentication failed , thank you to verify your subscription",
				"The server is unavailable, thank you again later",
				"Failed, unknown error. Please restart the application and try again"
	],
	libelleAffiche_1 : "Display the ",
	libelleHorairePrec_2 : "  previous schedules",
	libelleHoraireSuivant_2 : "  next schedules",
	libelleHorairePrec : "&lt;&lt; Previous schedules",
	libelleHoraireSuiv : "Next schedules &gt;&gt;",
	libelleFicheTag : "&nbsp Timetable in PDF format",
	libelleMessageFlexo : "This is an on-demand bus line during off-peak hours. It is necessary to book this trip 2 hours before travelling, on the TAG website (tag.fr) or by calling 04-38-70-38-70",
	libelleMessageFlexoWe : "This is an on-demand bus line on during week, and regularly on Saturday. During the week, it is necessary to book this trip 2 hours before travelling, on the TAG website (tag.fr) or by calling 04-38-70-38-70",
	libelleMessageErreurHoraires : "Further to a dysfunction we are not able to provide the line timetables. We advise you to consult the following timetables, PDF format.",
	indiceAtmo : [
		"Unknown",
		"Very good",
		"Very good",
		"Good",
		"Good",
		"Average",
		"Poor",
		"Poor",
		"Bad",
		"Very bad",
		"Very bad"],
	indiceTrafic : [
		"Unknown",
		"Fluid",
		"Slow",
		"Blocked",
		"Closed"],
	indiceTC : [
		"Unknown",
		"Normal service",
		"Disrupted service",
		"Seriously disrupted service",
		"Service out of schedule"],
	alertHoraire : [ 
			"Impossible to load json data, please refresh your page.",
			"This direction is no more used until the end of service"],
	aucunHoraireTR : "No departure for the moment.",
	donneesManquantes : "Data unavailable. Refer to timetables.",
	horairesTheoriques : " : realtime schedules",
	velo : {
			nom_commune : "Town",
			type_amenagement : "Chap of arrangement"},
	itineraire : {
			dep : "from",
			depart : "departure",
			arrivee : "arrival",
			arr : "to",
			departAvant : "departure after",
			arriveeApres : "arrival before",
			duree : "duration",
			trafic : "traffic",
			emission : "CO2 Emission"},
	erreurPosition : [
		"Error during the geo-localization : ",
		"Timeout!",
		"Permission is required",
		"Undefined location",
		"Make sure Location Services are enable for Métromobilié and try again."
	],
	questionLocaliser : "Activate localization ?",
	alerteHorsRectangle : "It seems that you are too far away from Grenoble, there is no data in this area",
	pub : {
			text : "Service powered by Métromobilité",
			alt : "Click here to go to metrobilite.fr"
	},
	opendata: {
		horairesTheoriquesTAG : {
			desc :"Timetables TAG network in GTFS format.."
		},
		format : {
			GTFS : "GTFS format specifications are available <a href='https://developers.google.com/transit/gtfs/reference' title='Specifications of GTFS format - New window' target='_blank'>here</a>."
		}
	},
	popup: {
		arret: "Stop",
		maintenant: "Now",
		plusTard: "Later",
		non: "No thanks",
		oui: "Yes",
		renseigner: "Please provide the above items"
	},
	appMobile: {
		rateMe : "You like this app? Please rate it and post a comment.",
		autour : "Around me",
		AUTOUR : "AROUND ME",
		itineraire : "Routes",
		itineraires : "Routes",
		ITINERAIRE : "ROUTES",
		infoTrafic : "Traffic info",
		trafic: "Traffic",
		TRAFIC: "TRAFFIC",
		horaires: "Schedules",
		HORAIRES: "SCHEDULES",
		favoris: "Bookmarks",
		FAVORIS: "BOOKMARKS",
		parametres: "Settings",
		PARAMETRES: "SETTINGS",
		aPropos: "About",
		APROPOS: "ABOUT",
		alerteSignalement : "Alert Reporting",
		ATMO: "AIR QUALITY",
		Atmo: "Air quality",
		monCompte: "My account",
		MONCOMPTE: "MY ACCOUNT",
		indiceAtmo:"Air quality",
		agrandir: "Increase size of map",
		cartographieAtmo: "Air quality map",
		annuler: "Cancel",
		supp: "del.",		
		suppTout: "del. all",
		affiche:"display",			  
		reseauRoutier: "Road network",
		evenements: "Events",
		cameras: 'Webcams',
		parking: 'Car park',
		parkingRelais: 'Park and ride',
		venteTitres:'Retail outlets',
		pointsServices:'Services Points',
		distributeurs:'Automated ticket machines',
		depositaires:'Relais TAG',
		arrets:'Stops',
		poteaux:'Stops',
		tc: "Public transport",
		bonjour: "Hello ",
		afficher: "Display : ",
		derniereMaj: "Last update : ",
		rue: "Street",
		lieu: "Place",
		pmv: "Signs",
		autostop:"organised hitch hiking",	
		recharge : "electric charging stations",
		camera: "Traffic Cameras",
		parking: "Parkings",
		PR: "Park and ride",
		resulatrecherche: "Search result",
		signaler: "To report an event to Métromobilité, please complete the form below and possibily provide a picture.",
		accident: "Accident",
		bouchon: "Traffic jam",
		obstacle: "Obstruction",
		autre: "Other",
		descriptionEvenement: "Event description",
		inclurePosition: " Include my location",
		inclurePositionDesc: " In order to include your location , enable the location service then click here.",
		prendrephoto: " Take a picture",
		application : "Grenoble Alpes Métropole application",
		creditTechnique:  "Technical Credits: ",
		mentionsLegales : "General conditions of use ",
		creditDonnees : "Data credits:  ",
		siteWeb : "Website:  ",
		faq : "FAQ : ",
		contact : "Contact : ",
		envoyerMail : " Send email",
		version : "Version : ",
		serviceSIV : "You must have an account to use this function. Register here :",
		identifiant : "Your username",
		entrezIdentifiant : "Enter your username",
		motDePasse : "Your password",
		entrezMotDePasse : "Enter your password",
		valider : "OK",
		cliquezValider : "By clicking the OK button you will receive your alerts directly on your phone.",
		modesilencieux : "silent mode",
		modeSonnerie : "ring mode",
		modeVibreur : "vibrate mode",
		nbspArret : "stops",
		departItineraire : "starting route",
		arriveeeItineraire : "ending route",
		selectionnezPanneau : "Select the line in the left panel",
		notifications : "Notifications",
		mesAlertes : "My alerts",		
		placesLibres : "Free Places: ",
		triParcours : "Sort by route's order",
		triAlphabetique : "Sort by alphabetical order",
		accueil : "Home",
		langage : "Language",
		pagedemarrage : "Home page"
	}
};
