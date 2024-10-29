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
            console.log(error)
            reject(error)
        })
    })
}


function drawChart(numero) {
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
            let sigmaSuperior = (lsc - mid) / 3
            let sigmaInferior = (mid - lic) / 3

            let stringInfo = ""
            let index = 0
            let alarm2 = []
            apiData.data[0].valores.forEach(element => {
                data.addRows([
                    [element.x, element.y, mid, lsc, lic]
                ]);
                // situacion alarmante 1
                // poder cambiar el fondo a rojo ponele con un bolean
                if (element.y > lsc || element.y < lic) {
                    console.log(element.y + "-> lsc" + lsc + "lic" + lic)
                    stringInfo += "Situacion alarmante 1: Se paso de los limites de control"
                    infoCharts(stringInfo)
                }
                // situacion alarmante 2
                alarm2.push(element.y)
                console.log("lenght:" + alarm2.length + ". y" + element.y)
                if (alarm2.length === 3) {
                    let contControl = 0
                    
                    alarm2.forEach(y => {
                        if (y > (lsc - sigmaSuperior) || y < (lic + sigmaInferior)) contControl++
                    })
                    if (contControl => 2) {
                        stringInfo += "Situacion alarmante 2: "
                        infoCharts(stringInfo)
                    }
                    alarm2.slice(index, 1)
                    index++
                    console.log(alarm2[0])
                }
                // situacion alarmante 3


                // situacion alarmante 4

            })
            let options = {
                title: 'Company Performance',
                curveType: 'function',
                legend: { position: 'bottom' }
            };
            let chart = new google.visualization.LineChart(document.getElementById('curve_chart'));
            chart.draw(data, options);
        })
    }).catch(error => { throw new Error(error) })
}

function infoCharts(string) {
    let div = document.getElementById('info')
    div.innerHTML = string
}

