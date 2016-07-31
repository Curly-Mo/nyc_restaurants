import datetime
import json
import webapp2

from google.appengine.ext import ndb

import models

PROPS = {
    'dba': models.Restaurant.dba,
    'grade': models.Restaurant.grade,
}

class Restaurants(webapp2.RequestHandler):
    def get(self):
        print(self.request)
        min_grade = self.request.get('min_grade')
        sort_order = self.request.get('sort_order', 'dba')
        reverse = self.request.get('reverse', False)
        cuisine = self.request.get('cuisine', '')
        name = self.request.get('name')
        boro = self.request.get('boro')
        limit = int(self.request.get('limit', 10))

        query = models.Restaurant.query()

        if min_grade:
            query = query.filter(
                models.Restaurant.grade > '',
                models.Restaurant.grade <= min_grade.upper()
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


        order = query.order(PROPS[sort_order]).orders
        if reverse and reverse.lower() != 'false':
            order = order.reversed()
        print(order)
        query = query.order(order)

        print(query)
        
        response = []
        for restaurant in query.fetch(limit):
            print(restaurant)
            response.append(restaurant.to_dict())

        response = json.dumps(response, default=JsonHandler)
        self.response.write(response)


def JsonHandler(obj):
    """JSON encoder that can parse datetime objects and ndb keys"""
    if isinstance(obj, datetime.date):
        return obj.isoformat()
    elif isinstance(obj, ndb.Key):
        return obj.id()
    else:
        return json.JSONEncoder().default(obj)
