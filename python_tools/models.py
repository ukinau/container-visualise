import re
import yaml
from common import get_something_from_label




def is_volume_container(component_info, shared=False):
    return 'volumes' in component_info and shared

def load_teams_and_services(file_name, shared=False):
    """ Initialize Team.TEAM_LIST
    """
    docker_compose_fd = open(file_name)
    docker_compose_data = yaml.load(docker_compose_fd)

    for component_name, info in docker_compose_data['services'].iteritems():
        team = get_something_from_label(info, 'team')
        description = get_something_from_label(info, 'description')
        component_group = get_something_from_label(info, 'component')
        dependencies_list = get_something_from_label(info, 'depends')
        dependencies = Dependency.parse_depenencies(component_name, dependencies_list)

        team_obj = Team.create_team(team, shared_service_maintainer=shared)

        if is_volume_container(info, shared):
            component_group_obj = Service.create_service("Volumes", "", (), "component_group")
        else:
            component_group_obj = Service.create_service(component_group, "", (), "component_group")

        team_obj.add_service(component_group_obj)
        component = Service.create_service(component_name, description, dependencies)
        component_group_obj.add_chidren(component)

class Team(object):
  TEAM_LIST = list() 
  def __init__(self, name, shared_service_maintainer=False): 
      self.services = list()
      self.name = name
      self.description = ""
      self.shared_service_maintainer = shared_service_maintainer 
      self.wide_rate = 0
      self.key = None

  def add_service(self, service):
      if not self.check_duplicate(service):
          self.services.append(service)

  def check_duplicate(self, service):
      for sv in self.services:
          if sv is service:
              return True
      return False

  def __len__(self):
      result = 0
      for service in self.services:
          if service.children:
              result += len(service.children)
          else:
              result += 1
      return result

  def update_service_rate(self):
      all_service = len(self)
      for service in self.services:
          if service.children:
              service.wide_rate = float(
                  len(service.children))/all_service
          else:
              service.wide_rate = float(1)/all_service
              
  @classmethod
  def eliminate_team_from_list(cls, name):
      for i, team in enumerate(cls.TEAM_LIST):
          if team.name == name:
              return cls.TEAM_LIST.pop(i)
      return None

  @classmethod
  def get_teams_with_shared_service_maintainer(cls):
      result = list() 
      for team in cls.TEAM_LIST:
          if team.shared_service_maintainer:
              result.append(team) 
      return result

  @classmethod
  def find_team_by_name(cls, name):
      for team in cls.TEAM_LIST:
          if team.name == name:
              return team
      return None

  @classmethod
  def get_teams(cls):
      return cls.TEAM_LIST

  @classmethod
  def create_team(cls, name, shared_service_maintainer=False):
      team = Team.find_team_by_name(name)
      if not team:
          team = Team(name, shared_service_maintainer)
          Team.TEAM_LIST.append(team)
      return team

  @classmethod
  def get_relationship_of_all_teams(cls):
      result_array_link = []
      for team in cls.get_teams():
          for sc in team.services:
              for s in sc.children:
                  for dep in s.dependencies:
                      dep_s = dep.to_instance
                      result_array_link.append({'from': s.key, 'to': dep_s.key, 'from_name': s.name, 'to_name': dep_s.name, 'op': dep.operation, 'topics': dep.topics}) 
      return result_array_link
                     

class Service(object):
  SERVICE_TYPE_COMPONENT = "component"
  SERVICE_TYPE_COMPONENT_GROUP = "component-group"
  SERVICE_LIST = list()
  def __init__(self, name, description, dependencies, service_type="component"):
      self.name = name
      self.description = description
      self.dependencies = list()
      self.reffered_from = list()
      self.service_type = service_type

      if service_type == Service.SERVICE_TYPE_COMPONENT:
        self.children = None
        self.resolve_dependencies(dependencies)
      else:
        self.children = list()
      self.wide_rate = 0
      self.minimum_wide = 0
      self.key = len(Service.SERVICE_LIST)
      Service.SERVICE_LIST.append(self)


  def add_chidren(self, service):
      self.children.append(service)

  def add_reffered_from(self, service):
      self.reffered_from.append(service)

  def resolve_dependencies(self, dependencies):
      for dependency in dependencies:
          service = Service.find_service_by_name(dependency._to)
          if not service:
              service = Service.create_service(dependency._to, "", ())
          dependency.set_instance_of_to(service)
          dependency.set_instance_of_from(self)
          service.add_reffered_from(dependency)
          self.dependencies.append(dependency)

  def most_longname_service(self):
      most_long = self
      if self.children:
          for s in self.children:
              if len(s.name) > len(most_long.name): 
                  most_long = s
      return most_long

  @classmethod
  def find_service_by_name(cls, name,
                           service_type=SERVICE_TYPE_COMPONENT):
      for service in cls.SERVICE_LIST:
          if service.name == name and\
              service.service_type == service_type:
              return service
      return None

  
  @classmethod
  def create_service(cls,  name, description, dependencies, service_type="component"):
      service = Service.find_service_by_name(name, service_type)
      if service:
          service.description = description
          service.resolve_dependencies(dependencies)
      else:
          service = Service(name, description, dependencies, service_type)
      return service 

class Dependency():

    def __init__(self, _from, _to, opts = None):
        self._to = _to
        self._from = _from
        self.operation = None
        self.topics = []
        if opts:
            self.operation = opts['op']
            self.topics = opts['topics']

    def set_instance_of_to(self, service):
        self.to_instance = service

    def set_instance_of_from(self, service):
        self.from_instance = service

    # COMPONENT:OP(TOPIC1)(TOPIC2)
    @classmethod
    def parse_depenencies_op_topic(cls, dependencies_str):
        splited = dependencies_str.split(':')
        stripped_component = ":".join(splited[1:])
        if len(stripped_component) == 1:
            return (None, None)
        op_array = re.findall(r'(^.*?)\(', stripped_component)
        if len(op_array) == 0:
            return (None, None)
        op = op_array[0]
        topics = re.findall(r'\((.*?)\)', stripped_component)
        if op and len(topics) > 0:
            return (op, topics)
        else:
            return (None, None)

    @classmethod
    def parse_depenencies(cls, src, dependencies_str):
        dependencies = list()
        dependencies_str = dependencies_str.replace('\n', ' ')
        for dep_definition in dependencies_str.split(' '): 
            if dep_definition != ' ' and dep_definition != '':
                dep_name = dep_definition.split(':')[0]
                op, topics = Dependency.parse_depenencies_op_topic(dep_definition)
                if op and topics:
                    dep = Dependency(src, dep_name, {'op': op, 'topics': topics})
                else:
                    dep = Dependency(src, dep_name)
                dependencies.append(dep) 
        return dependencies
