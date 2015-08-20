# -*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

# change delimiters to avoid clash with AngularJS delimiters ({{  and }})
# change here so that appadmin controller still works
response.delimiters = ('<?','?>')

import gluon.contrib.simplejson
import os, re
from pprint import pprint

# import web2py modules
from mod_logging import *

@request.restful()
def api_simple_page_data():

    response.view = 'generic.json'

    def GET():

        doc = GET.func_doc
        return_dict = dict(doc=doc)
        logger.debug("Getting data from server! auth: "+str(auth))
        return_dict['a'] = 'b' 
        user_groups = get_groups()
        return_dict['groups'] = user_groups
        if auth.is_logged_in():
            return_dict['user'] = auth.user.username

        slowerize_fun()

        return gluon.contrib.simplejson.dumps(return_dict)

    return locals()