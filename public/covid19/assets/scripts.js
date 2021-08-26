console.log('hola');

//const modal = document.querySelector('.modal');
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
            y: element.confirmed
        });

    });

    casosMayores.forEach(element => {

        estadisticasMuertos.push({
            label: element.location,
            y: element.deaths
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
            name: "Confirmados",
            legendText: "Confirmados",
            showInLegend: true,
            dataPoints: estadisticasConfirmados,
        },
        {
            type: "column",
            name: "Muertes",
            legendText: "Muertes",
            showInLegend: true,
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
                    <button type="button" onclick="verDetalle('${element.location}')" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#miModal">
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

//situacion chile
const iniciarSesion = document.getElementById("IniciarSesion");
const situacionChile = document.getElementById("situacionChile");
const cerrarSesion = document.getElementById("cerrarSesion");
const claveToken = localStorage.getItem('jwt-token');
let grupoConfirmados = [];
let grupoMuertos = [];
let grupoRecuperados = [];



//obtener datos chile

const getDataConfirmados = async (jwt) => {

    const res = await fetch('http://localhost:3000/api/confirmed',
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${jwt}`
            }
        })
    const { data } = await res.json();

    return data;
};

//const getDataMuertos;
const getDataMuertos = async (jwt) => {

    const res = await fetch('http://localhost:3000/api/deaths',
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${jwt}`
            }
        })
    const { data } = await res.json();

    return data
};

//const getDataRecuperados;
const getDataRecuperados = async (jwt) => {

    const res = await fetch('http://localhost:3000/api/recovered',
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${jwt}`
            }
        })
    const { data } = await res.json();

    return data
};



const postData = async (correo, clave, spanError) => {

    try {

        const res = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            body: JSON.stringify({ email: correo, password: clave })
        });
        const { token } = await res.json();
        localStorage.setItem('jwt-token', token);

        if (token == undefined) throw "El correo y/o contraseña son incorrectas.";

        return token;

    } catch (error) {
        console.error(`El error es: ${error}`);
        document.getElementById(spanError).innerHTML = `${error}`;
        setTimeout(() => {
            document.getElementById(spanError).innerHTML = "";
        }, 3000);
    }

}

const toggle = () => {

    $(iniciarSesion).toggle();
    $(situacionChile).toggle();
    $(cerrarSesion).toggle();
}

const updateNav = () => {

    $("#miModal").modal('hide');//ocultamos el modal
    $('body').removeClass('modal-open');//eliminamos la clase del body para poder hacer scroll
    //seteo de navegador
    toggle();
};

iniciarSesion.addEventListener("click", (e) => {

    e.preventDefault();
    bodyModal.style.backgroundColor = "white";
    bodyModal.style.textAlign = "left";
    tituloModal.innerHTML = "<h4>Inicio de sesión</h4>";
    bodyModal.innerHTML = `
        <form id="js-form-login">
            <div class="mb-3">
                <label for="exampleInputEmail1" class="form-label"><h5>Correo:</h5></label>
                <input type="email" class="form-control" id="InputEmail" aria-describedby="emailHelp">            
            </div>
            <div class="mb-3">
                <label for="exampleInputPassword1" class="form-label"><h5>Contraseña:</h5></label>
                <input type="password" class="form-control" id="InputPassword">
            </div> 
            <div class="mb-3">
            <span id="spanError" class="text-danger"></span>  
            </div>         
            <button type="submit" class="btn btn-primary">Ingresar</button>
    </form>`;

    const formulario = document.getElementById('js-form-login');

    formulario.addEventListener('submit', async (e) => {

        e.preventDefault();
        let email = document.getElementById('InputEmail').value;
        let pass = document.getElementById('InputPassword').value;

        if (email && pass) {
            const JWT = await postData(email, pass, 'spanError');
            console.log(JWT);
            if (JWT) {
                updateNav();
            }

        }
        else {
            alert('Faltan datos por llenar');
        }

    });

});

situacionChile.addEventListener('click', async (e) => {

    document.getElementById('chartContainer').style.display = "none";
    document.getElementById('tablita').style.display = "none";

    //$('#cargando').text('Cargando...');
    document.getElementById('cargando').innerHTML = `<img class="loader" src="http://localhost:3000/covid19/assets/img/puff.svg" alt="cargando">`

    const confirmados = await getDataConfirmados(claveToken);
    const muertos = await getDataMuertos(claveToken);
    const recuperados = await getDataRecuperados(claveToken);
    console.log(confirmados, muertos, recuperados);

    if (confirmados && muertos && recuperados) {
        //$('#cargando').text('');
        document.getElementById('cargando').innerHTML="";
    }

    graficoChile(confirmados, muertos, recuperados);

});

//grafico situación chile
const graficoChile = (confirmados, muertos, recuperados) => {

    confirmados.forEach(element => {

        grupoConfirmados.push({
            x: new Date(element.date),
            y: element.total
        });
    });

    muertos.forEach(element => {

        grupoMuertos.push({
            x: new Date(element.date),
            y: element.total
        });
    });

    recuperados.forEach(element => {

        grupoRecuperados.push({
            x: new Date(element.date),
            y: element.total
        });
    });

    var chart = new CanvasJS.Chart("chartContainerChile", {
        animationEnabled: true,
        title: {
            text: "Situación Chile"
        },
        axisX: {
            valueFormatString: "DD MMM,YY"
        },
        axisY: {
            title: "Cantidad de casos"
        },
        legend: {
            cursor: "pointer",
            fontSize: 16,
            itemclick: toggleDataSeries
        },
        toolTip: {
            shared: true
        },
        data: [{
            name: "Confirmados",
            type: "spline",
            showInLegend: true,
            dataPoints: grupoConfirmados

        },
        {
            name: "Muertes",
            type: "spline",
            showInLegend: true,
            dataPoints: grupoMuertos
        },
        {
            name: "Recuperados",
            type: "spline",
            showInLegend: true,
            dataPoints: grupoRecuperados
        }]
    });
    chart.render();

    function toggleDataSeries(e) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        }
        else {
            e.dataSeries.visible = true;
        }
        chart.render();
    }

}

//cerrar sesion
cerrarSesion.addEventListener('click', ()=>{
    localStorage.removeItem('jwt-token');
    toggle();
    location.reload();
})

const init = async () => {
    const token = localStorage.getItem('jwt-token');

    if (token) {
        toggle();
    }
}

init();









