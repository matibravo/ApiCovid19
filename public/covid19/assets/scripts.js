console.log('hola');

let bodyModal = document.querySelector('.modal-body');
let tituloModal = document.querySelector('.modal-title');

(() => {

    const url = "http://localhost:3000/api/total";

    const getData = async () => {

        try {
            const res = await fetch(url);
            const resJson = await res.json();
            console.log(resJson);
            const { data } = await resJson;
            console.log(data);
            casosConfirmados(data);
            tabla(data);

        } catch (error) {
            console.error(error);
        }

    }
    getData();

})();

const casosConfirmados = (datos) => {

    let casosMayores = datos.filter(caso => {
        return caso.confirmed > 1000000;
    })
    console.log(casosMayores);

    let estadisticasConfirmados = [];
    let estadisticasMuertos = [];


    casosMayores.forEach(element => {

        estadisticasConfirmados.push({
            label: element.location,
            y: element.confirmed,
        });

    });

    casosMayores.forEach(element => {

        estadisticasMuertos.push({
            label: element.location,
            y: element.deaths,
        });
    })

    var chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        exportEnabled: true,
        theme: "light2", // "light1", "light2", "dark1", "dark2"
        title: {
            text: "Estadísticas Covid 19"
        },
        axisY: {
            title: "Casos Confirmados",
            titleFontSize: 14,
            interval: 3000000,
            labelFontSize: 11

        },
        axisX: {
            title: "Países",
            labelAngle: 130,
            labelFontSize: 11,
            interval: 1

        },
        data: [{
            type: "column",
            dataPoints: estadisticasConfirmados,
        },
        {
            type: "column",
            dataPoints: estadisticasMuertos,
        }]
    });
    chart.render();
}


const getDataPais = async (pais) => {
    

    try {
        const respuesta = await fetch(`http://localhost:3000/api/countries/${pais}`);
        const respuestaJson = await respuesta.json();

        const { data } = await respuestaJson;
        console.log(data);

        if (data.location == undefined) throw "La información solicitada en estos momentos no se encuentra disponible.";


        bodyModal.innerHTML = `<div id="chartContainerPais" style="height: 300px; width: 100%;"></div>`;

        var chart = new CanvasJS.Chart("chartContainerPais", {
            animationEnabled: true,
            exportEnabled: true,
            theme: "light2", // "light1", "light2", "dark1", "dark2"
            title: {
                text: `Estadísticas de ${data.location}`
            },
            axisY: {
                title: "Cantidad"
            },
            axisX: {
                title: `${data.location}`,
            },
            data: [{
                type: "pie",
                startAngle: 25,
                toolTipContent: "<b>{label}</b>: {y}",
                showInLegend: "true",
                legendText: "{label}",
                indexLabelFontSize: 16,
                indexLabel: "{label} - {y}",
                dataPoints: [
                    { y: `${data.active}`, label: "Activos" },
                    { y: `${data.deaths}`, label: "Muertes" },
                    { y: `${data.recovered}`, label: "Recuperados" },
                    { y: `${data.confirmed}`, label: "Confirmados" }
                ]
            }]
        });
        chart.render();

    } catch (error) {
        console.error(error);
        bodyModal.style.textAlign = 'center';
        //bodyModal.style.backgroundColor = '#7fffd4';
        bodyModal.innerHTML = `<img src="http://localhost:3000/covid19/assets/img/imagen.png">
        <p><mark><strong>${error}</strong></mark></p>`;
    }

}

const tabla = (datos) => {

    let tablita = document.getElementById('tablita');

    tablita.innerHTML = `
        <thead>
            <tr>
                <th scope="col">Localización</th>
                <th scope="col">Casos Activos</th>
                <th scope="col">Casos Confirmados</th>
                <th scope="col">Muertes</th>
                <th scope="col">Recuperados</th>
                <th scope="col">Detalle</th>
            </tr>
        </thead>`;

    datos.forEach(element => {

        tablita.innerHTML += `
            <tbody>
                <tr>
                    <th scope="row">${element.location}</th>
                    <td>${element.active}</td>
                    <td>${element.confirmed}</td>
                    <td>${element.deaths}</td>
                    <td>${element.recovered}</td>
                    <td>
                    <button type="button" onclick="verDetalle('${element.location}')" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
                        Ver Detalle
                    </button>                    
                    </td>
                </tr>               
            </tbody>`;
    });
}

window.verDetalle = (pais) => {
    getDataPais(pais);
}

const iniciarSesion = document.getElementById("IniciarSesion");



iniciarSesion.addEventListener("click", (e)=>{

        e.preventDefault();
        bodyModal.style.backgroundColor="white";
        bodyModal.style.textAlign="left";
        tituloModal.innerHTML = "<h2>Inicio de sesión</h2>";
        bodyModal.innerHTML = `
        <form>
            <div class="mb-3">
                <label for="exampleInputEmail1" class="form-label"><h3>Correo:</h3></label>
                <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp">            
            </div>
            <div class="mb-3">
                <label for="exampleInputPassword1" class="form-label"><h3>Contraseña:</h3></label>
                <input type="password" class="form-control" id="exampleInputPassword1">
            </div>            
            <button type="submit" class="btn btn-primary">Ingresar</button>
      </form>`;

});




