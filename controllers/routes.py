# -*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

# change delimiters to avoid clash with AngularJS delimiters ({{  and }})
# change here so that appadmin controller still works
response.delimiters = ('<?','?>')

#----------------------------------------------------------
# Action for the main page. The application is single page
# except for the authentication pages provided by the "user" action
#----------------------------------------------------------
def index():
    """
    Action for the main page.
    It must return something, e.g. an empty dict is ok
    """

    # the next is not needed (automatic)
    #  response.view = 'routes/index.html'

    # the next can be activated to put the site under maintenance
    # but the APIs still work!
    #  response.view = 'routes/maintenance.html'
    
    return dict()

#----------------------------------------------------------
# AngularJS partial routes actions (each partial route
# must have its own action, not so nice but...)
# Check that the action is called by an AJAX request, i.e.
# that there is request X-Requested-With -- > XMLHttpRequest
# When called from angular (routes) this request feature
# is manually added to the configure route. The variable
# request.ajax is provided in web2py to detect that the call
# is performed by AJAX.
# Beware: partial actions are required even in other cases
# (ng-include, modals,...)
#----------------------------------------------------------
# import inspect to get the name of the function
import inspect

partial_route_error_message = """
    This page must be accessed as a partial Angular JS route.
    What does it mean? Well, just add "#/" before the name of
    the function (the last word of the address)
    """

def gen_route(response,request,controller):
    if not request.ajax: raise HTTP(404, partial_route_error_message)
    # stack[1] component because I need the name of the calling function
    function_name = inspect.stack()[1][3]
    response.view = controller+'/'+function_name+'.html'
#    logger.debug("Loading view: "+str(response.view))
    if auth and auth.environment:
        session = auth.environment.session 
        if session.auth:
            response.session_cookie_expires = session.auth.expiration;
    return None

# routes
# (1) Logging
def logging()              : gen_route(response,request,'logging') ; return dict()
# beware, this action return the form=auth.login() needed to initialize the auth environment
# probably the session
def user_login()           : 
    gen_route(response,request,'logging') ; 
    return dict(form = auth.login())
def user_register()        : gen_route(response,request,'logging') ; return dict()
def user_profile()         : gen_route(response,request,'logging') ; return dict()
def user_passwdchange()    : gen_route(response,request,'logging') ; return dict()
def user_reqresetpasswd()  : gen_route(response,request,'logging') ; return dict()
def user_resetpasswd()     : gen_route(response,request,'logging') ; return dict()
def user_verify()          : gen_route(response,request,'logging') ; return dict()
def user_manageapprovals() : gen_route(response,request,'logging') ; return dict()

# (2) Pages
def welcome() :     gen_route(response,request,'pages') ;      return dict()
# welcome_logged is a special route which is accesses after logging.
# the html is the same as the welcome route (welcome.html) but
# here I set the session cookie as it arrives from the auth session object
# It seems that the cookies cannot be set inside the APIs
def welcome_logged() :   
    function_name = inspect.stack()[1][3]
    response.view = 'pages/welcome.html'                                                                                                                                          
    # if auth and auth.environment:
    #     session = auth.environment.session 
    #     if session.auth:
    #         response.session_cookie_expires = session.auth.expiration; #auth.settings.long_expiration ; 
    #         logger.debug("session_id_name: "+str(response.session_id_name)) ; 
    #         logger.debug("cookies: "+str(response.cookies)) ; 
    #         # response.cookies[response.session_id_name]['expires'] = auth.settings.long_expiration ;
    #         # response.session_cookie_expires = auth.settings.long_expiration ; 
 
    return dict()

def welcome_view_1()    : gen_route(response,request,'pages') ; return dict()
def welcome_view_2()    : gen_route(response,request,'pages') ; return dict()

def page1()        : gen_route(response,request,'pages') ; return dict()
def page1tab1()    : gen_route(response,request,'pages') ; return dict()
def page1tab2()    : gen_route(response,request,'pages') ; return dict()
def page1tab3()    : gen_route(response,request,'pages') ; return dict()

def page2()        : gen_route(response,request,'pages') ; return dict()
def page2tab1()    : gen_route(response,request,'pages') ; return dict()
def page2tab2()    : gen_route(response,request,'pages') ; return dict()

def page3()        : gen_route(response,request,'pages') ; return dict()
def page4()        : gen_route(response,request,'pages') ; return dict()
def page5()        : gen_route(response,request,'pages') ; return dict()
def page6()        : gen_route(response,request,'pages') ; return dict()

# (3) modals
def activate_loading()     : gen_route(response,request,'logging') ; return dict()