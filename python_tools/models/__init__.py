from .dependency import Dependency  
from .service import Service
from .team import Team
from .service_group import ServiceGroup
from ..common import get_something_from_label

import yaml


def is_volume_container(component_info, shared=False):
    return 'volumes' in component_info and shared

def load_teams_and_services(file_name, shared=False):
    """ Initialize Team.TEAM_LIST
    """
    docker_compose_fd = open(file_name)
    docker_compose_data = yaml.load(docker_compose_fd)

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
