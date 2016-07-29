import webapp2

import views
import tasks


app = webapp2.WSGIApplication([
    ('/', views.Index),
    ('/admin/schedule', views.Schedule),
    ('/admin/ingest', tasks.Ingest),
    ('/logout', views.Logout),
], debug=True)
