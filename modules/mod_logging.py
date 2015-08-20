# Extract global variables (logger and auth for now)
# http://stackoverflow.com/questions/11959719/web2py-db-is-not-defined
from gluon import current
from pprint import pprint
import math

def get_groups(user_id=None , user_type='USER', size='ALL'):
    """
    Get the group dictionary.
    * DEFAULT (no parameters) - groups of currently logged user
    * specify user_id    =   <user_id> to get groups of that user
    * specify user_type !=   'USER' to mean all
    * specify size       =   <size> to get <size> random groups
    """
    logger = current.logger
    auth = current.auth

    # prepare tables
    table_user       = auth.table_user()
    table_membership = auth.table_membership()
    table_permission = auth.table_permission()
    table_group      = auth.db[auth.settings.table_group_name]

    if user_type == 'USER':
        if user_id:
            if not auth.db(table_user.id == user_id).select():
                raise HTTP(404, 'User_id not found. Cannot get the groups')
        else:
            if auth.is_logged_in():
                user_id = auth.user.id
            else:
                # returns empty dict since the user is not logged
                return dict()
#                raise HTTP(404, 'User not logged. Cannot select group for my user!')

    # init return dictionary of groups
    groups_dict = dict()

    # global infos initialization: if there is a group which can_create, it return can_create=True
    groups_dict['can_create'] = False
    groups_dict['web_admin']  = False

    # exclude groups which start with user_ (personal groups created by web2py, maybe better
    # to disable this groups creation at all
    group_table = auth.db(table_group.role[0:5] != 'user_')
    if size=='ALL':
        groups   = group_table.select(orderby=table_group.role)
    else:
        groups   = group_table.select(orderby='<random>',limitby=(0,int(size)))
    logger.debug("groups: "+str(groups))

    # find only groups of the user all groups
    if user_type == 'USER':
        memberships = auth.db(table_membership.user_id == user_id).select()
        group_ids = []
        for membership in memberships:
            group_ids.append(membership.group_id)
        groups = groups.find(lambda row: row.id in group_ids)

    # build the groups_dict dictionary
    n_groups = len(groups)
    groups_dict['n_groups'] = n_groups
    i_m = 0
    for group in groups:
        if group.role == "web_admin":
            groups_dict['web_admin'] = True
        groups_dict[i_m] = dict(role=group.role,id=group.id)

        n_members = auth.db(table_membership.group_id == group.id).count()
        groups_dict[i_m]['n_members'] = n_members

        permissions = auth.db(table_permission.group_id == group.id).select()
        groups_dict[i_m]['permissions'] = dict()
        groups_dict[i_m]['permission'] = list()
        n_total_permissions = len(permissions)
        n_permissions = 0
        for i_p in range(0,n_total_permissions):
            permission = permissions[i_p]
            if permission.name == 'create' and permission.table_name == 'datasets':
                groups_dict['can_create'] = True
                # andrebbe inizializzato a False ma tanto manca la chiave del tutto senno'
                groups_dict[i_m]['can_create'] = True  
            if permission.name == 'store' and permission.table_name == 'external':
                n_permissions += 1
                groups_dict[i_m]['permissions'][i_p] = dict(id='external',name='external',info='')
        	groups_dict[i_m]['permission'].append('external')
            if permission.name == 'store' and permission.table_name != 'external':
                n_permissions += 1
	        site_id = permission.table_name
                hs_row = db(db.hosting_sites.id == site_id).select().first()
                site_info = hs_row.description
                site_name = hs_row.name
                groups_dict[i_m]['permissions'][i_p] = dict(id=site_id,name=site_name,info=site_info)
        	groups_dict[i_m]['permission'].append(site_name)
        # conto solo i permessi store
        groups_dict[i_m]['permissions']['n_permissions'] = n_permissions

        logger.debug("groups_dict: "+str(groups_dict))
        i_m += 1

    return groups_dict

def slowerize_fun():
    logger = current.logger
    sum = 0.
    for i in range(0,10000000):
        sum += math.sin(float(i))
    logger.debug("sum: ",sum)