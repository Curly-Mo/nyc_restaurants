from google.appengine.ext import ndb


class Restaurant(ndb.Model):
    dba = ndb.StringProperty()
    boro = ndb.StringProperty()
    building = ndb.StringProperty()
    street = ndb.StringProperty()
    zipcode = ndb.StringProperty()
    phone = ndb.StringProperty()
    cuisine_description = ndb.StringProperty()
    grade = ndb.StringProperty()
    grade_date = ndb.DateProperty()
    record_date = ndb.DateProperty()
    inspections = ndb.KeyProperty(repeated=True)


class Inspection(ndb.Model):
    restaurant = ndb.KeyProperty()
    date = ndb.DateProperty()
    action = ndb.StringProperty()
    violations = ndb.KeyProperty(repeated=True)
    score = ndb.IntegerProperty()
    grade = ndb.StringProperty()
    grade_date = ndb.DateProperty()
    record_date = ndb.DateProperty()
    type = ndb.StringProperty()


class Violation(ndb.Model):
    code = ndb.StringProperty()
    description = ndb.StringProperty()
    critical_flag = ndb.StringProperty()
