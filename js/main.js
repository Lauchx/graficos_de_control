const url = "https://apidemo.geoeducacion.com.ar/api/testing/control/"

function getApi(numero) {

    return new Promise((resolve, reject) => {
        fetch(url + numero).then(api => {
            if (!api.ok) {
                throw new Error("Error en el servidor")

            }
            return api.json()
        }).then(api => {
            resolve(api)
        }).catch(error => {
            reject(error)
        })
    })
}


function drawChart(numero) {
    document.getElementById('info').innerHTML = ""
    getApi(numero).then(apiData => {
        // metodo para recorer los valores de la api
        google.charts.load("current", { packages: ["corechart"] });
        google.charts.setOnLoadCallback(function () {
            let data = new google.visualization.DataTable();
            data.addColumn('number', 'Tiempo');
            data.addColumn('number', 'Valor');
            data.addColumn('number', 'Media');
            data.addColumn('number', 'LSC');
            data.addColumn('number', 'LIC');

            // sacar mid lsc lic
            let mid = apiData.data[0].media
            let lsc = apiData.data[0].lsc

            let lic = apiData.data[0].lic
            // sacar sigmas

            let stringInfo = ""
            let alarm2 = []
            let alarm3 = []
            let alarm4 = []
            let ifInfoExist1 = false
            let ifInfoExist2 = false
            let ifInfoExist3 = false
            let ifInfoExist4 = false
            apiData.data[0].valores.forEach(element => {
                data.addRows([
                    [element.x, element.y, mid, lsc, lic]
                ]);
                // situacion alarmante 1
                // poder cambiar el fondo a rojo ponele con un bolean
                if (!ifInfoExist1) {
                    if (element.y > lsc || element.y < lic) {
                        ifInfoExist1 = true
                        stringInfo += "<br>Situacion alarmante 1: Se paso de los limites de control"
                    }
                }
                // situacion alarmante 2     
                if (!ifInfoExist2) {
                    alarm2.push(element.y)
                    let string = serchControl(alarm2, 3, lsc, lic, mid, ifInfoExist2)
                    if (string === "<br>Situacion alarmante 2: Dos de tres puntos consecutivos fuera del segundo sigma.") {
                        ifInfoExist2 = true
                        stringInfo += string
                    }
                }
                // situacion alarmante 3
                if (!ifInfoExist3) {
                    alarm3.push(element.y)
                    let string = serchControl(alarm3, 5, lsc, lic, mid, ifInfoExist3)
                    if (string === "<br>Situacion alarmante 3: Cuatro de cinco puntos consecutivos fuera del mismo lado del segundo sigma.") {
                        ifInfoExist3 = true
                        stringInfo += string
                    }
                }
                // situacion alarmante 4
                if (!ifInfoExist4) {
                    alarm4.push(element.y)
                    let string = serchControl(alarm4, 8, lsc, lic, mid, ifInfoExist4)
                    if (string === "<br>Situacion alarmante 4: Ocho puntos concecutivos fuera del mismo lado de la media.") {
                        ifInfoExist4 = true
                        stringInfo += string
                    }
                }
            })

            let options = {
                title: 'Company Performance',
                curveType: 'function',
                legend: { position: 'bottom' }
            };
            let chart = new google.visualization.LineChart(document.getElementById('curve_chart'));
            chart.draw(data, options);
            infoCharts(stringInfo)
        })
    }).catch(error => { throw new Error(error) })
}

function infoCharts(string) {
    let div = document.getElementById('info')
    div.innerHTML = string
}
function serchControl(alarm, length, lsc, lic, mid, ifInfoExist) {
    if (!ifInfoExist) {
        let indfoS = ""
        let sigmaSuperior = (lsc - mid) / 3
        let sigmaInferior = (mid - lic) / 3
        if (alarm.length === length) {
            let contControl = 0
            let contControlLic = 0
            alarm.forEach(y => {
                if (length === 3) if (y > (lsc - sigmaSuperior) || y < (lic + sigmaInferior)) contControl++
                if (length === 5) {
                    if (y > lsc - (sigmaSuperior * 2)) contControl++
                    if (y < lic + (sigmaInferior * 2)) contControlLic++
                }
                if (length === 8) {
                    if (y > mid) contControl++
                    if (y < mid) contControlLic++
                }
            })
            if (alarm.length === 3) {
                alarm.splice(0, 1)
                if (contControl >= 2) {
                    ifInfoExist = true
                    indfoS += "<br>Situacion alarmante 2: Dos de tres puntos consecutivos fuera del segundo sigma."
                }
            }
            if (alarm.length === 5) {
                alarm.splice(0, 1)
                if (contControl >= 4 || contControlLic >= 4) {
                    ifInfoExist = true
                    indfoS += "<br>Situacion alarmante 3: Cuatro de cinco puntos consecutivos fuera del mismo lado del segundo sigma."
                }
            }
            if (alarm.length === 8) {
                alarm.splice(0, 1)
                if (contControl >= 8 || contControlLic >= 8) {
                    ifInfoExist = true
                    indfoS += "<br>Situacion alarmante 4: Ocho puntos concecutivos fuera del mismo lado de la media."
                }

            }
            if (indfoS == undefined) return "--------"
            return indfoS
        }
        return ""
    } return ""

}

