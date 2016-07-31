"use strict";
window.addEventListener("load", init, false);

function init(){
    var form =document.getElementById('search-form');
    form.onsubmit = function() {
        get_restaurants();
        return false;
    };
    form.onchange = function() {
        get_restaurants();
    };
    get_restaurants();
}

// Query restaurant API and add results to table
function get_restaurants(){
    var data = new FormData(document.getElementById('search-form'));
	var base_url = '/api/restaurants';
	var params = {
        'min_grade': 'B',
        'sort_order': 'grade',
        'reverse': false,
        'cuisine': data.get('cuisine'),
        'boro': data.getAll('boro'),
        'name': data.get('name'),
        'limit': data.get('limit'),
    }
    var url = base_url + '?' + encode_params(params);
	var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
        document.getElementById('loader').style.display = 'none';
        if (xhr.readyState == XMLHttpRequest.DONE ) {
           if (xhr.status == 200) {
               var data = JSON.parse(xhr.responseText);
               console.log(data);
               build_restaurant_table(data);
           }
           else if (xhr.status == 400) {
               console.log('Errored!');
           }
           else {
               console.log('Error: ' + xhr.status);
           }
        }
    };
    document.getElementById('loader').style.display = 'block';
    empty_node(document.querySelector('#restaurant-table > tbody'));
    xhr.send();
}

// Add list off restaurant objects to table
function build_restaurant_table(restaurants){
    var headers = ['dba', 'cuisine_description', 'boro', 'grade'];
    var fragment = document.createDocumentFragment();
    for(var i=0; i<restaurants.length; i++){
        var row = restaurant_row(restaurants[i], headers);
        fragment.appendChild(row);
    }
    var table_body = document.querySelector('#restaurant-table > tbody');
    table_body.appendChild(fragment);
}

// Build a table row from a restaurant object
function restaurant_row(restaurant, headers){
    var row = document.createElement('tr');
    for(var i=0; i<headers.length; i++){
        var cell = document.createElement('td');
        var value = restaurant[headers[i]];
        if(Array.isArray(value)){
            value = value.join(', ');
        }
        cell.textContent = value;
        row.appendChild(cell);
    }
    return row;
}

// Encode query params for use with an HTTP Request
function encode_params(params){
	var query_string = Object.keys(params).map(function(k) {
		return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
	}).join('&');
	return query_string;
}

// Most efficient way to delete all children of an element
function empty_node(node){
    var cnode = node.cloneNode(false);
    node.parentNode.replaceChild(cnode ,node);
}
