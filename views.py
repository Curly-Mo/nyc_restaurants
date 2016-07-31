import os

import webapp2
import jinja2
from google.appengine.api import taskqueue


JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.join(os.path.dirname(__file__), 'templates')),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)


class Index(webapp2.RequestHandler):
    def get(self):
        template_values = {
        }
        template = JINJA_ENVIRONMENT.get_template('index.html')
        self.response.write(template.render(template_values))


class Schedule(webapp2.RequestHandler):
    def get(self):
        template = JINJA_ENVIRONMENT.get_template('schedule.html')
        self.response.write(template.render())

    def post(self):
        urls = self.request.get('urls')
        task = taskqueue.add(
            url='/admin/ingest',
            target='worker',
            params={'urls': urls}
        )
        self.response.write('Task {} enqueued, '.format(task.name))
        self.response.write('ETA {}.'.format(task.eta))
