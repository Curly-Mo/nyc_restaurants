import csv
import webapp2
import urllib2


class Ingest(webapp2.RequestHandler):
    def post(self):
        url = self.request.get('url')

        req = urllib2.Request(url)
        response = urllib2.urlopen(req, timeout=600)

        reader = csv.reader(response, delimiter=',')
        headers = next(reader)
        for line in reader:
            print(line)
            return
