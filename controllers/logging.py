# -*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

# change delimiters to avoid clash with AngularJS delimiters ({{  and }})
# change here so that appadmin controller still works
response.delimiters = ('<?','?>')

import gluon.contrib.simplejson
import os, re
import time
from pprint import pprint

# import web2py modules
from mod_logging import *

@request.restful()
def api_user():
    response.view = 'generic.json'
    def GET():
        """
        Get the status info of the logged user (if any)
        """
        # slowerize_fun()

        logger.info("Getting the info on the current logged user (if so), auth.user: "+str(auth.user))

        doc = GET.func_doc
        return_dict = dict(doc=doc)

        # what does request contain?
        # for rr,vv in request.iteritems():
        #     return_dict[rr] = str(vv) 
        # return_dict["try"] = "http://"+str(request.env.http_host)+"/"+str(request.application)

        if not auth.is_logged_in():
            logger.debug("not logged strange")
            return gluon.contrib.simplejson.dumps(dict(logged_user={"logged":False}))

        user_name = auth.user.username
        first_name = auth.user.first_name
        last_name = auth.user.last_name
        email = auth.user.email
        user_id = auth.user.id

        passphrase = ''
        if user_passphrase_active:
            table_user = auth.settings.table_user 
            passphrase = auth.db(table_user['username'] == user_name).select().first().passphrase

        logger.info("Logged user: "+str(auth.user))

        user_groups = get_groups()

        logger.info("Logged user has groups: "+str(user_groups))
        return_dict['logged_user'] = {
                                         "logged"     : True,
                                         "username"   : user_name,
                                         "firstname"  : first_name,
                                         "lastname"   : last_name,
                                         "email"      : email,
                                         "passphrase" : passphrase,
                                         "id"         : user_id,
                                         "groups"     : user_groups,
                                         "can_create" : user_groups['can_create'],
                                         "web_admin"  : user_groups['web_admin']
                                     }

        if user_groups.get('web_admin'):
            user_allowed_groups = get_groups(user_type="ALL")
        else:
            user_allowed_groups = user_groups

        return_dict['logged_user']['allowed_groups'] = user_allowed_groups

        return gluon.contrib.simplejson.dumps(return_dict)

    return locals()

@request.restful()
def api_login_bare():
    response.view = 'generic.json'

    def POST(login_user):
        doc = POST.func_doc
        return_dict = dict(doc=doc)
        logger.debug("login_user: "+str(login_user))
        user = login_user['user']
        passwd = login_user['passwd']
        rememberme = login_user['rememberme']

        # Following this answer I manually add the remeber option to the login_bare authentication method
        # http://git.net/web2py/msg109649.html
        # It seems that the cookie cannot be set here. So I add the cookie
        # in the special route welcome_logged above (here It is well understood)
        user = auth.login_bare(user,passwd)
        if user:
            session = auth.environment.session   
            session.auth.expiration =  auth.settings.expiration
        
        if user and rememberme:
             session.auth.expiration =  auth.settings.long_expiration
             session.auth.remember = True

        if user:
            return_dict['logged_user'] = {}
            return_dict['logged_user']['name']  = user.username
            return_dict['logged_user']['id']  = user.id
            logger.debug("User logged:  "+str(user))
#            auth.log_event(auth.messages.login_log % auth.user) 
        else:
            return_dict['logged_user'] = False

        return gluon.contrib.simplejson.dumps(return_dict)

    return locals()

@request.restful()
def api_logout_bare():
    response.view = 'generic.json'
    def POST():
        doc = POST.func_doc
        
        auth.environment.session.auth = None           
        auth.environment.session.flash = auth.messages.logged_out 

#        if auth.user: 
#            auth.log_event(auth.messages.logout_log % auth.user) 

        return_dict = dict(doc=doc)
        
        return gluon.contrib.simplejson.dumps(return_dict)

    return locals()

@request.restful()
def api_register_bare():
    response.view = 'generic.json'
    def POST(reg_user):
        doc = POST.func_doc
        return_dict = dict(doc=doc)
        user_dict = {}
        
        table_user = auth.settings.table_user 
        user = auth.db(table_user['username'] == reg_user['username']).select().first()
        if user:
            return_dict['err_found'] = True
            return_dict['err_msg'] = 'Username already registered'
            return gluon.contrib.simplejson.dumps(return_dict)

        user = auth.db(table_user['email'] == reg_user['email']).select().first()
        if user:
            return_dict['err_found'] = True
            return_dict['err_msg'] = 'Mail already registered'
            return gluon.contrib.simplejson.dumps(return_dict)

        user_dict['username'] = reg_user['username']
        user_dict['first_name'] = reg_user['firstname']
        user_dict['last_name'] = reg_user['lastname']

        user_dict['email'] = reg_user['email']
        if not re.match(r"[^@]+@[^@]+\.[^@]+",reg_user['email']):
            return_dict['err_found'] = True
            return_dict['err_msg'] = 'Invalid mail'
            return gluon.contrib.simplejson.dumps(return_dict)

        passwd = reg_user['passwd']
        if len(passwd) < 4:
            return_dict['err_found'] = True
            return_dict['err_msg'] = 'Password must have at least four characters'
            return gluon.contrib.simplejson.dumps(return_dict)
        
        passfield = auth.settings.password_field
        
        #alg = 'pbkdf2(1000,20,sha512)'
        #user_dict[passfield] =  CRYPT(digest_alg=alg,salt=True)(passwd)[0]
        user_dict[passfield] = CRYPT(key=auth.settings.hmac_key)(passwd)[0]

        logger.debug("pass_field: "+str(user_dict)+" with passwd:"+passwd)
     
        if auth.settings.registration_requires_verification: 
            table_user.registration_key.default = verify_key = web2py_uuid()
            main_url = "http://"+str(request.env.http_host)+"/"+str(request.application)
            verify_msg = "Welcome "+user_dict['username']+" click on the link "+main_url+"/routes/#/logging/user_verify?key="+verify_key+" to verify your mail"
            logger.debug("registration requires mail verification")
            if not auth.settings.mailer or \
                not auth.settings.mailer.send(to=user_dict['email'], 
                    subject=auth.messages.verify_email_subject, 
                    message=verify_msg): 
                return_dict['err_found'] = True
                return_dict['err_msg'] = 'Invalid mail'
                return gluon.contrib.simplejson.dumps(return_dict)      
            return_dict['to_verify'] = True

        # the next function also creates the user_groups
        user = auth.get_or_create_user(user_dict)

        logger.debug("User registered:  "+str(user))        
        
        if user_passphrase_active:
#           improve random string following http://stackoverflow.com/questions/7479442/high-quality-simple-random-password-generator
#           alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
#           os.urandom()
#           instead of http://stackoverflow.com/questions/2257441/random-string-generation-with-upper-case-letters-and-digits-in-python
            db.auth_user.passphrase.writable = True
            import random, string
            pf = ''.join(random.SystemRandom().choice(string.ascii_lowercase + string.digits) for _ in range(16))
            db(db.auth_user.username == user_dict['username']).update(passphrase=pf)
            db.auth_user.passphrase.writable = False
            # print "db.auth_user.passphrase.writable :",db.auth_user.passphrase.writable
        
        db.commit()

        user_db = auth.db(table_user['username'] == reg_user['username']).select().first()
  
        if not auth.settings.registration_requires_verification and auth.settings.registration_requires_approval: 
            user_db.update_record(registration_key='pending')
            return_dict['to_approve'] = True

        # After registration the user is automatically logged in (uncomment the next)
        # But it has to be modified in case approval and/or verification are active
        # user = auth.login_bare(user_dict['username'],passwd)

        return gluon.contrib.simplejson.dumps(return_dict)

    return locals()

@request.restful()
def api_get_pending_users():
    response.view = 'generic.json'
    def GET():
        doc = GET.func_doc
        return_dict = dict(doc=doc)
        user_dict = {}

        logged_user_id = auth.user.id
        if not auth.has_membership(user_id=logged_user_id, role='web_admin'):
            msg = 'Cannot list pending registrations. Only web_admin users can do that!'
            logger.debug(msg)
            raise HTTP(403, msg)

        table_user = auth.settings.table_user 
        pending_users = auth.db(table_user['registration_key'] == 'pending').select().as_list()
        
        return_dict['pending_users'] = pending_users
        
        return gluon.contrib.simplejson.dumps(return_dict)

    return locals()

@request.restful()
def api_approve_pending_user():
    response.view = 'generic.json'
    def POST(username):
        doc = POST.func_doc
        return_dict = dict(doc=doc)
        user_dict = {}

        logged_user_id = auth.user.id
        if not auth.has_membership(user_id=logged_user_id, role='web_admin'):
            msg = 'Cannot approve registration. Only web_admin users can do that!'
            logger.debug(msg)
            raise HTTP(403, msg)

        table_user = auth.settings.table_user 
        pending_user = auth.db(table_user['username'] == username).select().first()
        
        pending_user.update_record(registration_key='')
        
        msg = "Your registration has been approved. Welcome to the web-site"
        if auth.settings.mailer and auth.settings.mailer.send(
            to=pending_user['email'],
            subject="Registration approved",
            message=msg):
            logger.debug("User approval mail sent: "+username)
        else:
            msg = 'Cannot send email after user '+username+' approval'
            logger.debug(msg)
            raise HTTP(403, msg)
        
        return gluon.contrib.simplejson.dumps(return_dict)

    return locals()

def check_username_exists():
    """
    Called by ngRemoteValidate Angular library directive.
    https://github.com/webadvanced/ng-remote-validate
    This method is not restful but the library wants it so.
    If a user has the same name, it returns that
    it is not a valid name!
    """

    username = request.post_vars['value']

    result = dict()

    table_user = auth.settings.table_user 
    username_found = auth.db(table_user['username'] == username).select().first()

    logger.debug("CHECKING username :"+str(username))

    if username_found:
        result['isValid'] = False
    else:
        result['isValid'] = True

    result['value'] = ""

    return gluon.contrib.simplejson.dumps(result)

@request.restful()
def api_profile_bare():
    response.view = 'generic.json'
    def POST(pro_user):
        doc = POST.func_doc
        return_dict = dict(doc=doc)
        user_dict = {}
        logger.debug("pro_user: "+str(pro_user))

        user_dict['username'] = pro_user['username']

        if not auth.is_logged_in():
            msg = 'Cannot update profile. User not logged'
            logger.debug(msg)
            raise HTTP(403, msg)

        logged_username = auth.user.username
        if pro_user['username'] != logged_username:
            msg = 'Cannot update profile of user '+pro_user['username']+' User logged as: '+logged_username
            logger.debug(msg)
            raise HTTP(403, msg)

        table_user = auth.settings.table_user 
        user = auth.db(table_user['username'] == pro_user['username']) #.select().first()
        # Note that the mail is unchanged
        user.update(first_name = pro_user['firstname'], last_name = pro_user['lastname'], registration_key= '') 

        # I also need to update the session!
        # http://stackoverflow.com/questions/13059557/web2py-auth-user-object-returns-obsolete-data
        auth.user.update(first_name = pro_user['firstname'], last_name = pro_user['lastname'], registration_key= '')

        return gluon.contrib.simplejson.dumps(return_dict)

    return locals()

@request.restful()
def api_passwdchange_bare():
    response.view = 'generic.json'
    def POST(pc_user):
        doc = POST.func_doc
        return_dict = dict(doc=doc)
        user_dict = {}
        logger.debug("pc_user: "+str(pc_user))
        if not auth.is_logged_in():
            msg = 'Cannot change password. User not logged'
            logger.debug(msg)
            raise HTTP(403, msg)
        
        table_user = auth.settings.table_user 
        logged_username = auth.user.username
        user = auth.db(table_user['username'] == logged_username).select().first()
        passfield = auth.settings.password_field

        #alg = 'pbkdf2(1000,20,sha512)'
        #old_passwd =  CRYPT(digest_alg=alg,salt=True)(pc_user['old_passwd'])[0]
        old_passwd = CRYPT(key=auth.settings.hmac_key)(pc_user['old_passwd'])[0]
        if user[passfield] != old_passwd:
            msg = 'Old password is not correct'
            return_dict['err_found'] = True
            return_dict['err_msg'] = "The old password is not correct"
            logger.debug("old password wrong")
            return gluon.contrib.simplejson.dumps(return_dict)

        if len(pc_user['passwd']) < 4:
            return_dict['err_found'] = True
            return_dict['err_msg'] = 'Password must have at least four characters'
            return gluon.contrib.simplejson.dumps(return_dict)

        logger.debug("changing password to :"+pc_user['passwd'])
        
        #new_passwd =  CRYPT(digest_alg=alg,salt=True)(pc_user['passwd'])[0]
        new_passwd =  CRYPT(key=auth.settings.hmac_key)(pc_user['passwd'])[0]

        user.update_record(**{passfield: new_passwd, 'registration_key': ''}) 

        return gluon.contrib.simplejson.dumps(return_dict)

    return locals()

from utils import web2py_uuid 
@request.restful()
def api_reqresetpasswd_bare():
    response.view = 'generic.json'
    def POST(rp_user):
        doc = POST.func_doc
        return_dict = dict(doc=doc)
        user_dict = {}

        logger.debug("rp_user: "+str(rp_user))

        user_mail = rp_user['mail']
        table_user = auth.settings.table_user
        user = auth.db(table_user.email == user_mail).select().first() 
        if not user:
            msg = 'Cannot reset password. Mail not registered'
            return_dict['err_found'] = True
            return_dict['err_msg'] = msg
            return gluon.contrib.simplejson.dumps(return_dict)
        elif user.registration_key in ['pending', 'disabled']: 
            msg = 'Cannot reset password. User registration pending or disabled'
            return_dict['err_found'] = True
            return_dict['err_msg'] = msg
            return gluon.contrib.simplejson.dumps(return_dict)
        
        reset_password_key = str(int(time.time()))+'-' + web2py_uuid() 
        
        # link = auth.url(auth.settings.function,
        #                 args=('reset_password',), 
        #                 vars={'key': reset_password_key}, 
        #                 scheme=True)
        # d = dict(user)
        # d.update(dict(key=reset_password_key, link=link))

        main_url = "http://"+str(request.env.http_host)+"/"+str(request.application)
        reset_msg = "Click on the link "+main_url+"/routes/#/logging/user_resetpasswd?key="+reset_password_key+" to reset your password"
        if auth.settings.mailer and auth.settings.mailer.send(
            to=user_mail,
            subject=auth.messages.reset_password_subject,
            message=reset_msg):
            # message=auth.messages.reset_password % d):
            user.update_record(reset_password_key=reset_password_key)
        else: 
            msg = 'Cannot complete the password reset request. Cannot send mail'
            return_dict['err_found'] = True
            return_dict['err_msg'] = msg
            return gluon.contrib.simplejson.dumps(return_dict)

        return gluon.contrib.simplejson.dumps(return_dict)

    return locals()

@request.restful()
def api_resetpasswd_bare():
    response.view = 'generic.json'
    def POST(rp_user):
        doc = POST.func_doc
        return_dict = dict(doc=doc)
        user_dict = {}

        logger.debug("rp_user: "+str(rp_user))

        user_passwd = rp_user['passwd']
        reset_password_key = rp_user['reset_key']
        t0 = int(reset_password_key.split('-')[0]) 
        if time.time()-t0 > 60*60*24: 
            msg = 'Cannot reset password. Password reset key expired!'+reset_password_key
            return_dict['err_found'] = True
            return_dict['err_msg'] = msg
            return gluon.contrib.simplejson.dumps(return_dict)

        table_user = auth.settings.table_user
        user = auth.db(table_user.reset_password_key == reset_password_key).select().first() 
        if not user:
            msg = 'Cannot reset password. Password reset key does not exist: '+reset_password_key
            return_dict['err_found'] = True
            return_dict['err_msg'] = msg
            return gluon.contrib.simplejson.dumps(return_dict)

        user.update_record(password=CRYPT(key=auth.settings.hmac_key)(rp_user['passwd'])[0],reset_password_key='')

        return gluon.contrib.simplejson.dumps(return_dict)

    return locals()

@request.restful()
def api_verify_bare():
    response.view = 'generic.json'
    def POST(registration_key):
        doc = POST.func_doc
        return_dict = dict(doc=doc)
        user_dict = {}

        table_user = auth.settings.table_user
        user = auth.db(table_user.registration_key == registration_key).select().first() 
        if not user:
            msg = 'Cannot verify mail. Registration key does not exist: '+registration_key
            return_dict['err_found'] = True
            return_dict['err_msg'] = msg
            return gluon.contrib.simplejson.dumps(return_dict)

        if auth.settings.registration_requires_approval: 
            user.update_record(registration_key = 'pending')
            return_dict['to_approve'] = True
        else:
            user.update_record(registration_key='')

        return gluon.contrib.simplejson.dumps(return_dict)

    return locals()
