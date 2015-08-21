# -*- coding: utf-8 -*-

#########################################################################
## This scaffolding model makes your app work on Google App Engine too
## File is released under public domain and you can use without limitations
#########################################################################

# main_title = "web2py angularized"
# main_url = "http://localhost:8001/web2py_angularized"

import logging, logging.handlers

# From http://www.web2pyslices.com/slice/show/1416/logging
# ensure the logger is configured only once
def get_configured_logger(name):
    logger = logging.getLogger(name)
    if (len(logger.handlers) == 0):
        # This logger has no handlers, so we can assume it hasn't yet been configured
        # (Configure logger)
        # Create RotatingFileHandler
        import os
        formatter="%(asctime)s %(levelname)s %(process)s %(thread)s %(funcName)s():%(lineno)d %(message)s"
        handler = logging.handlers.RotatingFileHandler(os.path.join(request.folder,'private/app.log'),maxBytes=1024*1024,backupCount=2)
        handler.setFormatter(logging.Formatter(formatter))
        handler.setLevel(logging.DEBUG)

        logger.addHandler(handler)
        logger.setLevel(logging.DEBUG)

        # Test entry:
        logger.debug(name + ' logger created')
    else:
        # Test entry:
        logger.debug(name + ' already exists')
        logger.info(name + ' info logger exists')

    return logger

# Assign application logger to a global var  
logger = get_configured_logger(request.application)

## if SSL/HTTPS is properly configured and you want all HTTP requests to
## be redirected to HTTPS, uncomment the line below:
# request.requires_https()

if not request.env.web2py_runtime_gae:
    ## if NOT running on Google App Engine use SQLite or other DB
    db = DAL('sqlite://storage.sqlite',pool_size=1,check_reserved=['all'])
else:
    ## connect to Google BigTable (optional 'google:datastore://namespace')
    db = DAL('google:datastore+ndb')
    ## store sessions and tickets there
    session.connect(request, response, db=db)
    ## or store session in Memcache, Redis, etc.
    ## from gluon.contrib.memdb import MEMDB
    ## from google.appengine.api.memcache import Client
    ## session.connect(request, response, db = MEMDB(Client()))

## by default give a view/generic.extension to all actions from localhost
## none otherwise. a pattern can be 'controller/function.extension'
response.generic_patterns = ['*'] if request.is_local else []

## (optional) optimize handling of static files
# response.optimize_css = 'concat,minify,inline'
# response.optimize_js = 'concat,minify,inline'
## (optional) static assets folder versioning
# response.static_version = '0.0.0'
#########################################################################
## Here is sample code if you need for
## - email capabilities
## - authentication (registration, login, logout, ... )
## - authorization (role based authorization)
## - services (xml, csv, json, xmlrpc, jsonrpc, amf, rss)
## - old style crud actions
## (more options discussed in gluon/tools.py)
#########################################################################

from gluon.tools import Auth, Service, PluginManager

auth = Auth(db)
service = Service()
plugins = PluginManager()

auth.settings.extra_fields['auth_user']= [
        Field('passphrase',writable=False)
        #, Field('username',writable=False)
        ]

## create all tables needed by auth if not custom tables
#db.auth_user.drop()
auth.define_tables(username=True, signature=False)

auth.settings.expiration = 3600*4*24 # four days
auth.settings.long_expiration = 3600*24*30 # one month
## configure email
mail = auth.settings.mailer
mail.settings.server = '127.0.0.1:25' # 'logging' if request.is_local else 'smtp.gmail.com:587'
mail.settings.sender = 'you@gmail.com'
mail.settings.login = None # 'username:password'

## configure auth policy
auth.settings.registration_requires_verification = False
auth.settings.registration_requires_approval = False
auth.settings.reset_password_requires_verification = True

## if you need to use OpenID, Facebook, MySpace, Twitter, Linkedin, etc.
## register with janrain.com, write your domain:api_key in private/janrain.key
from gluon.contrib.login_methods.janrain_account import use_janrain
use_janrain(auth, filename='private/janrain.key')

#########################################################################
## Define your tables below (or better in another model file) for example
##
## >>> db.define_table('mytable',Field('myfield','string'))
##
## Fields can be 'string','text','password','integer','double','boolean'
##       'date','time','datetime','blob','upload', 'reference TABLENAME'
## There is an implicit 'id integer autoincrement' field
## Consult manual for more options, validators, etc.
##
## More API examples for controllers:
##
## >>> db.mytable.insert(myfield='value')
## >>> rows=db(db.mytable.myfield=='value').select(db.mytable.ALL)
## >>> for row in rows: print row.id, row.myfield
#########################################################################

## after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)

# Make variables available from the modules!
# http://stackoverflow.com/questions/11959719/web2py-db-is-not-defined
from gluon import current
current.logger = logger
current.auth = auth
