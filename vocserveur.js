console.log("Javascript actif.")
console.log("Git Actif");
let currentFileConnbTentative = "";
let currentFileAsObject;
let nbQuestion = 0;
let theQuestion = "";
let theResponse = "";
let helpedPoints = 0;
let helpedChecks = 0;
let scoreByQuestion = 0;
let scoreByPoints = 0;
let nbPoints = 0;
let nbTentative = -1;
let nbTranslation = 0;
let nbItem = document.getElementById("menu").children.length;
let finishedBlocArray = new Array();
let step=0;

startApp();








document.getElementById("guide").onclick = function() {
    for(let i=0;i<nbQuestion;i++){
        document.getElementById("rep" + i).value=document.getElementById("translation" + i).innerHTML;
    }
}

document.getElementById("myFile").addEventListener('change', readSingleFile, false);

document.getElementById("newTest").onclick = function() {
    window.location.reload();
};

document.getElementById("top").onclick = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

document.getElementById("refresh").onclick = function() {
    refresh();
};

let arrayFilterSize = ["All", "5", "7", "10"];
arrayFilterSize.forEach(element => document.getElementById(element).onclick = function() { setNavFilterQuestion(element) });

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


var synth = window.speechSynthesis;
var available_voices;

// list of languages is probably not loaded, wait for it

if (window.speechSynthesis.getVoices().length == 0) {
    window.speechSynthesis.addEventListener('voiceschanged', function() {
        
    });
}

function textToSpeech(textToSpeechNumber,origin) {
    // get all voices that browser offers
    var available_voices = window.speechSynthesis.getVoices();
    // this will hold an english voice
    var english_voice = '';
    // find voice by language locale "en-US"
    // if not then select the first voice
    for (var i = 0; i < available_voices.length; i++) {
        if (available_voices[i].lang === 'en-US') {
            english_voice = available_voices[i];
            break;
        }
    }
    if (english_voice === '')
        english_voice = available_voices[5];
    // new SpeechSynthesisUtterance object
    var utter = new SpeechSynthesisUtterance();
    utter.rate = 1;
    utter.pitch = 0.5;
    console.log( "textToSpeechNumber=" +textToSpeechNumber);
    if (origin==="final") utter.text = ((document.getElementById("exampleFinal" + textToSpeechNumber)).innerHTML).split(">")[1].split("<")[0];
    if (origin==="trad") utter.text = document.getElementById("textExempl" + textToSpeechNumber).innerHTML;
    if (origin==="question") utter.text = ((document.getElementById("question" + textToSpeechNumber).innerHTML).split(";")[2]).split("<")[0];
    utter.voice = english_voice;
    // event after text has been spoken
    utter.onend = function() {  
        if (document.getElementById("speechFinal" + textToSpeechNumber)) document.getElementById("speechFinal" + textToSpeechNumber).classList.remove("speaking"); 
        if (document.getElementById("speechTrad" + textToSpeechNumber)) document.getElementById("speechTrad" + textToSpeechNumber).classList.remove("speaking"); 
        if (document.getElementById("question" + textToSpeechNumber)) document.getElementById("question" + textToSpeechNumber).classList.remove("speaking");     
        //alert('Speech has finished');
    }
    // speak    
    window.speechSynthesis.speak(utter);
}






////PRINCIPLE HTML MENU LI
//Role: Lance l'application
function startApp() {
    let itemList= document.getElementById("menu").querySelectorAll("a.item");
    for (let i = 0; i < itemList.length; i++) {
        let rubrique = itemList[i].id;
        //console.log("rubrique=" + rubrique);
        document.getElementById(rubrique).onclick = function() {
            let fichier = "json/" +rubrique+ ".json";
            let item = i;
            loadXMLHttp(fichier, i);
            showTest();
            let t = document.getElementById(rubrique).innerHTML;
            //console.log("fichier=" + t);
            let subT = document.getElementById(rubrique).title;
            //console.log(subT);
            showTitre(subT);
        }
    }
}

/////BY DOWNLOADED FILE
// 1 parametre: fichier 
//Role: lire le contenu du fichier + lancement des fonctions d'affichage.
function readSingleFile(evt) {
    //Retrieve the first (and only!) File from the FileList object
    let f = evt.target.files[0];
    if (f) {
        let r = new FileReader();
        r.onload = function(e) {
            currentFileConnbTentative = e.target.result;
            currentFileAsObject = JSON.parse(currentFileConnbTentative);
            showTest();
            showAllContent(currentFileAsObject);
            let fileURL = document.getElementById("myFile").value;
            let fileURLSplit = fileURL.split("\\");
            let fileName = fileURLSplit[fileURLSplit.length - 1];
            //console.log("File = " + fileName);
            let t = fileName;
            //console.log("fichier=" + t);
            showTitre(t);
            initSCore();
        }
        r.readAsText(f);
    }
}

//////BY XMLHttp REQUEST
//Role: Chargement XMLHttp et lancement des fonctions d'affichage.
function loadXMLHttp(fichier, i) {
    //console.log("fichier=" + fichier);
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        //console.log("fichier=" + fichier);
        if (this.readyState == 4 && this.status == 200) {
            currentFileAsObject = JSON.parse(this.responseText);
            showAllContent(currentFileAsObject, i);
            initSCore()
        }
    }
    //console.log("fichier=" + fichier);
    xmlhttp.open("GET", fichier, true);
    xmlhttp.send();
}

//Role: Affichage du mot "SCORE" en attente des points
function initSCore() {
    if (document.getElementById("points").innerHTML === "") document.getElementById("points").innerHTML = "SCORE";
}

//1arametre: OBJET tableau du Json chargé
//Role     :Lancement des fonctions de création du contenu
function showAllContent(currentFileAsObject) {
    createContainerBefore("content");
    testLangAndDisplayQuestion(currentFileAsObject);
    displayAndCreateAdditionalContent();
}

//Role: Ajout des classes CSS sur les elements du DOM créés
function showTest() {
    document.getElementById("menuOpen").setAttribute('style','display:none');
    document.getElementById("newTest").setAttribute('style','display:block');
    document.getElementById("refresh").setAttribute('style','display:block');
}

//1 parametre: Variable globale du nombre de question
//role       : Test si ajout de la navigation de filtrage
function testShowFilter(nbQuestion) {
    if (nbQuestion >= 10) {
        document.getElementById("navChoixFilter").setAttribute('style','display:block');
    }
}

//1 parametre: nom du fichier chargé (filename) ou  texte de la rubrique (innerHTML)
//Role: Ajout contenu du titre et visibilité du titre
function showTitre(t) {
    let titre = t;
    document.getElementById("titre").innerHTML = t;
    console.log("////////////////");
    document.getElementById("titre").setAttribute('style','display:block');
}

//////BY INPUT SELECT
//Role: Chargement XMLHttp via menu déroullant
/*document.getElementById("selection").onchange = function() {
    let temp = parseFloat(document.forms.fichier.selection.options.selectedIndex);
    let fichier = "voc0" + (temp + 1) + ".json";
    loadXMLHttp(fichier);
    showTest();   
    let test = document.getElementById("selection");
    let titre = test[test.selectedIndex].innerText;
    document.getElementById("titre").innerHTML = titre;
}*/


////////////////////////////////////////////////////////////////////////////// AFFICHAGE

//1 parametre: OBJET tableau du Json chargé
//Role: - Effacement du titre principale (gain de place)
//      - Initialisation de nbQuestion
//      - Lance le test filter
//      - Lance l'Affichage des questions :
//              - soit Random FR/EN des questions
//              - soit EN si le json contient une string "french" à vide
function testLangAndDisplayQuestion(currentFileAsObject) {
    document.getElementById("headerTitle").innerHTML = "";
    nbQuestion = currentFileAsObject.length; /////////////////////////////////////////////////initialisation nbQuestion
    document.getElementById("nbQuestion").innerHTML= "<h2 style=\"font-weight:300!important\">This test contains <br/><strong style=\"font-weight:700!important;font-size:30px;\"> " + nbQuestion+ " questions</strong></h2>";
    testShowFilter(nbQuestion);
    for (let x = 0; x < nbQuestion; x++) {
        if (!currentFileAsObject[x].help["possibleEN"]) {
            displayQuestion(currentFileAsObject, x, "EN")
        } else {
            randomDisplay(currentFileAsObject, x);
        }
    }
}

//2 parametres: OBJET tableau du Json chargé -  numero question en cours
//Role: Affiche la question en EN ou FR avec un facteur aléatoire de 1/4 en faveur du EN
function randomDisplay(currentFileAsObject, x) {
    randomNumber = getRandInteger(0, nbQuestion);
    if (currentFileAsObject[x].help["possibleFR"]==="") {
        displayQuestion(currentFileAsObject, x, "EN");
    }else{
        if (randomNumber < nbQuestion /4) displayQuestion(currentFileAsObject, x, "FR");
        else(displayQuestion(currentFileAsObject, x, "EN"));
    }
}

//2 parametres: valeurs minimum et maximum de limite du random
//Role:       : choix Aléatoire d'un nombre en fonction des parametres
//Retour      : nombre
function getRandInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

//3 parametres: currentFileAsObject= OBJET tableau du Json chargé - x= num current question -  lang= parametre de langue (EN ou FR) 
//Role:       : Affichage des contenu des questions
function displayQuestion(currentFileAsObject, x, lang) {
    if (lang === "EN") {
        theQuestion= "<i id=\"speechQuest" +x+ "\" class=\"fas fa-volume-up speechQuest\"></i>&nbsp;&nbsp;" +(currentFileAsObject[x].question);
        hiddenResponse = getTempPlaceholder(currentFileAsObject[x].reponse);
        theHelpOpened = currentFileAsObject[x].help["french"] + " (" + currentFileAsObject[x].help["type"] + ")";
    }
    if (lang === "FR") {
        theQuestion ="<i id=\"speechQuest" +x+ "\" class=\"fas fa-volume-up speechQuest\"></i>&nbsp;&nbsp;" + currentFileAsObject[x].reponse;
        hiddenResponse = getTempPlaceholder(currentFileAsObject[x].help["french"]);
        theHelpOpened = currentFileAsObject[x].question + " (" + currentFileAsObject[x].help["type"] + ")";
    }
    theHelpClosed = "...";
    theExample = currentFileAsObject[x].exemple;
    createQuestions("container", x);
    document.getElementById("question" + x).innerHTML += theQuestion;
    document.getElementById("rep" + x).innerHTML += hiddenResponse;
    document.getElementById("helpOpened" + x).innerHTML += theHelpOpened;
    document.getElementById("help" + x).innerHTML += theHelpClosed;
    document.getElementById("check" + x).innerHTML += "CHECK NOW ?";
    if (lang === "EN") {
        theResponse = currentFileAsObject[x].reponse;
        document.getElementById("rep" + x).style.backgroundColor = "#fce1f6";//rose
        document.getElementById("rep" + x).style.color = "#f510c7";
        document.getElementById("translation" + x).innerHTML += theResponse.replace("_", " ").replace("_", " ");
        document.getElementById("lang" + x).innerHTML += "EN";
        if (currentFileAsObject[x].help["possibleFR"]==="") {
            document.getElementById("lang" + x).classList.add("langNONE");
            document.getElementById("lang" + x).innerHTML=currentFileAsObject[x].help["possibleEN"];
        }else{
            document.getElementById("lang" + x).classList.add("langEN");
        }
    }
    if (lang === "FR") {
        theResponse = currentFileAsObject[x].help["french"];
        document.getElementById("rep" + x).style.backgroundColor = "#cee5ff";//bleu
        document.getElementById("rep" + x).style.color = "blue";
        document.getElementById("translation" + x).innerHTML += theResponse;
        document.getElementById("lang" + x).innerHTML += "FR";
        document.getElementById("lang" + x).classList.add("langFR");
    }
}

//1 Parametre : div HTML de reference pour insertion before
//Role        : creation DOM du container des Questions
function createContainerBefore(divId) {
    let newDivC = document.createElement("div");
    newDivC.id = "container";
    newDivC.classList.add("container");
    let targetDiv = document.getElementById(divId);
    document.body.insertBefore(newDivC, targetDiv);
}

//2 parametres : div HTML de ref pour insertion inside  - numero question en cours
//Role         : - creation DOM des questions
//               - création DOM de la bulle Help (Indications) + on click
//               - création DOM de la langue (3 examples) + on click
//               - creation DOM du curseur (translation) + on click
function createQuestions(divId, questionNumber) {
    let newSection = document.createElement("SECTION");
    let newDivColL = document.createElement("div");
    let newDivQuestion = document.createElement("div");
    let newDivHelp = document.createElement("div");
    let newDivHelpO = document.createElement("div");
    let newDivRight = document.createElement("div");
    let newDivLang = document.createElement("div");
    let newDivCheck = document.createElement("div");
    let newDivTraduction = document.createElement("div");
    let newDivExemple = document.createElement("div");
    let newTextResponse = document.createElement("textarea");
    let newDivCommut = document.createElement("div");
    let newDivCurs = document.createElement("div");
    let newSpanCursor = document.createElement("span");
    newSection.id = "s" + questionNumber;
    newDivColL.id = "left" + questionNumber;
    newDivColL.classList.add("colL");
    newDivQuestion.id = "question" + questionNumber;
    newDivQuestion.classList.add("question");
    newDivQuestion.setAttribute("style","cursor:pointer");
    newDivQuestion.onclick = function() {            
        let elt = this;
        let textToSpeechId = this.getAttribute("id");
        let textToSpeechNumber = (textToSpeechId.split("n")[1]);
        console.log(textToSpeechId);
            if (!this.classList.contains("speaking")) {
                this.classList.add("speaking");
                textToSpeech(textToSpeechNumber, "question");
            }else{
                this.classList.remove("speaking");
                window.speechSynthesis.cancel();
            }                
        }
    newDivHelp.id = "help" + questionNumber;
    newDivHelp.classList.add("help");
    newDivHelp.classList.add("closed");
    newDivHelp.setAttribute("style","display:block");
    newDivHelp.setAttribute('title', 'indications');
    newDivHelp.onclick = function() {
        switchHelpIndications(questionNumber, false);
    };
    newDivHelpO.id = "helpOpened" + questionNumber;
    newDivHelpO.classList.add("help");
    newDivHelpO.classList.add("opened");
    newDivHelpO.setAttribute("style","display:none")
    newDivRight.id = "right" + questionNumber;
    newDivRight.classList.add("colR");
    newDivLang.id = "lang" + questionNumber;
    newDivLang.setAttribute('title', "Show the proposals");
    newDivLang.onclick = function() {
        switchHelpPossibilities(questionNumber);
    };
    newDivCheck.id = "check" + questionNumber;
    newDivCheck.setAttribute('backgroundColor', "#fdb887");
    newDivCheck.classList.add("check");
    newDivCheck.onclick = function() {
        clickCheckNow(questionNumber,true);
    };
    newDivCheck.addEventListener("keydown",function(event){
        if (event.keyCode === 13) {
            event.preventDefault();
            clickCheckNow(questionNumber,true);
        }    
    });
    newDivCheck.setAttribute("style","display:none");
    newDivCheck.setAttribute("tabindex","0");
    newDivTraduction.id = "translation" + questionNumber;
    newDivTraduction.classList.add("translation");
    newDivTraduction.setAttribute('style','display:none');
    newDivExemple.id = "exempl" + questionNumber;
    newDivExemple.classList.add("exempl");
    newDivExemple.setAttribute("style","display:none");
    newTextResponse.id = "rep" + questionNumber;
    newTextResponse.setAttribute("tabindex","0");
    newTextResponse.classList.add("rep");
    newTextResponse.setAttribute('type', 'text');
    newTextResponse.setAttribute('rows', 2);
    newTextResponse.setAttribute('maxlength', 25);
    newTextResponse.setAttribute('mane', 'rep');
    newTextResponse.setAttribute('wrap', 'hard');
    newTextResponse.setAttribute('placeholder', hiddenResponse);
    newTextResponse.setAttribute('name', "");
    newTextResponse.onfocus = function() {
        if(document.getElementById("commut" + questionNumber).classList.contains("showTranslation"))switchTranslation(questionNumber);
        newTextResponse.innerHTML = "";
        thisFocus(questionNumber);
    };
    newDivCommut.id = "commut" + questionNumber;
    newDivCommut.classList.add("commutPosi");
    newDivCommut.setAttribute('title', 'Translation');
    newDivCommut.onclick = function() {
        switchTranslation(questionNumber);
    };
    newDivCurs.id = "curs" + questionNumber;
    newDivCurs.classList.add("curs");
    newSpanCursor.id = "slider" + questionNumber;
    newSpanCursor.classList.add("slider");
    document.getElementById(divId).appendChild(newSection);
    newSection.appendChild(newDivColL);
    newSection.appendChild(newDivExemple);
    newDivColL.appendChild(newDivQuestion);
    newDivColL.appendChild(newDivHelp);
    newDivColL.appendChild(newDivHelpO);
    newDivRight.appendChild(newDivCommut);
    newDivRight.appendChild(newDivLang);
    newDivRight.appendChild(newDivTraduction);
    newDivRight.appendChild(newTextResponse);
    newDivRight.appendChild(newDivCheck);
    newDivCommut.appendChild(newDivCurs);
    newDivCurs.appendChild(newSpanCursor);
    newSection.appendChild(newDivRight);
}

//1 Parametre : Taille de filtrage choisi  
//Role        : Lance la création des groupes de questions à afficher en fonction du flitrage choisi (4 niveaux de filtrage (ALL, 5, 7, 10))
//              + Cache la navigation de choix de filtrage
function setNavFilterQuestion(selectedFilterSize) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById("navChoixFilter").setAttribute('style','display:none');
    switch (selectedFilterSize) {
        case "All":
            selectedFilterSize = 0;
            break;
        case "5":
            selectedFilterSize = 5;
            document.getElementById("titre").innerHTML += "&nbsp;<h12> By&nbsp;" + selectedFilterSize + "</h12>";
            createBtnFilterQuestion(selectedFilterSize);
            break;
        case "7":
            selectedFilterSize = 7;
            document.getElementById("titre").innerHTML += "&nbsp;<h12> By&nbsp;" + selectedFilterSize + "</h12>";
            createBtnFilterQuestion(selectedFilterSize);
            break;
        case "10":
            selectedFilterSize = 10;
            document.getElementById("titre").innerHTML += "&nbsp;<h12> By&nbsp;" + selectedFilterSize + "</h12>";
            createBtnFilterQuestion(selectedFilterSize);
            break;
        default:
    }
}

//2 Parametres: 
//Role        : click event du fitre lance la création de la barre de nav interne des filtres (1,2,3,....)
function filterQuestion(idElt, selectedFilterSize) {
    hideAllQuestion();
    let startQuestionFilter = selectedFilterSize * idElt; //OK entier
    let endQuestionFilter = selectedFilterSize * (eval(idElt) + 1);
    if (endQuestionFilter > nbQuestion)
        endQuestionFilter = nbQuestion;
    displayFilteredQuestion(startQuestionFilter, endQuestionFilter, selectedFilterSize);
}

//3 Parametres: n° filtre debut  - n° filtre fin  - taille de filtrage
//Role: applique la class visOff pour fair disparaitre les sections hors du filtre actuel
function displayFilteredQuestion(startQuestionFilter, endQuestionFilter, selectedFilterSize) {
    for (i = startQuestionFilter; i < endQuestionFilter; i++) {
        let section = "s" + i;
        currentNbQuestion = endQuestionFilter - startQuestionFilter;
        document.getElementById(section).classList.remove("visOffFilterQuestion");
    }
}

//1 Parametre : Taille de filtrage choisi 
//Role        : creation DOM de la barre de navigation des filtres
//              - click event sur chaque btn interne
//              - coloration du filtre 0 actif (online = orange)
function createBtnFilterQuestion(selectedFilterSize) {
    let newDiv = document.createElement("div");
    let newDivInside = document.createElement("div");
    let targetDiv = document.getElementById("penalty");
    newDiv.id = "containerFilters";
    newDiv.setAttribute("style","display:block;")
    newDivInside.id = "filterQuestions";
    document.body.insertBefore(newDiv, targetDiv);
    newDiv.appendChild(newDivInside);
    let nbBtnFilter = 0;
    if ((nbQuestion % selectedFilterSize) === 0) {
        nbBtnFilter = parseInt(nbQuestion / selectedFilterSize);
    } else {
        nbBtnFilter = parseInt(nbQuestion / selectedFilterSize) + 1;
    }
    ////////////variable globale initialisation finishedBlocArray ////////////////////////////////////////////////
    finishedBlocArray = new Array(nbBtnFilter);
    for (i = 0; i < nbBtnFilter; i++) {
        let newSpanFilter = document.createElement("span");
        newSpanFilter.id = "filter" + i;
        newSpanFilter.classList.add('filter');
        newSpanFilter.classList.add('statusBleu');
        newSpanFilter.onclick = function() {
            let elt = this;
            let idElt = this.getAttribute('id');
            ClickFilterQuestions(idElt.slice(6), selectedFilterSize, nbBtnFilter);
        };
        newSpanFilter.innerHTML += i + 1;
        newDivInside.appendChild(newSpanFilter);
    }
    document.getElementById("filter0").click();
    setColorFilterBtn(0, "online");
}

// 1 parametre: id de la div HTML de reference inside
// Role       : creation DOM  des div de SCORE, POINTS et PENALITES. 
function createScorePoints(divId) {
    let newSection = document.createElement("SECTION");
    let newDivTotal = document.createElement("div");
    let newDivScoring = document.createElement("div");
    let newDivPoints = document.createElement("div");
    let targetDiv = document.getElementById(divId);
    newSection.id = "penalty";
    newSection.setAttribute('style','display:none');
    newDivTotal.classList.add("total");
    newDivScoring.id = "score";
    newDivScoring.classList.add("score");
    newDivPoints.id = "points";
    newDivPoints.classList.add("points");
    document.body.insertBefore(newSection, targetDiv);
    newSection.appendChild(newDivScoring);
    document.getElementById("totaux").appendChild(newDivPoints);
}

// 1 parametre: id de la div HTML de reference inside
// Role       : creation DOM du btn TESTER  + onclick event
function createBtnTester(divId) {
    let newDivFixedButton = document.createElement("div");
    newDivFixedButton.id = "fixedBtnBottom";
    let newDivButtonTest = document.createElement("button");
    newDivButtonTest.id = "tester";
    newDivButtonTest.innerHTML = "TEST ALL QUESTIONS";
    newDivButtonTest.setAttribute("z-index", "100");
    newDivButtonTest.onclick = function() {
        getTest(currentFileAsObject);
    }
    document.getElementById(divId).appendChild(newDivFixedButton);
    newDivFixedButton.appendChild(newDivButtonTest);
}

// 1 parametre: id de la div HTML de reference inside
// Role       : creation DOM du texte de RECAP de fin
function createFinalText(divId) {
    let newDivContainerFinal = document.createElement("div"); 
    newDivContainerFinal.id = "containerFinal";
    document.getElementById(divId).appendChild(newDivContainerFinal);
    for (i = 0; i < nbQuestion; i++) { 
        let newDivFinal = document.createElement("div");
        let newDivInnerFinalL = document.createElement("div");
        let newDivInnerFinalR = document.createElement("div");
        let newDivFinalScore = document.createElement("div");
        let newDivFinalPoints = document.createElement("div");
        let newSpanFinalQuestion = document.createElement("span");
        let newSpanFinalPoints = document.createElement("span");
        let newSpanFinalResponse = document.createElement("span");
        let newSpanFinalExample = document.createElement("span");
        let newSpanFinalSpeech = document.createElement("span");
        let newSpanFinalTranlate = document.createElement("span");
        
        newDivFinal.id = "final" + i;
        newDivFinal.classList.add("blocFinal");
        newDivInnerFinalL.classList.add("finalL");
        newDivInnerFinalR.classList.add("finalL");       
        newDivFinalScore.id = "scoreEachQuestion" + i;
        newDivFinalScore.classList.add("finalR");       
        newSpanFinalQuestion.id = "questionFinal" + i;
        newSpanFinalQuestion.classList.add("final");        
        newSpanFinalPoints.id = "pointsFinal" + i;        
        newSpanFinalResponse.id = "responseFinal" + i;
        newSpanFinalResponse.classList.add("final");        
        newSpanFinalExample.id = "exampleFinal" + i;
        newSpanFinalExample.classList.add("final");  
        newSpanFinalSpeech.id = "speechFinal" + i;
        newSpanFinalSpeech.classList.add("speech"); 
        newSpanFinalSpeech.innerHTML= "<i class=\"fas fa-volume-up\"></i>";
        newSpanFinalSpeech.onclick = function() {            
            let elt = this;
            let textToSpeechId = this.getAttribute("id");
            let textToSpeechNumber = textToSpeechId.split("l")[1];
            if (!this.classList.contains("speaking")) {
                this.classList.add("speaking");
                textToSpeech(textToSpeechNumber, "final");
            }else{
                this.classList.remove("speaking");
                window.speechSynthesis.cancel();
            }                
        }    
        newSpanFinalTranlate.id = "translatFinal" + i;
        newSpanFinalTranlate.classList.add("final");
        newDivContainerFinal.appendChild(newDivFinal);
        newDivFinal.appendChild(newDivInnerFinalL);
        newDivFinal.appendChild(newDivInnerFinalR);
        newDivFinal.appendChild(newDivFinalScore);
        newDivInnerFinalL.appendChild(newSpanFinalQuestion);
        newDivInnerFinalL.appendChild(newSpanFinalTranlate);
        newDivInnerFinalR.appendChild(newSpanFinalResponse);
        newDivInnerFinalR.appendChild(newSpanFinalSpeech);
        newDivInnerFinalR.appendChild(newSpanFinalExample);
        newDivFinalScore.appendChild(newSpanFinalPoints);
    }
}

//Role: lance les fonctions de création DOM des contenus additionnels (Compteurs, btnTESTER, texte Final)
function displayAndCreateAdditionalContent() {
    createScorePoints("container");
    createBtnTester("content");
    createFinalText("finalText");
}

//1 parametre: string du texte à remplacer
//Role       : Remplace le texte par des "_"
//Retour     : string du texte transformé en "_"
function getTempPlaceholder(textToChange) {
    let newText = textToChange.replace(/[a-z0-9àéèêî]/gi, '_');
    return newText;
}

////////////// INTERACTIONS ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//1 Parametre= n° de la question
//Role = Onfocus sur la question masque la traduction si elle est affichée
function thisFocus(questionNumber) {
    for (let i = 0; i < nbQuestion; i++) {
        if (i === questionNumber) {
            document.getElementById("check" + i).setAttribute("style","display:block")
            document.getElementById("check" + i).classList.add("usedTranslation");
        } else {
            document.getElementById("check" + i).setAttribute("style","display:none")
            document.getElementById("check" + i).classList.remove("usedTranslation");
            document.getElementById("check" + questionNumber).innerHTML = "CHECK NOW ?";
            let top =(document.getElementById("s" + questionNumber).offsetTop)-66;
            window.scrollTo({ top: top, behavior: 'smooth' });
        }
    }
}

//Role   : Indique le status du btn interne actif de filtrage
//Retour : true / false
function currentSelectedFilterStatus() {
    let showEnd;
    let currentQuestions = document.getElementById("container").querySelectorAll("section:not(.visOffFilterQuestion)");
    let currentQuestionsPointed = document.getElementById("container").querySelectorAll("section.pointed:not(.visOffFilterQuestion)");
    //console.log(currentQuestionsPointed.length +"////"+ currentQuestions.length);
    if((currentQuestionsPointed.length>0)&&(currentQuestions.length>0)){
        currentQuestionsPointed.length >= currentQuestions.length ? showEnd = true : showEnd = false;
    }
    //console.log("showEnd=" + showEnd); 
    return showEnd;
}

// 1 Parametre: N° de la question
//Role        : Lance evalGood de la question en cours
//             + si correct changement de couleur + lancement des fonctions de gliss
//             + si incorrect message
//                     : evalGoodResponse()
//                     : endMessageAvecFiltre()
//                     : endMessageSansFiltre()
//                     : moveSection(questionNumber)
function clickCheckNow(questionNumber, isCurrentQuestion) {
    evalGoodResponse();
    if (document.getElementById("s" + questionNumber).classList.contains("evalGood") === true){
        document.getElementById("check" + questionNumber).innerHTML = "GOOD JOB!";
        document.getElementById("check" + questionNumber).style.backgroundColor = "#adfcb0"; //vert
        document.getElementById("rep" + questionNumber).style.backgroundColor = "#adfcb0"; //vert
        document.getElementById("rep" + questionNumber).classList.add("repOk");
        document.getElementById("s" + questionNumber).classList.add("pointed");

        if (document.getElementById("containerFilters")) {
            if (currentSelectedFilterStatus()) {
                endMessageAvecFiltre();
            } else {
                document.getElementById("message").setAttribute('style','display:none');
            }
        } else {
            endMessageSansFiltre(questionNumber);
        }
        let timer;
        if (isCurrentQuestion){
            timer = 400;
        }else{
            timer = 10;
        } 
        setTimeout(moveSection, timer, questionNumber);
        document.getElementById(nextFocus(questionNumber)).focus();

    } else {
        //console.log ("NOGOOD");
        document.getElementById("check" + questionNumber).innerHTML = "TRY AGAIN...";
        document.getElementById("check" + questionNumber).style.backgroundColor = "#fdb887"; //orange
        if ((isCurrentQuestion)&&(!document.getElementById("s" + questionNumber).classList.contains("clickChecked"))){
            document.getElementById("s" + questionNumber).classList.add("clickChecked");
            let testHelpEN = currentFileAsObject[questionNumber].help["possibleEN"];
            if (testHelpEN==="") helpedPoints++;
        }
        //console.log("isCurrentQuestion=" +isCurrentQuestion + "////   helpedPoints="+ helpedPoints + "/////" + currentFileAsObject[questionNumber].help["possibleEN"]);
        timer=600;
        if (isCurrentQuestion) setTimeout(getFocus,timer,questionNumber);
    }
}

// 1 parametre : N° de la question
//Role: donne le focus à l'élement passé en parametre
function getFocus(questionNumber){
    document.getElementById("rep" + questionNumber).focus();  
}

// 1 parametre : N° de la question
//Role: donne le focus à la section suivante de l'élément passé en parametre (même après changeOrder())
function nextFocus(questionNumber){
    let nextSectionToFocus ="";
    let listContainerQuestion= document.getElementById("container").children;
    indexQuestion = "";
    for(i=0;i<listContainerQuestion.length;i++){
        if (listContainerQuestion[i].id == "s" + questionNumber)
        {
            indexQuestion = i;
            break;
        }
    }
    if(indexQuestion+1 < listContainerQuestion.length)
        indexQuestion++;
    nextSectionToFocus = listContainerQuestion[indexQuestion].id;
    return nextSectionToFocus;
}


// 3 Parametres : id n° filtre cliqué  - taille Filtrage  - nombre de btn de filtrage
// Role         : - Lance l'update du status de tous les filtres internes
//                - Affichage du message de fin selon status du filtre en cours
//                       : filterQuestion(idElt, selectedFilterSize)
//                       : updateFilterStatus(i, selectedFilterSize, false, nbBtnFilter)
function ClickFilterQuestions(idElt, selectedFilterSize, nbBtnFilter) {
    document.getElementById("container").setAttribute('style','display:block'); 
    filterQuestion(idElt, selectedFilterSize);
    for (let i = 0; i < nbBtnFilter; i++) {
        if (i == idElt) {
            updateFilterStatus(i, selectedFilterSize, true, nbBtnFilter);
        } else {
            updateFilterStatus(i, selectedFilterSize, false, nbBtnFilter);
        }
        if (currentSelectedFilterStatus()) {
            endMessageAvecFiltre();
        } else {
            document.getElementById("message").setAttribute('style','display:none');
        }
    }
}

// 4 Parametres: n° de filtre  - taille de filtrage - filtre en cours ?(true/false)  - nombre totale de btn interne de filtrage
// Role        : update du status du filtre en cours  :
//               - 4 status :  notUsed, started, online, finished
//              + lance la coloration des btn interne selon status
//                      : setColorFilterBtn(filterNum, status)
function updateFilterStatus(filterNum, selectedFilterSize, isCurrentFilter, nbBtnFilter) {
    let questions = document.getElementById("container").children; ////.children to create question[]
    let blockStart = filterNum * selectedFilterSize;
    let blockLastQuestion = (filterNum + 1) * selectedFilterSize;
    let filterQuestions = new Array();
    let pointedCountStatus = 0;
    if (nbQuestion < blockLastQuestion) {
        blockLastQuestion = nbQuestion;
    }
    let status = "notUsed";
    for (var i = blockStart; i < blockLastQuestion; i++) {
        if (questions[i].classList.contains("pointed") === true) {
            status = "started";
            pointedCountStatus++;
            console.log("pointedCountStatus=" + pointedCountStatus +"  ///  "+ "blockStart="+ blockStart+"   blockLastQuestion="+blockLastQuestion);
        };
    }
    if (isCurrentFilter) {
        status = "online";
    }
    let tempSelectedFilterSize = blockLastQuestion - blockStart;
    let filterName = "filter" + filterNum;
    if ((pointedCountStatus >= tempSelectedFilterSize) || document.getElementById(filterName).classList.contains("finished") === true) {
        status = "finished";
        finishedBlocArray[filterNum] = true;
    }
    setColorFilterBtn(filterNum, status);
}

// 2 parametres : N° du btn filtre interne - status de ce btn
// Role         : Applique la couleur correspondant au status
function setColorFilterBtn(filterNum, status) {
    let filterName = "filter" + filterNum;
    switch (status) {
        case "notUsed":
            document.getElementById(filterName).classList.add("statusBleu");
            document.getElementById(filterName).classList.remove("statusOrange");
            document.getElementById(filterName).classList.remove("statusVert");
            break;
        case "online":
            document.getElementById(filterName).classList.add("statusOrange");
            document.getElementById(filterName).classList.remove("statusBleu");
            document.getElementById(filterName).classList.remove("statusVert");
            break;
        case "started":
            document.getElementById(filterName).classList.add("statusVert");
            document.getElementById(filterName).classList.remove("statusOrange");
            document.getElementById(filterName).classList.remove("statusBleu");
            break;
        case "finished":
            document.getElementById(filterName).classList.add("statusFluo");
            document.getElementById(filterName).classList.add("finished");
            document.getElementById(filterName).classList.remove("statusVert");
            document.getElementById(filterName).classList.remove("statusBleu");
            break;
        default:
    }
}


//Role: Affichage et contenu du message de fin de toutes les questions
function endMessageAvecFiltre() {
    document.getElementById("message").innerHTML = "<h1 style=\"font-size:40px;color:#08f814\">GREEN TABS ARE FINISHED! </h1><h2><br/>TEST ALL QUESTIONS<br/> or move to other tabs before !</h2>";
    if (!document.getElementsByClassName('statusOrange').length===0){
        let filterName = document.getElementsByClassName('statusOrange')[0].id; 

    }
    document.getElementById("message").setAttribute('style','display:block');
    document.getElementById("container").setAttribute('style','display:none'); 
}

//1 Parametre : n° de la question
//Role: Affichage et contenu du message de fin d'un groupe de question
function endMessageSansFiltre(questionNumber) {
    document.getElementById("message").setAttribute('style', 'display:block');
    let countSansFiltre = 0;
    let section = "";  
    for (let i = 0; i < currentNbQuestionByStep(); i++) {
        section = document.getElementById("s" + i);
        if (step===0) {
            if (section.classList.contains("pointed")) countSansFiltre += 1;
        } else {
            let nbStep="step" + step;
            if (section.classList.contains(nbStep) && section.classList.contains("pointed")) countSansFiltre += 1;
        }
    }
    if (countSansFiltre === currentNbQuestionByStep()) {
        document.getElementById("message").setAttribute("style", "display:block");
        document.getElementById("message").innerHTML = "<h2 style=\"font-size:30px\">You have finished all the questions you can check or test now !</h2>"; 
        document.getElementById("container").setAttribute('style','display:none');     
    } else {
        document.getElementById("message").innerHTML = "";
        document.getElementById("message").setAttribute("style", "display:none");
        document.getElementById("container").setAttribute('style','display:block'); 
    }
}



///////////////////   SHOW - HIDE -  SWITCH - MOVE  functions ///////////////////////////////////////////////////////////////


//Role:  Masquer toutes les questions
function hideAllQuestion() {
    for (i = 0; i < nbQuestion; i++) {
        document.getElementById("s" + i).classList.add("visOffFilterQuestion");
    }
}

//1 Parametre : n° de la question
//Role: Gere la position ON/OFF et couleur du curseur de traduction
function moveSlider(questionNumber) {
    document.getElementById("curs" + questionNumber).classList.toggle("sliderChecked");
    document.getElementById("slider" + questionNumber).classList.toggle("sliderPosiChecked");
    document.getElementById("exempl" + questionNumber).setAttribute("style","display:none");
}

//1 Parametre : n° de la question
//Role :  Affichage de l'exemple de traduction 
function hideTranslationExample(questionNumber) {
    document.getElementById("textExempl" + questionNumber).onclick = function() {
        //console.log(currentFileAsObject[x].exemple);
        document.getElementById("exempl" + questionNumber).innerHTML = currentFileAsObject[questionNumber].exemple;
        if (currentFileAsObject[questionNumber].exemple) {
            document.getElementById("exempl" + questionNumber).setAttribute("style","display:none");
            //console.log("//////////////STOP SPEAKING !")
            window.speechSynthesis.cancel();
            if (document.getElementById("speechTrad" + questionNumber)) document.getElementById("speechTrad" + questionNumber).classList.remove("speaking");
        }
    };
}

//1 Parametre : n° de la question 
//Role        : Rend visible l"exemple et la bouton Text to speech
function showTranslationExample(questionNumber) {
    //console.log(currentFileAsObject[x].exemple);
    document.getElementById("exempl" + questionNumber).innerHTML ="<a id=\"textExempl" +questionNumber+ "\">" +(currentFileAsObject[questionNumber].exemple)+ "</a>" + "<i id=\"speechTrad" +questionNumber+ "\" class=\"fas fa-volume-up speechTrad\"></i>";
    if (currentFileAsObject[questionNumber].exemple) {
        document.getElementById("exempl" + questionNumber).setAttribute("style","display:block");
        document.getElementById("speechTrad" + questionNumber).onclick = function() {            
            let elt = this;
            let textToSpeechId = this.getAttribute("id");
            let textToSpeechNumber = textToSpeechId.split("d")[1];            
            if (!this.classList.contains("speaking")) {
                this.classList.add("speaking");
                textToSpeech(textToSpeechNumber, "trad");
            }else{
                this.classList.remove("speaking");
                window.speechSynthesis.cancel();
            } 
        }
        hideTranslationExample(questionNumber);
    }
}
 


//2 Parametres : n° de la question
//Role :  Gere l'affichage/masquage de la traduction
//            lance : ColorPts(questionNumber,"showTranslationPointed");
function switchTranslation(questionNumber) {
    if (document.getElementById("commut" + questionNumber).classList.contains("showTranslation")) {
        document.getElementById("commut" + questionNumber).classList.remove("showTranslation");
        document.getElementById("translation" + questionNumber).setAttribute("style", "display:none");
    } else {
        ColorPts(questionNumber,"showTranslationPointed");
        document.getElementById("commut" + questionNumber).classList.add("showTranslation");
        document.getElementById("translation" + questionNumber).setAttribute("style", "display:block");
        let timer = 300;
        setTimeout(showTranslationExample, timer, questionNumber);
    }
    moveSlider(questionNumber);
}

//2 Parametres : n° de la question
//Role :  Gere l'affichage/masquage des indications
//            lance : ColorPts(questionNumber,"showIndicationsPointed");
function switchHelpIndications(questionNumber) {
    if (document.getElementById("helpOpened" + questionNumber).classList.contains("showIndications")){
            document.getElementById("helpOpened" + questionNumber).classList.remove("showIndications");
            document.getElementById("help" + questionNumber).setAttribute("style", "display:block");
            document.getElementById("helpOpened" + questionNumber).setAttribute("style", "display:none");
    } else {
        ColorPts(questionNumber,"showIndicationsPointed");
        document.getElementById("helpOpened" + questionNumber).classList.add("showIndications");
        document.getElementById("help" + questionNumber).setAttribute("style", "display:none");
        document.getElementById("helpOpened" + questionNumber).setAttribute("style", "display:block");
        document.getElementById("helpOpened" + questionNumber).onclick =function(){
            document.getElementById("helpOpened" + questionNumber).classList.remove("showIndications");
            document.getElementById("help" + questionNumber).setAttribute("style", "display:block");
            document.getElementById("helpOpened" + questionNumber).setAttribute("style", "display:none");
        }
        document.getElementById("left" + questionNumber).classList.add("clearfix");
    }
}

//2 Parametres : n° de la question
//Role :  Gere l'affichage/masquage des 3 possibilités
//            lance : ColorPts(questionNumber,"possiblesPointed");
function switchHelpPossibilities(questionNumber) {
    let testHelpFR = currentFileAsObject[questionNumber].help["possibleFR"];  
    console.log(testHelpFR);
    if (testHelpFR===""){
    }else{
        let langContent = document.getElementById("lang" + questionNumber).innerHTML;   
        if (document.getElementById("lang" + questionNumber).classList.contains("showPossibilities")){
                document.getElementById("lang" + questionNumber).classList.remove("showPossibilities");
                document.getElementById("lang" + questionNumber).setAttribute('style', 'color:white');
                if (document.getElementById("lang" + questionNumber).classList.contains('langEN')) document.getElementById("lang" + questionNumber).innerHTML = "EN";
                if (document.getElementById("lang" + questionNumber).classList.contains('langFR')) document.getElementById("lang" + questionNumber).innerHTML = "FR";
        } else {
        ColorPts(questionNumber,"possiblesPointed");    
        let thePossibilities="";   
            if (langContent === "EN") {
                    thePossibilities = currentFileAsObject[questionNumber].help["possibleEN"];
                    document.getElementById("lang" + questionNumber).style.color = "#f510c7";   
            } else if (langContent === "FR") {
                    thePossibilities = currentFileAsObject[questionNumber].help["possibleFR"];
                    document.getElementById("lang" + questionNumber).style.color = "blue";
            }
        document.getElementById("lang" + questionNumber).classList.add("showPossibilities");
        document.getElementById("lang" + questionNumber).innerHTML = "<i style=\"font-size:18px\" class=\"fas fa-question-circle\"></i>&nbsp;&nbsp;" + thePossibilities;
        document.getElementById("left" + questionNumber).classList.add("clearfix");
        }
    }
}

//1 Parametre : n° de la question  -  id la penalité
//role        : Gère couleur et incrémentation des points de pénalité
function ColorPts(questionNumber,marker){
    if (!document.getElementById("s" + questionNumber).classList.contains(marker)){
        document.getElementById("s" + questionNumber).classList.add(marker); 
        switch (marker) {
            case "showTranslationPointed":
                nbTranslation++;
                document.getElementById("curs" + questionNumber).classList.add("tradUsedColor");
                break;
            case "showIndicationsPointed":  
                helpedPoints ++;
                break;
            case "possiblesPointed": 
                helpedPoints += 10;
                break;
            default:
        }
    }
}


// 1 Parametre: N° de la question
//Role: glissement de la question
function moveSection(questionNumber) {
    let elem = document.getElementById("s" + questionNumber);
    let pos = 0;
    let id = setInterval(frame, 0.01);
    function frame() {
        if (pos == 300) {
            clearInterval(id);
            elem.style.display = "none";
        } else {
            pos = pos + 5;
            elem.style.left = pos + 'px';
        }
    }
}

////////////// RESULTATS ///////////////////////////////////////////////////////////////////////////////////////////////////////////////


///role:  Mise à jours des pénalités
//       + lance les switch sur les questions actives
//       + lance le Shuffle si pas de filtre
//               : majPenaltyDom()
//               : changeOrder()
//               : 3 switch = Indications- Translations - Possibilities      
function refresh() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    activeQuestions = document.getElementById("container").children;
    let currentIterationId = "";
    majPenaltyDom(nbPoints);
    for (let i = 0; i < activeQuestions.length; i++) {
        document.getElementById("check" + i).setAttribute("style","display:none");
        currentIterationId = activeQuestions[i].id.slice(1);
        if(document.getElementById("helpOpened" + currentIterationId).classList.contains("showIndications")) switchHelpIndications(currentIterationId);
        if(document.getElementById("commut" + currentIterationId).classList.contains("showTranslation")) switchTranslation(currentIterationId);
        if(document.getElementById("lang" + currentIterationId).classList.contains("showPossibilities")) switchHelpPossibilities(currentIterationId);
    }
    if (!document.getElementById("containerFilters")) {
        changeOrder(nbQuestion);
    }
}


// Role : Change l'ordre des questions dans le DOM
function changeOrder() {
    let container = document.getElementById("container");
    // créer une copie de la liste et de son contenu
    let questionList = [...container.children];
    let nbQuestionToSuffle = nbQuestion;
    while (nbQuestionToSuffle > 0) {
        //get a random number
        let numberRNG = getRandInteger(0, nbQuestionToSuffle);
        //move it at the bottom
        container.appendChild(questionList[numberRNG]);
        nbQuestionToSuffle--;
    }
}

//Role : Indique le nombre de question en cours by step
function currentNbQuestionByStep(){
    let nbCurrentQuestions;
    if (step===0) {
        nbCurrentQuestions = nbQuestion;
    }else{
        let idStep="step" +step;
        nbCurrentQuestions = document.getElementById("container").querySelectorAll("section."+ idStep).length;
    } 
    return nbCurrentQuestions;
}

// 1 Parametre= Objet Json
// Role: Calcule le résultat Global
//       + Lance les mises à jour de tous les compteurs
//               : refresh() => majPenaltyDom()
//                              changeOrder()
//                              3 switch = Indications- Translations - Possibilities 
//               : getPointReponse() => evalGoodResponse()
//               : majCounterDom(pourcentScore)   
//               : happyEnd(pourcentScore)
//               : clickCheckNow(i, isCurrentQuestion)                       
function getTest(currentFileAsObject) {
    getPointReponse();
    refresh();
    document.getElementById("penalty").setAttribute("style","display:block");
    nbTentative++;
    let maxQuestionPoints =nbQuestion * 2;
    let totalPenalty = ((helpedPoints / 10) + (nbTentative / 10) + nbTranslation).toFixed(2);
    nbPoints = (maxQuestionPoints - totalPenalty).toFixed(2);
    let pourcentScore = Math.floor((nbPoints / maxQuestionPoints) * 100);
    majPenaltyDom();
    majCounterDom(pourcentScore);
    for (let i = 0; i < nbQuestion; i++) {
        let move = clickCheckNow(i,false);
        let timer = 500 + i;
        setTimeout(move, timer, i);
    }
    let timer = 500;
    setTimeout(happyEnd, timer, pourcentScore);
}

// 1 Parametre= valeur numérique (calculée dans la function TESTER)
// Role: bloque la valeur récupérée à 0 minimum
function majCounterDom(pourcentScore) {
    if (pourcentScore < 0) pourcentScore = 0;
    document.getElementById("points").innerHTML = scoreByQuestion + " / " + nbQuestion + " - " + pourcentScore + "%";
}

// Role: Update des variables Globales dans le DOM (affichage compteur HTML)
function majPenaltyDom() {
    let maxQuestionPoints = nbQuestion * 2;
    if (nbTranslation === 0) {
        document.getElementById("score").innerHTML = "<H6>" + nbPoints + " / " + maxQuestionPoints + "</h6><h7>" + helpedPoints + "</h7><h8>" + nbTentative + "</h8><h9>" + nbTranslation + "</h9>";
    } else {
        document.getElementById("score").innerHTML = "<H6>" + nbPoints + " / " + maxQuestionPoints + "</h6><h7>" + helpedPoints + "</h7><h8>" + nbTentative + "</h8><h10>" + nbTranslation + "</h10>";
    }
}

//Role: pour toutes les questions ajout des points et cumule du nombre de questions réussies
//          lance : evalGoodResponse()
function getPointReponse() {
    scoreByQuestion = 0;
    scoreByPoints = 0;
    evalGoodResponse();
    for (let i = 0; i < nbQuestion; i++) {
        if (document.getElementById("s" + i).classList.contains("evalGood") === true) {
            scoreByQuestion += 1;
            scoreByPoints += 2;
        }
    }
}

//Role: pour toutes les questions Ajout d'une classe sur les bonnes reponses (après netoyage des caractères spéciaux)
//      lance : suppr_acc_car_spec(a) 
function evalGoodResponse() {
    for (let i = 0; i < nbQuestion; i++) {
        let goodResponseTemp = ((document.getElementById("translation" + i).innerHTML).trim()).toLowerCase();
        let goodResponse = suppr_acc_car_spec (goodResponseTemp);
        let saisieTemp = (document.getElementById("rep" + i).value.trim()).toLowerCase();
        let saisie = suppr_acc_car_spec (saisieTemp);
        //console.log (goodResponse  +"///"+ saisie);
        if (saisie === goodResponse) {
            document.getElementById("s" + i).classList.add("evalGood");
        }
    }

}
// converti les caractère spéciaux 
function suppr_acc_car_spec(a) {
if(typeof a === 'string'){
var str = a ; 
var tab_accent_brut = "ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ";
var tab_sansAccent_brut = "aaaaaaaaaaaaooooooooooooeeeeeeeecciiiiiiiiuuuuuuuuynn";
var tab_accent = tab_accent_brut.split('');
var tab_sansAccent = tab_sansAccent_brut.split('');
tabCorrAcc = new Array();
var i = -1;
while (tab_accent[++i]) {
tabCorrAcc[tab_accent[i]] = tab_sansAccent[i]
}
tabCorrAcc['Œ'] = 'OE';
tabCorrAcc['œ'] = 'oe';
str = str.replace(/./g, function($0) {
return (tabCorrAcc[$0]) ? tabCorrAcc[$0] : $0
})
/*
str = str.replace(/&amp;/g, '_');
str = str.replace(/_amp;/g, '');
str = str.replace(/&lt;/g, '_');
str = str.replace(/_lt;/g, '_');
str = str.replace(/&gt;/g, '_');
str = str.replace(/_gt;/g, '_');
str = str.replace(/(-| |#|"|@|:|\.|,|;|'|%|!|²|=|÷|\+|\?|\/|\[|\]|\{|\}|\*|\^|\$|\\|`|"|'|¨|€|£|¤|µ|§|~|ƒ|„|©|°)/g, '_');
*/
return str;
}}


//Role: Update des contenus et des scores pour chaque question dans la page de RECAP
//          lance  : currentNbQuestionByStep()
//                 : scoreForEachQuestion(i) 
function updateRecapPage() {
    for (let i = 0; i < nbQuestion; i++) {
        document.getElementById("scoreEachQuestion" + i).classList.remove("great");
        document.getElementById("scoreEachQuestion" + i).classList.remove("medium");
        document.getElementById("scoreEachQuestion" + i).classList.remove("bad");
        let scoreByQuestionFinal = (Math.floor((2 - scoreForEachQuestion(i)) * 100) / 100).toFixed(1);
        if (scoreByQuestionFinal >= 2) {
            document.getElementById("scoreEachQuestion" + i).classList.add("great");
        }
        if (scoreByQuestionFinal <= 1.9 && scoreByQuestionFinal >= 1.5) {
            document.getElementById("scoreEachQuestion" + i).classList.add("medium");
        }
        if (scoreByQuestionFinal < 1.5) {
            document.getElementById("scoreEachQuestion" + i).classList.add("bad");
        }
        let example = currentFileAsObject[i].exemple;
        if (typeof example != "undefined") {
            example = "<h11>\"" + currentFileAsObject[i].exemple + "\"</h11>";
        } else {
            example = "<h5>No available example</h5>";
        }
        document.getElementById("questionFinal" + i).innerHTML = ((document.getElementById("question" + i).innerHTML).split(";")[2])+(document.getElementById("lang" + i).innerHTML);
        document.getElementById("responseFinal" + i).innerHTML = document.getElementById("translation" + i).innerHTML;
        document.getElementById("translatFinal" + i).innerHTML = document.getElementById("helpOpened" + i).innerHTML;
        document.getElementById("pointsFinal" + i).innerHTML = scoreByQuestionFinal;
        document.getElementById("exampleFinal" + i).innerHTML = example;
    }
    let nbGreat=document.getElementById("finalText").querySelectorAll("div.great").length;
    if ((step>0)&&(scoreByQuestion===nbQuestion)&&(nbGreat===nbQuestion)){
       //console.log("///////////////// FIN nbGreat=" + nbGreat);
       document.getElementById("congrat").setAttribute('style','display:none');  
       document.getElementById("finalText").setAttribute('style','display:none'); 
       document.getElementById("message").setAttribute('style','display:block');
       document.getElementById("message").innerHTML = "<h1><i style=\"font-size:80px\" class=\"fas fa-candy-cane\"></i>Good Job!</h1><br/><h2 style=\"font-size:30px\"> You eventually have finished <br />all the questions</h2";
    }
}

//1 Parametre = valeur numérique correspondant au n° de la question
//Role: Cumule les points de pénalités obtenus sur chaque question
function scoreForEachQuestion(i) {
    let score = 0;
    let section=document.getElementById("s" + i).classList;
        if (section.contains("showIndicationsPointed")) score += 0.1;
        if (section.contains("showTranslationPointed")) score += 1;
        if (section.contains("possiblesPointed")) score += 0.5;
    return score > 2 ? 2 : score;
}


// 1 parametre: string = id de la classe
// Role : Relance un test avec les questions portant la classe
//            lance : bodyChange(type)
//                  : updateRecapPage() => currentNbQuestionByStep()
//                                      => scoreForEachQuestion(i)     
//                  : getQuestionsListToKeep(type)
//                  : resetScore(nbQuestionToDisplay)  => majCounterDom(pourcentScore)
//                  : createFinalText("finalText")
function launchRetry(type) {
    document.getElementById("container").setAttribute('style','display:block'); 
    refresh();
    document.getElementById("navChoixFilter").setAttribute("style","display:none");
    bodyChange(type);
    let questionsToDisplay;
    if (type==="badMedium"){
        questionsToDisplay=getQuestionsListToKeep("bad").concat(getQuestionsListToKeep("medium"));
        }else{
        questionsToDisplay = getQuestionsListToKeep(type);
    }
    let nbQuestionToDisplay= questionsToDisplay.length;
    resetScore(nbQuestionToDisplay);
    step++;
    for (let i = 0; i < nbQuestionToDisplay; i++) {
        let section = questionsToDisplay[i];
        let numSection=questionsToDisplay[i].slice(1);
        let lang= document.getElementById("lang" + numSection).innerHTML;
        document.getElementById(section).classList.add("step" + step);
        document.getElementById(section).setAttribute('style', 'display:inline-block');
        document.getElementById(section).setAttribute('style', 'left:0');
        document.getElementById(section).classList.remove("evalGood");
        document.getElementById(section).classList.remove("pointed");
        document.getElementById(section).classList.remove("visOffFilterQuestion");
        document.getElementById("curs" + numSection).classList.remove("tradUsedColor");
        document.getElementById("s" + numSection).classList.remove("showIndicationsPointed");
        document.getElementById("s" + numSection).classList.remove("showTranslationPointed");
        document.getElementById("s" + numSection).classList.remove("possiblesPointed");
        document.getElementById("helpOpened" + numSection).classList.remove("showIndications");
        document.getElementById("commut" + numSection).classList.remove("showTranslation");
        document.getElementById("lang" + numSection).classList.remove("showPossibilities");
        document.getElementById("rep" + numSection).value="";
        document.getElementById("rep" + numSection).classList.remove("repOk");
        document.getElementById("refresh").setAttribute('style','display:block');
        if (document.getElementById("lang" + numSection).innerHTML==="EN") document.getElementById("rep" + numSection).style.backgroundColor = "#fce1f6";//rose
        if (document.getElementById("lang" + numSection).innerHTML==="FR") document.getElementById("rep" + numSection).style.backgroundColor = "#cee5ff";//bleu
    }
    document.getElementById("tester").setAttribute('style','display:inline-block');
    document.getElementById("redo").setAttribute('style','display:none');
    document.getElementById("finalText").setAttribute('style','display:none');
    document.getElementById("congrat").setAttribute('style','display:none');
    document.getElementById("congrat").removeChild(document.getElementById("redo"));
    updateRecapPage();
}

// 1 parametre: string = id de la class
// Role : Change la couleur du Body en fonction de la classe
function bodyChange(type){
    document.body.classList.remove('bodyBad');
    document.body.classList.remove('bodyBadMedium');
    document.body.classList.remove('bodyMedium');
    if (type === "bad") document.body.classList.add('bodyBad');
    if (type === "badMedium") document.body.classList.add('bodyBadMedium');
    if (type === "medium") document.body.classList.add('bodyMedium');
}


//Role: remet les compteurs de pénalité à 0
//        lance :  majCounterDom(pourcentScore)
function resetScore(nbQuestionToDisplay) {
    helpedPoints = 0;
    nbTentative = 0;
    nbTranslation = 0;
    scoreByQuestion= nbQuestion - nbQuestionToDisplay;
    let maxQuestionPoints = nbQuestion * 2;
    let pourcentScore = Math.floor((nbPoints / maxQuestionPoints) * 100);
    majCounterDom(pourcentScore);
    majPenaltyDom();
}


// 1 parametre  :classe à rechercher 
//Role          :renvoie une liste d'elements contenus dans la div container et ayant la classe donnée en paramètre      
//Retour        :Liste d'elements
function getQuestionsListToKeep(classToSearch) {
    let theRecapList = document.getElementsByClassName(classToSearch);
    let questionsList = new Array();
    let containerChildren = document.getElementById("container").children;
    questionsListIndex = 0;
    for (var i = 0; i < theRecapList.length; i++) {
        let numSectionToKeep=theRecapList[i].id.split("scoreEachQuestion")[1];
        questionsList[questionsListIndex] = "s" + numSectionToKeep;
        questionsListIndex++;
    }
    return questionsList;
}

// 1 parametre: number score calculé 
// Role: Affichage du message de Fin et disparition des éléments DOM + lancement de la nav pour continuer si echec
//              lance     : updateRecapPage() => currentNbQuestionByStep()
//                                            => scoreForEachQuestion(i) 
function happyEnd(pourcentScore) {
    if (scoreByQuestion === nbQuestion) {
        document.getElementById("navChoixFilter").setAttribute('style','display:none');
        if (document.getElementById("containerFilters")) {
            document.getElementById("containerFilters").setAttribute("style","display:none");
        }
        document.getElementById("congrat").setAttribute('style','display:block');
        document.getElementById("tester").setAttribute('style','display:none');
        document.getElementById("refresh").setAttribute('style','display:none');
        document.getElementById("message").setAttribute('style','display:none');
        document.getElementById("finalText").setAttribute('style','display:block');
        updateRecapPage();
        if (pourcentScore === 100) {
            document.getElementById("congraText").innerHTML = "<i style=\"font-size:50px\" class=\"fas fa-award\"></i> Congratulations!";
        } else {
            document.getElementById("congraText").innerHTML = "<i style=\"font-size:50px\" class=\"fas fa-smile-wink\"></i> Not so bad . . .<br/>You can try again !";
            createRedoNav();
        }
    }
}

// Role : Création DOM de la navigation Redo + affectation des scores Item en fonction des class bad et medium.
function createRedoNav() {
    let newDivRedo = document.createElement("div");
    let newDivRedoBtn1 = document.createElement("div");
    let newDivRedoBtn2 = document.createElement("div");
    let newDivRedoBtn3 = document.createElement("div");
    newDivRedo.id = "redo";
    newDivRedo.classList.add("redo");
    newDivRedoBtn1.id = "btnBad";
    newDivRedoBtn1.classList.add("finalBtn");
    newDivRedoBtn1.classList.add("btnBad");
    newDivRedoBtn1.onclick = function() {
        launchRetry("bad");
    };
    newDivRedoBtn2.id = "btnBadMedium";
    newDivRedoBtn2.classList.add("finalBtn");
    newDivRedoBtn2.classList.add("btnBadMedium");
    newDivRedoBtn2.onclick = function() {
        launchRetry("badMedium");
    };
    newDivRedoBtn3.id = "btnMedium";
    newDivRedoBtn3.classList.add("finalBtn");
    newDivRedoBtn3.classList.add("btnMedium");
    newDivRedoBtn3.onclick = function() {
        launchRetry("medium");
    };
    document.getElementById("congrat").appendChild(newDivRedo);
    newDivRedo.appendChild(newDivRedoBtn1);
    newDivRedo.appendChild(newDivRedoBtn2);
    newDivRedo.appendChild(newDivRedoBtn3);
    document.getElementById("btnBad").innerHTML = document.getElementById("finalText").querySelectorAll("div.bad").length;
    document.getElementById("btnBadMedium").innerHTML = document.getElementById("finalText").querySelectorAll("div.bad").length + document.getElementById("finalText").querySelectorAll("div.medium").length;
    document.getElementById("btnMedium").innerHTML = document.getElementById("finalText").querySelectorAll("div.medium").length;
}

/*function testTyping(element, textArea){
    console.log(element);
    console.log(textArea);
    element.preventDefault();
    textArea.setAttribute("name",textArea.getAttribute("name")+element.key);
    console.log(textArea.getAttribute("name").length);
    textArea.innerHTML = textArea.getAttribute("name") + textArea.placeholder.slice(textArea.getAttribute("name").length);
}*/
/*
let baba = 1;
baba == 1 ? true : false;
*/