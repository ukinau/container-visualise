import re
from .dependency import Dependency
from .service import Service
from .team import Team
from .service_group import ServiceGroup
from ..common import get_something_from_label
from collections import defaultdict
from copy import deepcopy
import yaml


def get_volume_containers(component_info, component):
    result = []
    if 'volumes_from' not in component_info:
        return set(result)
    for v in component_info['volumes_from']:
        if not re.search(r':', v):
            result.append((component, v))
    return set(result)

def clean_empty_super():  
    delete_team = []
    for team in Team.get_teams():
        delete_sg = []
        for sg in team.services:    
            if len(sg.children) == 0:
                delete_sg.append(sg)
        for del_sg in delete_sg:
            team.services.remove(del_sg)
        if len(team.services) == 0:
            delete_team.append(team)
    for del_tm in delete_team:
        Team.get_teams().remove(del_tm)

# Move volume container from normal group to special group
# which is named as Volumes
# <team>: [(sv, volume_container_name)]
def move_volumes_from_sg(team_volumes_map):
    i = 0;
    for team, c_name_set in team_volumes_map.iteritems():
        i += 1
        for sv_c_set in c_name_set:
            sv_from = sv_c_set[0]
            c_name = sv_c_set[1]
            sv = Service.find_service_by_name(c_name)
            if sv is None:
                print "not found service: %s" % c_name
                continue
            component_group_obj = ServiceGroup.create("Volumes"+str(i))
            team.add_service(component_group_obj)
            sv.parent.remove_child_by_key(sv.key)
            component_group_obj.add_chidren(sv)

            dep = Dependency(sv_from, sv)
            dep.set_instance_of_from(sv_from)
            dep.set_instance_of_to(sv)
            sv_from.dependencies.append(dep)
            sv.reffered_from.append(dep)

def load_teams_and_services(file_name, shared=False):
    """ Initialize Team.TEAM_LIST
    """
    docker_compose_fd = open(file_name)
    docker_compose_data = yaml.load(docker_compose_fd)

    team_volumes_map = defaultdict(set)

    for component_name, info in docker_compose_data['services'].iteritems():
        team = get_something_from_label(info, 'team', 'unassign')
        description = get_something_from_label(info, 'description')
        component_group = get_something_from_label(info, 'component')
        dependencies_list = get_something_from_label(info, 'depends')

        dependencies = Dependency.parse_depenencies(component_name, dependencies_list)
        team_obj = Team.create_team(team, shared_service_maintainer=shared)
        component_group_obj = ServiceGroup.create(component_group)
        team_obj.add_service(component_group_obj)
        component = Service.create_service(component_name, description, dependencies)
        component_group_obj.add_chidren(component)
        team_volumes_map[team_obj] |= get_volume_containers(info, component)

    move_volumes_from_sg(team_volumes_map)
    clean_empty_super()
