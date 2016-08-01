"use strict";
window.addEventListener("load", init, false);

function init(){
    window.restaurants = {};
    var form = document.getElementById('search-form');
    form.onsubmit = function() {
        //get_restaurants();
        return false;
    };
    form.onchange = function() {
        get_restaurants();
    };
    var sortable_headers = document.querySelectorAll('#restaurant-table > thead > tr > th');
    for(var i=0; i<sortable_headers.length; i++){
        var header = sortable_headers[i];
        header.addEventListener('click', sort_by);
    }
    get_restaurants();
}

// Sort by this column header
function sort_by(e){
    var form = document.getElementById('search-form');
    var data = new FormData(form);
    var value = this.textContent;
    if(!data.get(value.toLowerCase())){
        return;
    }
    var siblings = document.querySelectorAll('#restaurant-table > thead > tr > th');
    for(var i=0; i<siblings.length; i++){
        if(siblings[i] != this){
            siblings[i].classList.remove('sort-asc')
            siblings[i].classList.remove('sort-desc')
        }
    }
    form.querySelector('#sort_order').value = value;
    if(!this.classList.contains('sort-asc')){
        this.classList.remove('sort-desc');
        this.classList.add('sort-asc');
        form.querySelector('#reverse').value = false;
    }else{
        this.classList.remove('sort-asc');
        this.classList.add('sort-desc');
        form.querySelector('#reverse').value = true;
    }
    get_restaurants();
}

// Query restaurant API and add results to table
function get_restaurants(){
    var data = new FormData(document.getElementById('search-form'));
	var base_url = '/api/restaurants';
	var params = {
        'min_grade': data.get('grade'),
        'max_grade': data.get('max_grade'),
        'sort_order': data.get('sort_order'),
        'reverse': data.get('reverse'),
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
        var restaurant = restaurants[i];
        var row = restaurant_row(restaurant, headers);
        fragment.appendChild(row);
        window.restaurants[restaurant['camis']] = restaurant;
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
    row.setAttribute('data-id', restaurant['camis']);
    row.addEventListener('click', restaurant_details);
    row.style.cursor = 'pointer';
    return row;
}

// Query and display the inspections for a restaurant
function restaurant_details(e){
    var id = this.getAttribute('data-id');
    get_inspections(id, this);
}

function get_inspections(restaurant_id, node){
    var subtable = document.querySelector('.subtable');
    if(subtable){
        subtable.parentElement.removeChild(subtable);
    }
	var base_url = '/api/inspections';
	var params = {
        'restaurant_id': restaurant_id,
    }
    var url = base_url + '?' + encode_params(params);
	var xhr = new XMLHttpRequest();
    xhr.node = node;
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
        document.getElementById('loader').style.display = 'none';
        if (xhr.readyState == XMLHttpRequest.DONE ) {
           if (xhr.status == 200) {
               var data = JSON.parse(xhr.responseText);
               console.log(data);
               build_inspection_table(data, this.node);
           }
           else if (xhr.status == 400) {
               console.log('Errored!');
           }
           else {
               console.log('Error: ' + xhr.status);
           }
        }
    };
    xhr.send();
}

// Add list off restaurant objects to table
function build_inspection_table(inspections, node){
    var headers = ['type', 'action', 'score', 'grade', 'date'];
    var table = document.createElement('table');
    var header_row = document.createElement('tr');
    table.appendChild(header_row);
    for(var i=0; i<headers.length; i++){
        var cell = document.createElement('th');
        cell.textContent = headers[i];
        header_row.appendChild(cell);
    }
    var body = document.createElement('tbody');
    table.appendChild(body);
    for(var i=0; i<inspections.length; i++){
        var row = inspection_row(inspections[i], headers);
        body.appendChild(row);
        var violations = violation_row(inspections[i]['violations']);
        body.appendChild(violations);
    }
    var tr = document.createElement('tr');
    tr.classList.add('subtable');
    var td = document.createElement('td');
    td.setAttribute('colspan', '100%');
    var empty_td = document.createElement('td');
    tr.appendChild(empty_td);
    tr.appendChild(td);
    td.appendChild(table)
    node.parentNode.insertBefore(tr, node.nextSibling);

    console.log(node)
    google_maps(window.restaurants[node.getAttribute('data-id')], empty_td);
}

// Build a table row from a restaurant object
function inspection_row(inspection, headers){
    var row = document.createElement('tr');
    for(var i=0; i<headers.length; i++){
        var cell = document.createElement('td');
        var value = inspection[headers[i]];
        if(Array.isArray(value)){
            value = value.join(', ');
        }
        cell.textContent = value;
        row.appendChild(cell);
    }
    row.addEventListener('click', function(){
        var violations = this.nextSibling;
        if(violations.offsetParent === null){
            violations.style.display = 'table-row';
        }else{
            violations.style.display = 'none';
        }
    });
    row.style.cursor = 'pointer';
    return row;
}

// Build a table row from a violation list
function violation_row(violations){
    var row = document.createElement('tr');
    row.appendChild(document.createElement('td'));
    var cell = document.createElement('td');
    cell.setAttribute('colspan', '100%');
    cell.style['text-align'] = 'left';
    var list = document.createElement('ul');
    for(var i=0; i<violations.length; i++){
        var item = document.createElement('li');
        item.textContent = violations[i]['description'];
        list.appendChild(item);
    }
    cell.appendChild(list);
    row.appendChild(cell);
    row.style.display = 'none';
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


// Create google maps embed iframe and append it to node
function google_maps(restaurant, node){
    var maps_url = 'https://www.google.com/maps/embed/v1/place?';
    var address = [restaurant.street, restaurant.boro, 'NY', restaurant.zipcode].join(', ');
    var params = {
        'q': restaurant.dba + ', ' + address,
        'key': 'AIzaSyAa0EpTUiJhjXgVw47NECBP9ASM40V9Fns',
    }
    maps_url = maps_url + encode_params(params);
    var maps_embed = document.createElement('iframe');
    maps_embed.setAttribute('src', maps_url);
    maps_embed.setAttribute('frameborder', 0);
    maps_embed.setAttribute('allowfullscreen', '');
    maps_embed.setAttribute('width', 600);
    maps_embed.setAttribute('height', 450);

    maps_embed.style.width = '100%';
    maps_embed.style.height = '100%',
    maps_embed.style.border = '0';
    node.appendChild(maps_embed);
}
