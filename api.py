import datetime
import json
import webapp2
import logging

from google.appengine.ext import ndb

import models

# Map string identifiers to model properties
PROPS = {
    'name': models.Restaurant.dba,
    'grade': models.Restaurant.grade,
    'boro': models.Restaurant.boro,
    'cuisine': models.Restaurant.cuisine_description,
}

class Restaurants(webapp2.RequestHandler):
    """Endpoint to query datastore for a JSON list of Restaurant objects"""
    def get(self):
        min_grade = self.request.get('min_grade')
        max_grade = self.request.get('max_grade')
        sort_order = self.request.get('sort_order', 'dba')
        reverse = self.request.get('reverse', False)
        cuisine = self.request.get('cuisine', '')
        name = self.request.get('name')
        boro = self.request.get('boro')
        limit = int(self.request.get('limit', 10))

        query = models.Restaurant.query()

        if min_grade:
            query = query.filter(
                models.Restaurant.grade != '',
                models.Restaurant.grade <= min_grade.upper()
            )
        if max_grade:
            query = query.filter(
                models.Restaurant.grade >= max_grade.upper()
            )
        if cuisine:
            cuisine = [x.strip().lower() for x in cuisine.split(',')]
            query = query.filter(
                models.Restaurant.cuisine_description.IN(cuisine)
            )
        if boro:
            boro = [x.strip() for x in boro.split(',')]
            query = query.filter(
                models.Restaurant.boro.IN(boro)
            )
        if name:
            query = query.filter(
                models.Restaurant.dba == name.upper()
            )

        sort_prop = PROPS[sort_order.lower()]
        order = query.order(sort_prop).orders
        if reverse and reverse.lower() != 'false':
            order = order.reversed()
        logging.info(order)
        query = query.order(order)

        logging.info(query)
        
        response = []
        for restaurant in query.fetch(limit):
            response.append(restaurant.to_dict())

        response = json.dumps(response, default=JsonHandler)
        self.response.write(response)

class Inspections(webapp2.RequestHandler):
    """
    Endpoint to query datastore for a JSON list of Inspections given a
    restaurant id
    """
    def get(self):
        restaurant_id = int(self.request.get('restaurant_id'))
        logging.info(restaurant_id)

        restaurant = ndb.Key('Restaurant', restaurant_id).get()
        inspections = []
        for key in restaurant.inspections:
            inspection = key.get()
            violations = []
            for violation_key in inspection.violations:
                violation = violation_key.get()
                violations.append(violation.to_dict())
            inspection = inspection.to_dict()
            inspection['violations'] = violations
            inspections.append(inspection)

        inspections.sort(key=lambda x: x['date'], reverse=True)

        response = json.dumps(inspections, default=JsonHandler)
        self.response.write(response)

def JsonHandler(obj):
    """JSON encoder that can parse datetime objects and ndb keys"""
    if isinstance(obj, datetime.date):
        return obj.isoformat()
    elif isinstance(obj, ndb.Key):
        return obj.id()
    else:
        return json.JSONEncoder().default(obj)
