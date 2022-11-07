const getNamesUrl = "https://tomsen.dev/FlowFormaAPI/names";
const getTechUrl = "https://tomsen.dev/FlowFormaAPI/tech";
const getAgeUrl = "https://tomsen.dev/FlowFormaAPI/getdate/"

var names = [];
var techs = [];
var ages = [];
var dataObject = [];

function getAge(birth, death)
{
    var birthDate = new Date(birth);
    var deathDate = new Date(death);

    if(death === null){
        deathDate = new Date();
    }
    
    var month_diff = deathDate - birthDate;
    var age_dt = new Date(month_diff);

    var year = age_dt.getUTCFullYear();
    var age = Math.abs(year - 1970);

    return age;
}

function renderHtml(dataObj, sortParam)
{
    console.log(sortParam);
    dataObj.sort(dynamicSort(sortParam));

    tableHeader = `
    <tr>
        <th scope="col">Name</th>
        <th scope="col">Tech</th>
        <th scope="col">Age</th>
    </tr>`;
    tableBody = '';
    for(let i = 0; i < names.length; i++)
    {
        const name = dataObj[i].name;
        const tech = dataObj[i].tech;
        const age = dataObj[i].age;
        tableBody += `
        <tr>
            <td>${name}</td>
            <td>${tech}</td>
            <td>${age}</td>
        </tr>`;
    }
    $('#table thead').append(tableHeader)
    $('#table tbody').append(tableBody);
}

function createDataObject(names, techs, ages){
    var data = [];
    for(let i = 0; i < names.length; i++)
    {
        var newAge = getAge(ages[i].Birth, ages[i].Death);
        let dataRow = {name: names[i], tech: techs[i], age: newAge}
        data[i] = dataRow;
    }
    return data;
}

function dynamicSort(property)
{
    return function(a,b){
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result;
    }
}


function getData(sortOption)
{
    let firstAPICall = fetch(getNamesUrl);
    let secondAPICall = fetch(getTechUrl);
    
    Promise.all([firstAPICall, secondAPICall])
        .then(values => Promise.all(values.map(value => value.json())))
        .then(finalValues => {
            names = finalValues[0];
            techs = finalValues[1];
            
            let promiseArray = []
            names.map(name => {
                promiseArray.push(fetch(getAgeUrl + name))
            })

            Promise.all(promiseArray)
            .then(values=>Promise.all(values.map(value => value.json())))
            .then(finalValues => {
                printData(names,techs,finalValues,sortOption);
            })
        });
}

function printData(allNames, allTechs, allAges, sortOption){
    names = allNames
    techs = allTechs;
    ages = allAges;

    var newDataObject = createDataObject(names, techs, ages);
    dataObject = newDataObject;
    renderHtml(dataObject, sortOption);
    
    $('#sort-button').prop('disabled', false)
    $('#loading-table').remove();
}

$( document ).ready( getData($("#params option:selected").text().toLowerCase() ) );

$("#sort-button").click( function(){
    $("#table td").remove();
    $("#table th").remove();
    renderHtml( dataObject, $("#params option:selected").text().toLowerCase() )
});
