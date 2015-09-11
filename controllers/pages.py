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

        import datetime
        limit = request.now - datetime.timedelta(minutes=30)
        query = db.auth_event.time_stamp > limit
        query &= db.auth_event.description.contains('Logged-')
        events = db(query).select(db.auth_event.user_id, db.auth_event.description,
            orderby=db.auth_event.user_id|db.auth_event.time_stamp)
        users = []
        for i in range(len(events)):
            last_event = ((i == len(events) - 1) or
                           events[i+1].user_id != events[i].user_id)
            if last_event and 'Logged-in' in events[i].description:
                users.append(events[i].user_id)
        logged_in_users = db(db.auth_user.id.belongs(users)).select()

        return_dict['logged_users'] = []
        for lu in logged_in_users:
            return_dict['logged_users'].append(str(lu.username))

        # slowerize_fun()

        return gluon.contrib.simplejson.dumps(return_dict)

    return locals()
