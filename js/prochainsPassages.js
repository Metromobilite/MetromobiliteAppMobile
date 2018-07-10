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
// getListeArretsLigne
//--------------------------------------//
function getListeArretsLigne(codeLigne){

	var searchUrl = url.ws();
	//searchUrl += '/api/routers/'+url.otp2Router+'/index/routes/'+codeLigne.replace('_',':')+'/stops';
	searchUrl += '/api/routers/'+url.otp2Router+'/index/routes/'+codeLigne.replace('_',':')+'/clusters';

	fct_attente_horaires(true);
	$.ajax({
		type: "GET",
		url: searchUrl,
		error:error,
		dataType: 'json'
	}).then(function(res) {
		fct_attente_horaires(false);
		/*var zones = {};
		
		res.forEach(function(e){
			if (!e.cluster)
				console.log('Pas de cluster :' + JSON.stringify(e));
			else {
				var code = e.id.split(':')[0]+':'+e.cluster.substr(e.cluster.indexOf(':')+1);
				zones[code]=e.name;
			}
		});*/
		$( document ).trigger( 'evtArretsLigneCharges', [codeLigne, res] );
	});
}

//--------------------------------------//
// getProchainsPassages
//--------------------------------------//
function getProchainsPassages(type,codeArret,codeLigne,nbTripsAffiches){
	if (!codeArret || !codeLigne) return;
	var searchUrl;
	if(type=='pointArret') {
		searchUrl = url.ws();
		searchUrl += '/api/routers/'+url.otp2Router+'/index/stops/'+codeArret.replace('_',':')+'/stoptimes';
	} else {
		searchUrl = url.ws();
		searchUrl += '/api/routers/'+url.otp2Router+'/index/clusters/'+codeArret.replace('_',':')+'/stoptimes'+(codeLigne?'?route='+codeLigne:'');
	}
	fct_attente_horaires(true);
	$.ajax({
		type: "GET", 
		url: searchUrl,
		error:error,
		//dataType: 'json'
		dataType: 'json'
	}).then(function(res) {
		fct_attente_horaires(false);
		var passages = {};
		res.forEach(function(r){
			if(r.pattern) {
				var code = r.pattern.id.split(':',2).join('_');
				if(!passages[code]) passages[code] = {dir1:{name:'',times:[]},dir2:{name:'',times:[]}}
				var p = passages[code];
				//quelle direction on remplit
				var dir = (r.pattern.dir?p['dir'+r.pattern.dir]:(p.dir1.times.length>0?p.dir2:p.dir1));
				if(dir.name == '') dir.name = r.pattern.desc;
				//recup des horaires
				for (var i=0;i<r.times.length && i<nbTripsAffiches;i++) {
					var time = (r.times[i].realtimeDeparture? r.times[i].realtimeDeparture : r.times[i].scheduledDeparture);
					if (time)
						dir.times.push({ dest:r.pattern.desc,
									 time:(time*1000)+(r.times[i].serviceDay*1000),
									 realtime:r.times[i].realtime,
									 bTropLong:(time*1000)+(r.times[i].serviceDay*1000) > (new Date().getTime())+(65*60*1000)
									});
				}
			}
		});
		var code = codeLigne.replace(':','_');
		for (var d in passages[code]) {
			var dir = passages[code][d];
			dir.times.sort(function(a,b){
				return a.time - b.time;
			});
			if (nbTripsAffiches > 1)
				dir.times=dir.times.slice(0,nbTripsAffiches-1);
		}
		$( document ).trigger( 'evtProchainsPassagesCharges', [type, codeArret, codeLigne, passages] );
	});
}