const datosFlotaDefecto = {
  NavesBatalla: 0,
  Bombarderos: 0,
  Cruceros: 0,
  EstrellasDeLaMuerte: 0,
  Destructores: 1,
  Sondas: 1,
  Exploradores: 1,
  CazadoresPesados: 0,
  CazadoresLigeros: 0,
  Acorazados: 0,
  Segadores: 0,
  NavesCargaPesada: Infinity,
  NavesCargaLigera: Infinity
};

async function onValidar() {
    var message = document.querySelector('#message');
    let activeTabId;

    chrome.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
        var activeTab = tabs[0];
        activeTabId = activeTab.id;


        return chrome.scripting.executeScript({
            target: { tabId: activeTabId },
            func: DOMtoString,
        });

    }).then(function (results) {
        const regexFlota = /var\s+apiShipBaseData\s*=\s*(\[\[.*?\]\]);/s;
        const regexExpedicionesMax = /var\s+maxExpeditionCount\s*=\s*(\d+)/
        const regexExpedicionesActuales = /var\s+expeditionCount\s*=\s*(\d+)/
        const htmlString = results[0].result;
        
        const matchFlota = htmlString.match(regexFlota);
        const matchExpedicionesMax = htmlString.match(regexExpedicionesMax);
        const matchExpedicionesActuales = htmlString.match(regexExpedicionesActuales);
        var apiShipBaseData = null;
        var numeroDeExpedicionesMaximas = 0;
        var numeroDeExpedicionesActuales = 0;
        
        if (matchFlota) {
            const arrayString = matchFlota[1];
            apiShipBaseData = JSON.parse(arrayString);
            console.log(apiShipBaseData); 
            
        } else {
            console.log("No se encontró los datos de la flota en el HTML");
        }
        
        if(matchExpedicionesMax){
            numeroDeExpedicionesMaximas = parseInt(matchExpedicionesMax[1], 10);
            
        }
        else {
            console.log("No se encontró los datos de las expediciones maximas en el HTML");
        }
        
        if(matchExpedicionesActuales){
            numeroDeExpedicionesActuales = parseInt(matchExpedicionesActuales[1], 10);
        }
        else {
            console.log("No se encontró los datos de las expediciones actuales en el HTML");
        }
        
        flota = Object.fromEntries(apiShipBaseData);
        
        return {
            flota,
            numeroDeExpedicionesMaximas,
            numeroDeExpedicionesActuales
        };
        
    }).then(async function (datos){
        await leerInputsFlota();
        const result = await chrome.storage.local.get("datosFlota");
        const datosFlotaMax = result.datosFlota || {};

        var dividirFlota = datos.numeroDeExpedicionesMaximas-datos.numeroDeExpedicionesActuales
        
        if(dividirFlota != 0){

            var nCazadoresLigeros    = Math.min(Math.ceil(datos.flota[204]/dividirFlota), datosFlotaMax["CazadoresLigeros"] || datosFlotaDefecto["CazadoresLigeros"]);
            var nCazadoresPesados    = Math.min(Math.ceil(datos.flota[205]/dividirFlota), datosFlotaMax["CazadoresPesados"] || datosFlotaDefecto["CazadoresPesados"]);
            var nCruceros            = Math.min(Math.ceil(datos.flota[206]/dividirFlota), datosFlotaMax["Cruceros"] || datosFlotaDefecto["Cruceros"]);
            var nNavesBatalla        = Math.min(Math.ceil(datos.flota[207]/dividirFlota), datosFlotaMax["NavesBatalla"] || datosFlotaDefecto["NavesBatalla"]);
            var nAcorazados          = Math.min(Math.ceil(datos.flota[215]/dividirFlota), datosFlotaMax["Acorazados"] || datosFlotaDefecto["Acorazados"]);
            var nBombarderos         = Math.min(Math.ceil(datos.flota[211]/dividirFlota), datosFlotaMax["Bombarderos"] || datosFlotaDefecto["Bombarderos"]);
            var nDestructores        = Math.min(Math.ceil(datos.flota[213]/dividirFlota), datosFlotaMax["Destructores"] || datosFlotaDefecto["Destructores"]);
            var nEstrellasDeLaMuerte = Math.min(Math.ceil(datos.flota[214]/dividirFlota), datosFlotaMax["EstrellasDeLaMuerte"] || datosFlotaDefecto["EstrellasDeLaMuerte"]);
            var nSegadores           = Math.min(Math.ceil(datos.flota[218]/dividirFlota), datosFlotaMax["Segadores"] || datosFlotaDefecto["Segadores"]);
            var nExploradores        = Math.min(Math.ceil(datos.flota[219]/dividirFlota), datosFlotaMax["Exploradores"] || datosFlotaDefecto["Exploradores"]);
            var nNavesCargaLigera    = Math.min(Math.ceil(datos.flota[202]/dividirFlota), datosFlotaMax["NavesCargaLigera"] || datosFlotaDefecto["NavesCargaLigera"]);
            var nNavesCargaPesada    = Math.min(Math.ceil(datos.flota[203]/dividirFlota), datosFlotaMax["NavesCargaPesada"] || datosFlotaDefecto["NavesCargaPesada"]);
            var nSondas              = Math.min(Math.ceil(datos.flota[210]/dividirFlota), datosFlotaMax["Sondas"] || datosFlotaDefecto["Sondas"]);

            
            chrome.scripting.executeScript({
              target: { tabId: activeTabId },
              func: (valores) => {
                // Función mejorada para rellenar inputs
                function fillInputSafely(name, value) {
                    const input = document.querySelector(`input[name="${name}"]`);
                    if (!input) return false;
                    
                    try {
                        input.focus();
                        
                        input.select();
                        
                        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                            window.HTMLInputElement.prototype, 'value'
                        ).set;
                        nativeInputValueSetter.call(input, value);
                        
                        input.value = value;
                        
                        input.dispatchEvent(new Event("focus", { bubbles: true }));
                        input.dispatchEvent(new Event("input", { bubbles: true }));
                        input.dispatchEvent(new Event("change", { bubbles: true }));
                        
                        input.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true }));
                        input.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
                        
                        input.blur();
                        
                        setTimeout(() => {
                            if (input.value !== value.toString()) {
                                console.warn('Valor no se mantuvo para ${name}: esperado ${value}, actual ${input.value}');
                                input.value = value;
                                input.dispatchEvent(new Event("change", { bubbles: true }));
                            }
                        }, 100);
                        
                        return true;
                    } catch (error) {
                        console.error('Error rellenando input ${name}');
                        return false;
                    }
                }

                const entries = Object.entries(valores);
                let index = 0;
                
                function fillNext() {
                    if (index >= entries.length) {
                        console.log('Todos los inputs rellenados');
                        // Disparar evento global de cambio en el formulario si existe
                        const form = document.querySelector('form');
                        if (form) {
                            form.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        return;
                    }
                    
                    const [name, value] = entries[index];
                    console.log(`Rellenando ${name} con valor ${value}`);
                    
                    fillInputSafely(name, value);
                    index++;
                    
                    // Delay entre inputs para evitar problemas de concurrencia
                    setTimeout(fillNext, 150);
                }
                
                fillNext();
              },
              args: [{
                fighterLight: nCazadoresLigeros,
                fighterHeavy: nCazadoresPesados,
                cruiser: nCruceros,
                battleship: nNavesBatalla,
                interceptor: nAcorazados,
                bomber: nBombarderos,
                destroyer: nDestructores,
                deathstar: nEstrellasDeLaMuerte,
                reaper: nSegadores,
                explorer: nExploradores,
                transporterSmall: nNavesCargaLigera,
                transporterLarge: nNavesCargaPesada,
                espionageProbe: nSondas
              }]
            });
        }
        message.innerText = "Flota ready !"
    })
    .catch(function (error) {
        console.log('There was an error injecting script : \n' + error.message);
    });
}



document.addEventListener("DOMContentLoaded",async () => {
  const result = await chrome.storage.local.get("datosFlota");
  const datosFlotaMax = result.datosFlota || {};

  saveInMaxInput(datosFlotaMax);
  document.getElementById("validar").addEventListener("click", () => {
    onValidar();
  });
});

function DOMtoString(selector) {
    if (selector) {
        selector = document.querySelector(selector);
        if (!selector) return "ERROR: querySelector failed to find node"
    } else {
        selector = document.documentElement;
    }
    return selector.outerHTML;
}


function setInputValueAlternative(inputName, value) {
    chrome.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
        const activeTabId = tabs[0].id;
        
        chrome.scripting.executeScript({
            target: { tabId: activeTabId },
            func: (name, val) => {
                const input = document.querySelector(`input[name="${name}"]`);
                if (input) {
                    input.focus();
                    
                    input.value = '';
                    const chars = val.toString().split('');
                    chars.forEach((char, index) => {
                        setTimeout(() => {
                            input.value += char;
                            input.dispatchEvent(new Event("input", { bubbles: true }));
                        }, index * 10);
                    });
                    
                    setTimeout(() => {
                        input.dispatchEvent(new Event("change", { bubbles: true }));
                        input.blur();
                    }, chars.length * 10 + 100);
                }
            },
            args: [inputName, value]
        });
    });
}

async function leerInputsFlota() {

  const bloquesNaves = document.querySelectorAll(".nave");

  //Recuperar datos
  const result = await chrome.storage.local.get("datosFlota");
  const datosFlota = result.datosFlota || {};

  bloquesNaves.forEach(bloque => {

    const input = bloque.querySelector('input[type="text"]');
    const nombreNave = input.id.replace("input", "");

    if (input.value.trim() !== "") {
          datosFlota[nombreNave] = parseInt(input.value,10);
    }
  });

  await chrome.storage.local.set({ datosFlota });

  return datosFlota;
}


function saveInMaxInput(datosFlotaMax){
    const bloquesNaves = document.querySelectorAll(".nave");

  bloquesNaves.forEach(bloque => {
    const input = bloque.querySelector('input[type="text"]');
    const nombreNave = input.id.replace("input", "");

    if (datosFlotaMax[nombreNave] !== undefined) {
      input.value = datosFlotaMax[nombreNave];
    }
    else{
        if(datosFlotaDefecto[nombreNave] !== undefined){
            input.value = datosFlotaDefecto[nombreNave];
        }
        else{
            console.log("No se encontró input para el valor: "+nombreNave);
        }
    }
  });
}




