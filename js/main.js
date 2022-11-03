const getNamesUrl = "https://tomsen.dev/FlowFormaAPI/names";
const getTechUrl = "https://tomsen.dev/FlowFormaAPI/tech";
const getAgeUrl = "https://tomsen.dev/FlowFormaAPI/getdate/"

var names = [];
var techs = [];
var ages = [];
var dataObj = [];

async function fetchUrl(url){
    const response = await fetch(url, {
        method: 'GET',
        dataType: 'json'
    });
    const values = await response.json();
    return values;
}

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

async function fetchAges(url, names){
    var ages = [];
    for await (const name of names){
        const response = await fetch(url + name, {
            method: 'GET',
            dataType: 'json'
        });
        const value = await response.json();
        const bday = value.Birth;
        const death = value.Death;
        var age = getAge(bday, death);
        ages.push(age);
    }
    return ages;
}

function printDataBySort(dataObj, sortParam)
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
        let dataRow = {name: names[i], tech: techs[i], age: ages[i]}
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


async function renderData(sortParam){
    names = await fetchUrl(getNamesUrl);
    techs = await fetchUrl(getTechUrl);
    ages = await fetchAges(getAgeUrl, names);

    dataObj = createDataObject(names,techs,ages);

    printDataBySort(dataObj, sortParam);

    $('#sort-button').prop('disabled', false)
    $('#loading-table').remove();
}

$( document ).ready( renderData( $("#params option:selected").text().toLowerCase() ) );

$("#sort-button").click( function(){
    $("#table td").remove();
    $("#table th").remove();
    printDataBySort( dataObj, $("#params option:selected").text().toLowerCase() )
});