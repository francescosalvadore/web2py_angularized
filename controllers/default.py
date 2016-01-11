
response.delimiters = ('<?','?>')

from mod_logging import *

def index():
	"""
	Just a redirect, maybe to be handled by nginx
	"""
        redirect(request.application+"/routes/#/logging/welcome")

	return dict()
