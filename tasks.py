import csv
import webapp2
import requests
import datetime

from google.appengine.ext import ndb

import models


class Ingest(webapp2.RequestHandler):
    def post(self):
        url = self.request.get('url')

        response = requests.get(url)

        reader = csv.reader(response.iter_lines(), delimiter=',')
        headers = next(reader)
        headers = tuple(header.lower().replace(' ', '_') for header in headers)
        print(headers)
        for num, line in enumerate(reader):
            fields = {header: value for header, value in zip(headers, line)}
            # Cast fields to correct type
            fields['camis'] = int(fields['camis'])
            try:
                fields['score'] = int(fields['score'])
            except ValueError:
                fields['score'] = None
            try:
                fields['inspection_date'] = datetime.datetime.strptime(
                        fields['inspection_date'], '%m/%d/%Y').date()
            except ValueError:
                fields['inspection_date'] = None
            try:
                fields['grade_date'] = datetime.datetime.strptime(
                        fields['grade_date'], '%m/%d/%Y').date()
            except ValueError:
                fields['grade_date'] = None
            try:
                fields['record_date'] = datetime.datetime.strptime(
                        fields['record_date'], '%m/%d/%Y').date()
            except ValueError:
                fields['record_date'] = None

            if fields['violation_code']:
                violation = ndb.Key('Violation', fields['violation_code']).get()
                if violation is None:
                    violation = models.Violation(
                        id=fields['violation_code'],
                        code=fields['violation_code'],
                        description=fields['violation_description'],
                        critical_flag=fields['critical_flag'],
                    )
                    violation.put()

            restaurant = ndb.Key('Restaurant', fields['camis']).get()
            if restaurant is None:
                restaurant = models.Restaurant(
                    id=fields['camis'],
                    dba=fields['dba'],
                    boro=fields['boro'],
                    building=fields['building'],
                    street=fields['street'],
                    zipcode=fields['zipcode'],
                    phone=fields['phone'],
                    cuisine_description=fields['cuisine_description'],
                    grade=fields['grade'],
                    grade_date=fields['grade_date'],
                    record_date=fields['record_date'],
                )
            elif fields['grade_date'] > restaurant.grade_date:
                restaurant.grade = fields['grade']
                restaurant.grade_date = fields['grade_date']

            query = models.Inspection.query(
                models.Inspection.restaurant == restaurant.key and
                models.Inspection.date == fields['inspection_date']
            )
            inspection = query.get()
            print(inspection)
            if inspection is None:
                inspection = models.Inspection(
                    restaurant=restaurant.key,
                    date=fields['inspection_date'],
                    action=fields['action'],
                    score=fields['score'],
                    grade=fields['grade'],
                    grade_date=fields['grade_date'],
                    record_date=fields['record_date'],
                    type=fields['inspection_type'],
                    violations=[]
                )
            if violation and violation.key not in inspection.violations:
                inspection.violations.append(violation.key)
            inspection.put()

            restaurant.inspections.append(inspection.key)
            restaurant.put()
