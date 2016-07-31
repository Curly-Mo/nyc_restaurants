import webapp2

import views
import tasks
import api


app = webapp2.WSGIApplication([
    ('/', views.Index),
    ('/admin/schedule', views.Schedule),
    ('/admin/ingest', tasks.Ingest),
    ('/api/restaurants', api.Restaurants),
], debug=True)
